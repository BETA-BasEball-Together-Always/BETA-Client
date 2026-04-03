import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import CommunityLoadingSpinner from "../../../../../shared/components/CommunityLoadingSpinner";
import PostCard from "../../../../community/component/communityMain/PostCard";
import { isAllChannelPost } from "../../../../community/utils/communityChannel";

const PostList = ({
  posts = [],
  onEndReached,
  isLoading = false,
  hasNext = false,
  profileCommentHighlight = false,
}) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item, index) =>
          item?.postId != null ? `${item.postId}-${index}` : `post-${index}`
        }
        renderItem={({ item }) => (
          <View style={styles.postCardWrap}>
            <PostCard
              post={item}
              showTeam={isAllChannelPost(item.channel)}
              profileCommentHighlight={profileCommentHighlight}
            />
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={hasNext ? onEndReached : undefined}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.footerSpinner}>
              <CommunityLoadingSpinner size={36} />
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default PostList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 17,
    paddingBottom: 0,
  },
  postCardWrap: {
    backgroundColor: "rgba(63, 63, 63, 0.30)",
    borderRadius: 5,
    borderColor: "rgba(127, 127, 127, 0.28)",
    borderWidth: 1,
    marginVertical: 5,
    paddingVertical: 10,
    paddingHorizontal: 13,
  },
  footerSpinner: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
