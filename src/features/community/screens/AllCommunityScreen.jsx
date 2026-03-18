import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import useCommunityPosts from "../hooks/useCommunityPosts";
import PostList from "../component/communityMain/PostList";
import { useUserStore } from "../../../shared/store/userStore";

import AllCommunityBackground from "../assets/svg/AllCommunityBackground/all_background.svg";
import CommunityTopBar from "../component/communityMain/CommunityTapBar";

const AllCommunityScreen = () => {
  const [sort, setSort] = useState("latest");
  const user = useUserStore((state) => state.user);
  if (!user) return null;

  const { favoriteTeamCode } = user;

  const { posts, loadMore, isLoading } = useCommunityPosts({
    channel: favoriteTeamCode,
    sort,
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <AllCommunityBackground
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        style={styles.bgSvg}
      />
      <View style={styles.bgOverlay} />

      <CommunityTopBar isTeam={false} />

      <PostList
        posts={posts}
        onEndReached={loadMore}
        isLoading={isLoading}
        showTeam={true}
        sort={sort}
        onSortChange={setSort}
        user={user}
      />
    </SafeAreaView>
  );
};

export default AllCommunityScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#020408",
  },
  container: {
    justifyContent: "center",
    paddingHorizontal: 17,
    flex: 1,
  },
  bgSvg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bgOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(2, 4, 8, 0.25)",
  },
});
