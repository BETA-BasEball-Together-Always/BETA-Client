import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AppText } from "../../../../shared/theme/components/AppText";

import PostReactions from "../PostReactions";
import {
  resolveCommunityPostId,
  resolveSelectedEmotionForPost,
} from "../../constants/communityReactions";
import { useTogglePostEmotionMutation } from "../../services/emotionMutations";
import { useUserEmotionSelection } from "../../store/userEmotionSelectionStore";
import CommunityUserProfile from "../CommunityUserProfile";
import { useUserStore } from "../../../../shared/store/userStore";
import { useDeletePostMutation } from "../../services/post/deletePostMutation";
import { getApiErrorMessage } from "../../../../shared/utils/apiErrorMessage";
import { isOfflineError } from "../../../../shared/utils/networkErrors";
import {
  DELETED_POST_MESSAGE,
  getActivePostImages,
  getPostListUnavailableBody,
} from "../../utils/communityPostVisibility";
import { stripPhotoOnlyPlaceholderForDisplay } from "../../utils/photoOnlyPostPlaceholder";
import { useSoftDeletedPostStore } from "../../store/softDeletedPostStore";
import { withImageDisplayCacheKey } from "../../utils/imageDisplayUri";

const PostCard = ({
  post,
  showTeam = false,
  stabilizeBodyMeasure = false,
  profileCommentHighlight = false,
}) => {
  const navigation = useNavigation();
  const { user: currentUser } = useUserStore();
  const deletePostMutation = useDeletePostMutation();
  const tombstoned = useSoftDeletedPostStore((s) => {
    const exp = s.entries[String(post?.postId)];
    return typeof exp === "number" && exp > Date.now();
  });
  const listUnavailableBody = useMemo(
    () => getPostListUnavailableBody(post, { tombstoned }),
    [post, tombstoned],
  );
  const showAsUnavailable = listUnavailableBody != null;

  const resolvedPostId = resolveCommunityPostId(post);

  const { author } = post;
  const authorUserId = author?.userId;

  const isOwnPost =
    currentUser?.id != null &&
    authorUserId != null &&
    String(currentUser.id) === String(authorUserId);

  const postMenu =
    !showAsUnavailable && isOwnPost && authorUserId != null
      ? {
          onEdit: () => {
            navigation.navigate("Community", {
              screen: "CreatePost",
              params: { editPost: post },
            });
          },
          onDelete: () => {
            Alert.alert("게시글 삭제", "이 게시글을 삭제할까요?", [
              { text: "취소", style: "cancel" },
              {
                text: "삭제",
                style: "destructive",
                onPress: () => {
                  deletePostMutation.mutate(resolvedPostId, {
                    onError: (e) => {
                      if (isOfflineError(e)) return;
                      const msg = getApiErrorMessage(e, "삭제에 실패했습니다.");
                      if (msg == null) return;
                      setTimeout(() => {
                        Alert.alert("오류", msg);
                      }, 0);
                    },
                  });
                },
              },
            ]);
          },
        }
      : undefined;

  const storeEmotion = useUserEmotionSelection(resolvedPostId);
  const selectedEmotionType = useMemo(
    () => resolveSelectedEmotionForPost(post, storeEmotion),
    [post, storeEmotion],
  );

  const toggleEmotionMutation = useTogglePostEmotionMutation(resolvedPostId);

  const isDeletingThis =
    deletePostMutation.isPending &&
    deletePostMutation.variables === resolvedPostId;

  const displayContent = useMemo(() => {
    if (showAsUnavailable) return "";
    return stripPhotoOnlyPlaceholderForDisplay(post?.content ?? "");
  }, [post?.content, showAsUnavailable]);

  const activeImages = useMemo(() => getActivePostImages(post), [post]);
  const primaryImageRow = activeImages[0];
  const extraImageCount = Math.max((activeImages?.length ?? 0) - 1, 0);
  const primaryImageUri =
    primaryImageRow?.imageUrl || primaryImageRow?.url || null;
  const primaryImageStableKey =
    primaryImageRow?.imageId ?? primaryImageRow?.id ?? primaryImageUri;

  const primaryImageDisplayUri = useMemo(
    () =>
      primaryImageUri
        ? withImageDisplayCacheKey(
            primaryImageUri,
            `${resolvedPostId}-${primaryImageStableKey}`,
          )
        : null,
    [primaryImageUri, resolvedPostId, primaryImageStableKey],
  );

  const renderContentWithHighlightedHashtags = useMemo(() => {
    if (typeof displayContent !== "string" || displayContent.length === 0) {
      return displayContent;
    }
    const regex = /#[^\s#]+/g;
    const nodes = [];
    let lastIndex = 0;
    let match;
    let segIdx = 0;

    while ((match = regex.exec(displayContent)) != null) {
      const start = match.index;
      const token = match[0];
      if (start > lastIndex) {
        nodes.push(
          <AppText
            key={`t-${segIdx++}-${lastIndex}`}
            variant="caption"
            style={styles.contentInline}
          >
            {displayContent.slice(lastIndex, start)}
          </AppText>,
        );
      }
      nodes.push(
        <AppText
          key={`h-${segIdx++}-${start}`}
          variant="caption"
          style={styles.hashText}
        >
          {token}
        </AppText>,
      );
      lastIndex = start + token.length;
    }

    if (lastIndex < displayContent.length) {
      nodes.push(
        <AppText
          key={`t-${segIdx++}-${lastIndex}`}
          variant="caption"
          style={styles.contentInline}
        >
          {displayContent.slice(lastIndex)}
        </AppText>,
      );
    }

    return nodes;
  }, [displayContent]);

  const logicalLineCount = useMemo(() => {
    if (typeof displayContent !== "string" || displayContent.length === 0) {
      return 0;
    }
    return displayContent.split("\n").length;
  }, [displayContent]);

  const [bodyLineCount, setBodyLineCount] = useState(null);
  const bodySectionWidthRef = useRef(null);
  const bodyNeedsMore =
    !showAsUnavailable &&
    (logicalLineCount > 3 || (bodyLineCount != null && bodyLineCount > 3));

  const shouldClampToThreeLines =
    !showAsUnavailable &&
    (logicalLineCount > 3 || (bodyLineCount != null && bodyLineCount > 3));

  useEffect(() => {
    bodySectionWidthRef.current = null;
    setBodyLineCount(null);
  }, [post?.postId, displayContent]);

  const reactionCounts = useMemo(() => {
    const emotions = post.emotions ?? {};
    return {
      LIKE: emotions.likeCount ?? 0,
      SAD: emotions.sadCount ?? 0,
      FUN: emotions.funCount ?? 0,
      HYPE: emotions.hypeCount ?? 0,
    };
  }, [post.emotions]);

  const totalReactions = useMemo(
    () => Object.values(reactionCounts).reduce((sum, v) => sum + v, 0),
    [reactionCounts],
  );

  const openPostDetail = (focusCommentInput = false) => {
    if (showAsUnavailable) {
      setTimeout(() => {
        Alert.alert("알림", listUnavailableBody ?? DELETED_POST_MESSAGE);
      }, 0);
      return;
    }
    navigation.navigate("Community", {
      screen: "PostDetail",
      params: {
        post,
        initialSelectedEmotionType: selectedEmotionType,
        ...(focusCommentInput ? { focusCommentInput: true } : {}),
      },
    });
  };

  const handlePressCard = () => openPostDetail(false);

  const handleCommentPress = () => openPostDetail(true);

  const handlePressProfile = () => {
    if (!authorUserId) return;

    const isSelf =
      currentUser?.id != null &&
      String(currentUser.id) === String(authorUserId);

    navigation.navigate("Main", {
      screen: "Profile",
      params: isSelf
        ? {}
        : {
            screen: "ProfileMain",
            params: { userId: authorUserId },
          },
    });
  };

  const reactionPost = useMemo(
    () => ({
      ...post,
      postId: resolvedPostId ?? post.postId ?? post.id,
      id: resolvedPostId ?? post.postId ?? post.id,
      comments: post.commentCount,
      reactionCounts: {
        LIKE: post.emotions?.likeCount ?? 0,
        SAD: post.emotions?.sadCount ?? 0,
        FUN: post.emotions?.funCount ?? 0,
        HYPE: post.emotions?.hypeCount ?? 0,
      },
    }),
    [post, resolvedPostId],
  );

  const handleSelectReaction = (_postId, reaction) => {
    if (!reaction) return;

    toggleEmotionMutation.mutate({
      emotionType: reaction.id,
    });
  };

  return (
    <View style={styles.container}>
      {isDeletingThis && (
        <View style={styles.deletingOverlay}>
          <ActivityIndicator color="#F9F9F9" />
          <AppText variant="caption" style={styles.deletingText}>
            게시글을 삭제하고 있어요
          </AppText>
        </View>
      )}
      <View style={styles.authorRow}>
        <CommunityUserProfile
          nickname={author?.nickname}
          teamCode={author?.teamCode}
          createdAt={post?.createdAt}
          showTeam={showTeam}
          onPress={handlePressProfile}
          postMenu={postMenu}
          feedList
        />
      </View>

      <TouchableOpacity
        style={styles.bodyPressable}
        activeOpacity={0.8}
        onPress={handlePressCard}
      >
        <View
          style={styles.contentSection}
          onLayout={
            stabilizeBodyMeasure
              ? (e) => {
                  const w = Math.round(e.nativeEvent.layout.width);
                  if (w <= 0) return;
                  const prev = bodySectionWidthRef.current;
                  bodySectionWidthRef.current = w;
                  /* 첫 너비 확정 시에는 줄 수를 지우지 않음 — onTextLayout이 먼저 오면 더보기가 영구히 사라짐 */
                  if (prev != null && prev !== w) {
                    setBodyLineCount(null);
                  }
                }
              : undefined
          }
        >
          <AppText
            variant="caption"
            numberOfLines={shouldClampToThreeLines ? 3 : undefined}
            ellipsizeMode="tail"
            onTextLayout={(e) => {
              if (bodyLineCount !== null) return;
              setBodyLineCount(e.nativeEvent.lines.length);
            }}
            style={[
              styles.contentText,
              showAsUnavailable && styles.unavailableText,
            ]}
          >
            {showAsUnavailable
              ? (listUnavailableBody ?? DELETED_POST_MESSAGE)
              : renderContentWithHighlightedHashtags}
          </AppText>

          {bodyNeedsMore ? (
            <TouchableOpacity
              onPress={handlePressCard}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 8, right: 8 }}
            >
              <AppText variant="labelSmall" style={styles.moreLink}>
                ...더보기
              </AppText>
            </TouchableOpacity>
          ) : null}

          {/* 해시태그는 본문 내에서 inline으로 초록색 처리 */}

          {!showAsUnavailable && primaryImageDisplayUri ? (
            <View style={styles.imageFrame}>
              <Image
                key={`${resolvedPostId}-${primaryImageStableKey}`}
                source={{ uri: primaryImageDisplayUri }}
                style={styles.image}
                resizeMode="cover"
              />
              {extraImageCount > 0 ? (
                <View style={styles.imageCountBadge} pointerEvents="none">
                  <AppText
                    variant="numMediumRegular"
                    style={styles.imageCountBadgeText}
                  >
                    +{extraImageCount}
                  </AppText>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        {!showAsUnavailable ? (
          <PostReactions
            post={reactionPost}
            selectedEmotionType={selectedEmotionType}
            isEmotionPending={toggleEmotionMutation.isPending}
            onToggleEmotion={(_postId, emotionType) => {
              if (!emotionType) return;
              toggleEmotionMutation.mutate({ emotionType });
            }}
            onSelectReaction={handleSelectReaction}
            onCommentPress={handleCommentPress}
            profileCommentHighlight={profileCommentHighlight}
            suppressCommentModeToggle
          />
        ) : null}
      </TouchableOpacity>
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    position: "relative",
    padding: 2,
  },
  deletingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 8,
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  deletingText: {
    color: "#F9F9F9",
    marginTop: 8,
    textAlign: "center",
  },
  authorRow: {
    marginBottom: 4,
    width: "100%",
  },
  bodyPressable: {
    flex: 1,
  },
  imageFrame: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageCountBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 6,
    paddingVertical: 1.8,
    borderRadius: 20,
    minWidth: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  imageCountBadgeText: {
    color: "#EAEAEA",
    lineHeight: 16,
  },
  contentSection: {
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  contentText: {
    color: "#F9F9F9",
    lineHeight: 19,
  },
  contentInline: {
    fontSize: 15,
    lineHeight: 19,
    color: "#F9F9F9",
  },
  moreLink: {
    color: "rgba(228, 228, 228, 0.5)",
    marginTop: 4,
    lineHeight: 16.3,
  },
  unavailableText: {
    color: "rgba(228, 228, 228, 0.55)",
  },
  hashRow: {
    marginTop: 6,
  },
  hashText: {
    color: "#6F9D48",
    lineHeight: 19,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginRight: 10,
  },
});
