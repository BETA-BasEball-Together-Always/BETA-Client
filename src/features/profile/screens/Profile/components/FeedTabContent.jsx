import React from "react";
import { View, StyleSheet } from "react-native";
import EmptyState from "./EmptyState";
import PostList from "./PostList";

const FeedTabContent = ({
  posts = [],
  emptyMessage = "작성된 게시물이 없습니다",
}) => {
  const hasPosts = posts && posts.length > 0;

  return (
    <View style={styles.container}>
      {hasPosts ? (
        <PostList posts={posts} />
      ) : (
        <EmptyState message={emptyMessage} />
      )}
    </View>
  );
};

export default FeedTabContent;

const styles = StyleSheet.create({
  container: { flex: 1 },
});
