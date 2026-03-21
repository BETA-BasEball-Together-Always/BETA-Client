import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { AppText } from "../../../../../shared/theme/components/AppText";
import CommunityUserProfile from "../../../../community/component/CommunityUserProfile";
import { useUserStore } from "../../../../../shared/store/userStore";

import { useTogglePostEmotionMutation } from "../../../../community/services/emotionMutations";
import { useUserEmotionSelection } from "../../../../community/store/userEmotionSelectionStore";
import { useDeletePostMutation } from "../../../../community/services/post/deletePostMutation";

import PostReactions from "../../../../community/component/PostReactions";
import { isAllChannelPost } from "../../../../community/utils/communityChannel";
import { getApiErrorMessage } from "../../../../../shared/utils/apiErrorMessage";
import {
  DELETED_POST_MESSAGE,
  getActivePostImages,
  getPostListUnavailableBody,
} from "../../../../community/utils/communityPostVisibility";
import { useSoftDeletedPostStore } from "../../../../community/store/softDeletedPostStore";
import { useNavigation } from "@react-navigation/native";

const PopularPostCard = ({ post }) => {
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

  const authorUserId = post?.author?.userId;
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
                        setTimeout(() => Alert.alert("오류", msg), 0);
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

  const [showMore, setShowMore] = useState(false);
  const [expanded, setExpanded] = useState(false);

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

  const primaryImageUri = useMemo(() => {
    const first = getActivePostImages(post)[0];
    return first?.imageUrl || first?.url || null;
  }, [post]);

  const handlePressPost = () => {
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
    const targetUserId = post?.author?.userId;
    if (!targetUserId) return;

    const isSelf =
      currentUser?.id != null &&
      String(currentUser.id) === String(targetUserId);

    navigation.navigate("Main", {
      screen: "Profile",
      params: isSelf
        ? {}
        : {
            screen: "ProfileMain",
            params: { userId: targetUserId },
          },
    });
  };

  return (
    <View style={styles.card}>
      {isDeletingThis && (
        <View style={styles.deletingOverlay}>
          <ActivityIndicator color="#F9F9F9" />
          <AppText variant="labelSmall" style={styles.deletingText}>
            게시글을 삭제하고 있어요
          </AppText>
        </View>
      )}
      <View style={styles.header}>
        <CommunityUserProfile
          nickname={post.author?.nickname}
          teamCode={post.author?.teamCode}
          createdAt={post.createdAt}
          showTeam={isAllChannelPost(post.channel)}
          onPress={handlePressProfile}
          postMenu={postMenu}
        />
      </View>

      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={handlePressPost}
        activeOpacity={0.8}
      >
        {!showAsUnavailable && primaryImageUri ? (
          <Image source={{ uri: primaryImageUri }} style={styles.image} />
        ) : null}

        <AppText
          variant="smallRegular"
          numberOfLines={expanded ? undefined : 3}
          ellipsizeMode="tail"
          style={[styles.content, showAsUnavailable && styles.unavailableText]}
          onTextLayout={(e) => {
            if (e.nativeEvent.lines.length > 3) setShowMore(true);
          }}
        >
          {showAsUnavailable
            ? (listUnavailableBody ?? DELETED_POST_MESSAGE)
            : post.content}
        </AppText>

        {!showAsUnavailable && showMore && !expanded && (
          <TouchableOpacity onPress={handlePressPost}>
            <AppText variant="labelSmall" style={styles.moreText}>
              ...더보기
            </AppText>
          </TouchableOpacity>
        )}

        {!showAsUnavailable ? (
          <PostReactions
            post={reactionPost}
            selectedEmotionType={selectedEmotionType}
            isEmotionPending={toggleEmotionMutation.isPending}
            onToggleEmotion={(_postId, emotionType) => {
              if (!emotionType) return;
              toggleEmotionMutation.mutate({ emotionType });
            }}
            onSelectReaction={(_, reaction) => {
              if (!reaction) return;
              toggleEmotionMutation.mutate({
                emotionType: reaction.id,
              });
            }}
          />
        ) : null}
      </TouchableOpacity>
    </View>
  );
};

export default PopularPostCard;

const styles = StyleSheet.create({
  card: {
    width: 235,
    height: 285,
    backgroundColor: "rgba(63, 63, 63, 0.30)",
    borderRadius: 20,
    marginRight: 8,
    padding: 10,
    marginBottom: 25,
    position: "relative",
    overflow: "hidden",
  },
  deletingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 8,
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  deletingText: {
    color: "#F9F9F9",
    marginTop: 8,
    textAlign: "center",
  },
  header: {
    marginBottom: 6,
  },
  nickname: {
    color: "#FFF",
    fontWeight: "700",
  },
  image: {
    width: "100%",
    height: 140,
    borderRadius: 10,
    marginVertical: 6,
  },
  content: {
    color: "#F9F9F9",
    flex: 1,
    marginBottom: 6,
  },
  moreText: {
    color: "rgba(228, 228, 228, 0.50)",
  },
  unavailableText: {
    color: "rgba(228, 228, 228, 0.55)",
  },
});
