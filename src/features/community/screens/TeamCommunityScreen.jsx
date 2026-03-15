import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { AppText } from "../../../shared/theme/components/AppText";
import QuestionCard from "../component/communityMain/QuestionCard";
import SortTabs from "../component/communityMain/SortTabs";
import PostList from "../component/communityMain/PostList";

import { mockPosts } from "../mock/mockPosts";

const TeamCommunityScreen = () => {
  const [sort, setSort] = useState("latest");

  const posts = mockPosts;
  const loadMore = () => {
    console.log("load more posts");
  }; //나중에 페이지네이션 할 것

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppText variant="displayTitle" style={{ color: "#FFF" }}>
          팀 게시판
        </AppText>
        <SortTabs sort={sort} onChange={setSort} />
        <QuestionCard posts={posts} />
        <PostList posts={posts} onEndReached={loadMore} />
      </View>
    </SafeAreaView>
  );
};

export default TeamCommunityScreen;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#020408",
    flex: 1,
  },
  container: {
    justifyContent: "center",
    paddingHorizontal: 17,
    flex: 1,
  },
});
