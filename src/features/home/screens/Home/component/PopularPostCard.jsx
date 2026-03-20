import React, { useMemo, useState } from "react";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { AppText } from "../../../../../shared/theme/components/AppText";
import CommunityUserProfile from "../../../../community/component/CommunityUserProfile";
import { useUserStore } from "../../../../../shared/store/userStore";

import { useTogglePostEmotionMutation } from "../../../../community/services/emotionMutations";
import { useUserEmotionSelection } from "../../../../community/store/userEmotionSelectionStore";
import { useDeletePostMutation } from "../../../../community/services/post/deletePostMutation";

import PostReactions from "../../../../community/component/PostReactions";
import { useNavigation } from "@react-navigation/native";

const PopularPostCard = ({ post }) => {
  const navigation = useNavigation();
  const { user: currentUser } = useUserStore();
  const deletePostMutation = useDeletePostMutation();

  const authorUserId = post?.author?.userId;
  const isOwnPost =
    currentUser?.id != null &&
    authorUserId != null &&
    String(currentUser.id) === String(authorUserId);

  const postMenu = authorUserId
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
                      Alert.alert(
                        "오류",
                        e?.response?.data?.message ?? "삭제에 실패했습니다.",
                      );
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

  const selectedEmotionType = normalizeEmotionType(
    useUserEmotionSelection(post.postId),
  );

  const toggleEmotionMutation = useTogglePostEmotionMutation(post.postId);

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

  const primaryImageUri = post?.images?.[0]?.imageUrl || null;

  const handlePressPost = () => {
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
      <View style={styles.header}>
        <CommunityUserProfile
          nickname={post.author?.nickname}
          teamCode={post.author?.teamCode}
          createdAt={post.createdAt}
          showTeam={post.channel === "ALL"}
          onPress={handlePressProfile}
          postMenu={postMenu}
        />
      </View>

      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={handlePressPost}
        activeOpacity={0.8}
      >
        {primaryImageUri && (
          <Image source={{ uri: primaryImageUri }} style={styles.image} />
        )}

        <AppText
          variant="smallRegular"
          numberOfLines={expanded ? undefined : 3}
          ellipsizeMode="tail"
          style={styles.content}
          onTextLayout={(e) => {
            if (e.nativeEvent.lines.length > 3) setShowMore(true);
          }}
        >
          {post.content}
        </AppText>

        {showMore && !expanded && (
          <TouchableOpacity onPress={handlePressPost}>
            <AppText variant="labelSmall" style={styles.moreText}>
              ...더보기
            </AppText>
          </TouchableOpacity>
        )}

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
});
