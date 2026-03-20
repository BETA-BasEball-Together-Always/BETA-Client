import React, { useState, useEffect, useMemo } from "react";
import { Image, StyleSheet } from "react-native";
import { TouchableOpacity, View } from "react-native";
import { AppText } from "../../../../../shared/theme/components/AppText";
import CommunityUserProfile from "../../../../community/component/CommunityUserProfile";

import { useTogglePostEmotionMutation } from "../../../../community/services/emotionMutations";
import { toUiEmotionType } from "../../../../community/utils/emotionTypeMap";
import { getUserEmotionSelection } from "../../../../community/store/userEmotionSelectionStore";

import PostReactions from "../../../../community/component/PostReactions";
import { useNavigation } from "@react-navigation/native";

const PopularPostCard = ({ post }) => {
  const navigation = useNavigation();

  const [selectedEmotionType, setSelectedEmotionType] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const toggleEmotionMutation = useTogglePostEmotionMutation(post.postId, {
    onSuccess: (data) => {
      setSelectedEmotionType(
        data.toggled ? toUiEmotionType(data.emotionType) : null,
      );
    },
  });

  useEffect(() => {
    const stored = getUserEmotionSelection(post.postId);
    if (stored !== undefined) setSelectedEmotionType(stored);
  }, [post.postId]);

  const reactionPost = useMemo(
    () => ({
      ...post,
      id: post.postId,
      comments: post.commentCount,
      reactionCounts: {
        EMO_JOY: post.emotions?.likeCount ?? 0,
        EMO_SAD: post.emotions?.sadCount ?? 0,
        EMO_FUN: post.emotions?.funCount ?? 0,
        EMO_HYPE: post.emotions?.hypeCount ?? 0,
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

  return (
    <TouchableOpacity style={styles.card} onPress={handlePressPost}>
      <View style={styles.header}>
        <CommunityUserProfile
          nickname={post.author?.nickname}
          teamCode={post.author?.teamCode}
          createdAt={post.createdAt}
          showTeam={true}
        />
      </View>

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
        onSelectReaction={(_, reaction) => {
          if (!reaction) return;
          toggleEmotionMutation.mutate({ emotionType: reaction.id });
        }}
      />
    </TouchableOpacity>
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
