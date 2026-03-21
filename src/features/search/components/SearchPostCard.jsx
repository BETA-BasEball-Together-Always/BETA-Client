import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import PostReactions from "@features/community/component/PostReactions";
import CommunityUserProfile from "@features/community/component/CommunityUserProfile";
import { useTogglePostEmotionMutation } from "@features/community/services/emotionMutations";
import { useUserEmotionSelection } from "@features/community/store/userEmotionSelectionStore";
import { AppText } from "@shared/theme/components/AppText";

const renderHighlightedSnippet = (snippet) => {
  if (!snippet) {
    return null;
  }

  return snippet
    .split(/(<em>.*?<\/em>)/g)
    .filter(Boolean)
    .map((segment, index) => {
      const isHighlighted =
        segment.startsWith("<em>") && segment.endsWith("</em>");
      const text = segment.replace(/<\/?em>/g, "");

      return (
        <Text
          key={`${text}-${index}`}
          style={isHighlighted ? styles.highlightText : styles.snippetText}
        >
          {text}
        </Text>
      );
    });
};

const SearchPostCard = ({ post }) => {
  const navigation = useNavigation();
  const [localEmotions, setLocalEmotions] = useState(post?.emotions ?? {});
  const selectedEmotionFromStore = useUserEmotionSelection(post?.postId);
  const selectedEmotionType =
    selectedEmotionFromStore ?? (post?.hasLiked ? "LIKE" : null);
  const toggleEmotionMutation = useTogglePostEmotionMutation(post?.postId, {
    onSuccess: (data) => {
      if (data?.emotions) {
        setLocalEmotions(data.emotions);
      }
    },
  });
  const imageUrls = post.imageUrls ?? [];
  const hashtagText =
    post.hashtags?.length > 0
      ? post.hashtags.map((tag) => `#${tag}`).join(" ")
      : null;

  useEffect(() => {
    setLocalEmotions(post?.emotions ?? {});
  }, [post?.postId, post?.emotions]);

  const handlePressPost = () => {
    if (!post?.postId) {
      return;
    }

    navigation.navigate("Community", {
      screen: "PostDetail",
      params: { postId: post.postId },
    });
  };

  const handlePressProfile = () => {
    if (!post?.author?.userId) {
      return;
    }

    navigation.navigate("Main", {
      screen: "Profile",
      params: {
        screen: "ProfileMain",
        params: { userId: post.author.userId },
      },
    });
  };

  const reactionPost = {
    ...post,
    id: post.postId,
    comments: post.commentCount,
    reactionCounts: {
      LIKE: localEmotions?.likeCount ?? 0,
      SAD: localEmotions?.sadCount ?? 0,
      FUN: localEmotions?.funCount ?? 0,
      HYPE: localEmotions?.hypeCount ?? 0,
    },
    emotions: localEmotions,
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.authorRow}>
          <CommunityUserProfile
            createdAt={post.createdAt}
            nickname={post.author?.nickname}
            onPress={handlePressProfile}
            showTeam
            teamCode={post.author?.teamCode}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          onPress={handlePressPost}
          style={styles.bodyPressable}
        >
          <View style={styles.contentSection}>
            <Text numberOfLines={4} style={styles.snippetWrapper}>
              {renderHighlightedSnippet(post.snippet)}
            </Text>

            {hashtagText ? (
              <AppText
                numberOfLines={2}
                variant="caption"
                style={styles.hashText}
              >
                {hashtagText}
              </AppText>
            ) : null}
          </View>
        </TouchableOpacity>

        {imageUrls.length === 1 ? (
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={handlePressPost}
            style={styles.imagePressable}
          >
            <Image source={{ uri: imageUrls[0] }} style={styles.singleImage} />
          </TouchableOpacity>
        ) : null}

        {imageUrls.length > 1 ? (
          <ScrollView
            contentContainerStyle={styles.galleryContent}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {imageUrls.map((imageUrl, index) => (
              <TouchableOpacity
                activeOpacity={0.82}
                key={`${post.postId}-${index}`}
                onPress={handlePressPost}
              >
                <Image source={{ uri: imageUrl }} style={styles.galleryImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        <PostReactions
          isEmotionPending={toggleEmotionMutation.isPending}
          onCommentPress={handlePressPost}
          onSelectReaction={(_postId, reaction) => {
            if (!reaction?.id) {
              return;
            }

            toggleEmotionMutation.mutate({
              emotionType: reaction.id,
            });
          }}
          onToggleEmotion={(_postId, emotionType) => {
            if (!emotionType) {
              return;
            }

            toggleEmotionMutation.mutate({
              emotionType,
            });
          }}
          post={reactionPost}
          selectedEmotionType={selectedEmotionType}
        />
      </View>
    </View>
  );
};

export default SearchPostCard;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 17,
    paddingVertical: 5,
  },
  card: {
    backgroundColor: "rgba(63, 63, 63, 0.30)",
    borderRadius: 5,
    borderColor: "rgba(127, 127, 127, 0.28)",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 13,
  },
  authorRow: {
    marginBottom: 4,
  },
  bodyPressable: {
    flex: 1,
  },
  contentSection: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  snippetWrapper: {
    color: "#F9F9F9",
    lineHeight: 20,
  },
  snippetText: {
    color: "#F9F9F9",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "NotoSansKR_Regular",
  },
  highlightText: {
    color: "#FFFFFF",
    backgroundColor: "#6E1833",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "NotoSansKR_SemiBold",
  },
  hashText: {
    color: "#6F9D48",
    lineHeight: 19,
    marginTop: 6,
  },
  singleImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    backgroundColor: "#1D1D21",
  },
  imagePressable: {
    marginTop: 10,
  },
  galleryContent: {
    gap: 8,
    paddingTop: 10,
    paddingRight: 20,
    paddingHorizontal: 5,
  },
  galleryImage: {
    width: 164,
    height: 164,
    borderRadius: 10,
    backgroundColor: "#1D1D21",
  },
});
