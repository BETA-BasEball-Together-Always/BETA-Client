import React, { useMemo } from "react";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AppText } from "../../../../shared/theme/components/AppText";

import PostReactions from "../PostReactions";
import { useTogglePostEmotionMutation } from "../../services/emotionMutations";
import { useUserEmotionSelection } from "../../store/userEmotionSelectionStore";
import CommunityUserProfile from "../CommunityUserProfile";
import { useUserStore } from "../../../../shared/store/userStore";
import { useDeletePostMutation } from "../../services/post/deletePostMutation";

const PostCard = ({ post, showTeam = false }) => {
  const navigation = useNavigation();
  const { user: currentUser } = useUserStore();
  const deletePostMutation = useDeletePostMutation();
  const { author } = post;
  const authorUserId = author?.userId;

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

  const normalizeEmotionType = (t) =>
    ["LIKE", "SAD", "FUN", "HYPE"].includes(t) ? t : null;

  const selectedEmotionType = normalizeEmotionType(
    useUserEmotionSelection(post.postId),
  );

  const toggleEmotionMutation = useTogglePostEmotionMutation(post.postId);

  const contentWithoutHashtags = useMemo(() => {
    const raw = post?.content ?? "";
    // 본문에서 "#태그" 토큰 제거 (공백 기준), 남은 텍스트만 표시
    const removed = raw.replace(/(^|\s)#[^\s#]+/g, " ");
    return removed.replace(/\s+/g, " ").trim();
  }, [post?.content]);

  const primaryImageUri =
    post?.images?.[0]?.imageUrl || post?.images?.[0]?.url || null;

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
          <AppText variant="caption" style={styles.contentText}>
            {contentWithoutHashtags}
          </AppText>

          {post.hashtags?.length > 0 && (
            <View style={styles.hashRow}>
              <AppText variant="caption" style={styles.hashText}>
                {post.hashtags.map((tag) => `#${tag}`).join(" ")}
              </AppText>
            </View>
          )}

          {primaryImageUri && (
            <Image source={{ uri: primaryImageUri }} style={styles.image} />
          )}
        </View>

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
      </TouchableOpacity>
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
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
