import React from "react";
import { FlatList, StyleSheet, View } from "react-native";

import PopularPostCard from "./PopularPostCard";
import { useDailyPopularPosts } from "../../../hooks/useDailyPopularPosts";
import { useNavigation } from "@react-navigation/native";
import { AppText } from "../../../../../shared/theme/components/AppText";

const PopularPostList = ({ posts }) => {
  const sortedPosts = useDailyPopularPosts(posts);

  if (!posts?.length || sortedPosts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <AppText variant="caption" className="text-[#F9F9F9]">
          아직 인기 게시물이 없어요
        </AppText>
      </View>
    );
  }
  return (
    <FlatList
      data={sortedPosts}
      keyExtractor={(item) => item.postId.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 10 }}
      renderItem={({ item }) => <PopularPostCard post={item} />}
    />
  );
};

export default PopularPostList;

const styles = StyleSheet.create({
  emptyContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
});
