import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AppText } from "../../../../shared/theme/components/AppText";

import PostReactions from "../PostReactions";
import { useTogglePostEmotionMutation } from "../../services/emotionMutations";
import { useUserEmotionSelection } from "../../store/userEmotionSelectionStore";
import CommunityUserProfile from "../CommunityUserProfile";
import { useUserStore } from "../../../../shared/store/userStore";
import { useDeletePostMutation } from "../../services/post/deletePostMutation";
import { getApiErrorMessage } from "../../../../shared/utils/apiErrorMessage";
import {
  DELETED_POST_MESSAGE,
  getActiveHashtagLabels,
  getActivePostImages,
  getPostListUnavailableBody,
} from "../../utils/communityPostVisibility";
import { useSoftDeletedPostStore } from "../../store/softDeletedPostStore";

const PostCard = ({ post, showTeam = false }) => {
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

  const { author } = post;
  const authorUserId = author?.userId;

  const isOwnPost =
    currentUser?.id != null &&
    authorUserId != null &&
    String(currentUser.id) === String(authorUserId);

  const postMenu =
    !showAsUnavailable && authorUserId
      ? isOwnPost
        ? {
            isOwnPost: true,
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
                    deletePostMutation.mutate(post.postId, {
                      onError: (e) => {
                        const msg = getApiErrorMessage(e, "삭제에 실패했습니다.");
                        setTimeout(() => {
                          Alert.alert("오류", msg);
                        }, 0);
                      },
                    });
                  },
                },
              ]);
            },
            onReport: () => {},
          }
        : {
            isOwnPost: false,
            onEdit: () => {},
            onDelete: () => {},
            onReport: () => {
              Alert.alert("알림", "신고 기능은 준비 중입니다.");
            },
          }
      : undefined;

  const normalizeEmotionType = (t) =>
    ["LIKE", "SAD", "FUN", "HYPE"].includes(t) ? t : null;

  const storeEmotion = useUserEmotionSelection(post.postId);
  const selectedEmotionType =
    storeEmotion !== undefined
      ? normalizeEmotionType(storeEmotion)
      : normalizeEmotionType(post.myEmotion ?? post.myEmotionType);

  const toggleEmotionMutation = useTogglePostEmotionMutation(post.postId);

  const isDeletingThis =
    deletePostMutation.isPending &&
    deletePostMutation.variables === post.postId;

  const contentWithoutHashtags = useMemo(() => {
    if (showAsUnavailable) return "";
    const raw = post?.content ?? "";
    const removed = raw.replace(/(^|\s)#[^\s#]+/g, " ");
    return removed.replace(/\s+/g, " ").trim();
  }, [post?.content, showAsUnavailable]);

  const activeImages = useMemo(
    () => getActivePostImages(post),
    [post],
  );
  const primaryImageUri =
    activeImages[0]?.imageUrl || activeImages[0]?.url || null;

  const hashtagLabels = useMemo(
    () => getActiveHashtagLabels(post),
    [post],
  );

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

  const handlePressCard = () => {
    if (showAsUnavailable) {
      setTimeout(() => {
        Alert.alert("알림", listUnavailableBody ?? DELETED_POST_MESSAGE);
      }, 0);
      return;
    }
    navigation.navigate("Community", {
      screen: "PostDetail",
      params: { post, initialSelectedEmotionType: selectedEmotionType },
    });
  };

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
      id: post.postId,
      comments: post.commentCount,
      reactionCounts: {
        LIKE: post.emotions?.likeCount ?? 0,
        SAD: post.emotions?.sadCount ?? 0,
        FUN: post.emotions?.funCount ?? 0,
        HYPE: post.emotions?.hypeCount ?? 0,
      },
    }),
    [post],
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
        />
      </View>

      <TouchableOpacity
        style={styles.bodyPressable}
        activeOpacity={0.8}
        onPress={handlePressCard}
      >
        <View style={styles.contentSection}>
          <AppText
            variant="caption"
            style={[
              styles.contentText,
              showAsUnavailable && styles.unavailableText,
            ]}
          >
            {showAsUnavailable
              ? (listUnavailableBody ?? DELETED_POST_MESSAGE)
              : contentWithoutHashtags}
          </AppText>

          {!showAsUnavailable && hashtagLabels.length > 0 && (
            <View style={styles.hashRow}>
              <AppText variant="caption" style={styles.hashText}>
                {hashtagLabels.map((tag) => `#${tag}`).join(" ")}
              </AppText>
            </View>
          )}

          {!showAsUnavailable && primaryImageUri ? (
            <Image source={{ uri: primaryImageUri }} style={styles.image} />
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
            onCommentPress={handlePressCard}
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
  image: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
  contentSection: {
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  contentText: {
    color: "#F9F9F9",
    lineHeight: 19,
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
