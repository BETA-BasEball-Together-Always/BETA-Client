import React from "react";
import { View, StyleSheet, FlatList, Image, Text } from "react-native";
import { AppText } from "../../../../../shared/theme/components/AppText";

const PostList = ({ posts }) => {
  const renderPostItem = ({ item }) => (
    <View style={styles.postCard}>
      {/* 헤더 */}
      <View style={styles.postHeader}>
        <AppText
          variant="bodyMedium"
          className="text-white"
          style={styles.timeAgo}
        >
          {item.timeAgo}
        </AppText>
      </View>

      {/* 본문 */}
      <View style={styles.postBody}>
        <AppText
          variant="bodyRegular"
          className="text-white"
          style={styles.postContent}
        >
          {item.content}
        </AppText>
      </View>

      {/* 이미지 */}
      {item.image && (
        <View style={styles.postImageWrapper}>
          <Image source={{ uri: item.image }} style={styles.postImage} />
        </View>
      )}

      {/* 하단 */}
      <View style={styles.postFooter}>
        <View style={styles.reactionRow}>
          <Text style={styles.reactionIcon}>😍</Text>
          <Text style={styles.reactionIcon}>😭</Text>
          <Text style={styles.reactionIcon}>🔥</Text>
          <AppText
            variant="bodySmall"
            className="text-gray-400"
            style={styles.reactionCount}
          >
            {item.likes}
          </AppText>
        </View>
        <View style={styles.footerRight}>
          <AppText variant="bodySmall" className="text-gray-400">
            댓글 {item.comments}
          </AppText>
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={renderPostItem}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default PostList;

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  postCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    marginBottom: 12,
  },
  postHeader: {
    marginBottom: 10,
  },
  timeAgo: {
    color: "#A1A1AA",
  },
  postBody: {
    marginBottom: 10,
  },
  postContent: {
    color: "#F4F4F5",
    lineHeight: 20,
  },
  postImageWrapper: {
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
    aspectRatio: 3 / 2,
    marginBottom: 10,
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#383838",
  },
  reactionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reactionIcon: {
    fontSize: 16,
  },
  reactionCount: {
    marginLeft: 4,
    color: "#A1A1AA",
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
