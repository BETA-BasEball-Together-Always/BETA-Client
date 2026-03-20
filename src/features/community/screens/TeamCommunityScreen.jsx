import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, Dimensions } from "react-native";
import { AppText } from "../../../shared/theme/components/AppText";
import PostList from "../component/communityMain/PostList";
import useCommunityPosts from "../hooks/useCommunityPosts";

import { useUserStore } from "../../../shared/store/userStore";
import { TEAM_DATA } from "../../../shared/constants/teams";
import CommunityTopBar from "../component/communityMain/CommunityTapBar";

const { width } = Dimensions.get("window");

const TeamCommunityScreen = () => {
  const [sort, setSort] = useState("latest");
  const user = useUserStore((state) => state.user);
  if (!user) return null;

  const { favoriteTeamName, favoriteTeamCode } = user;
  const MainIcon = TEAM_DATA[favoriteTeamCode]?.MainIcon;

  const { posts, loadMore, isLoading } = useCommunityPosts({
    channel: undefined,
    sort,
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {MainIcon && (
        <View style={styles.bgLogoContainer} pointerEvents="none">
          <MainIcon width={307} height={307} />
          <View style={styles.bgLogoOverlay} />
        </View>
      )}

      <CommunityTopBar isTeam={true} teamName={favoriteTeamName} />

      <PostList
        posts={posts}
        onEndReached={loadMore}
        isLoading={isLoading}
        sort={sort}
        onSortChange={setSort}
        user={user}
      />
    </SafeAreaView>
  );
};

export default TeamCommunityScreen;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#020408",
    flex: 1,
  },
  bgLogoContainer: {
    position: "absolute",
    alignSelf: "center",
    top: "50%",
    transform: [{ translateY: -50 }],
  },
  bgLogoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 4, 8, 0.9)",
  },
  container: {
    justifyContent: "center",
    paddingHorizontal: 17,
    flex: 1,
  },
});
