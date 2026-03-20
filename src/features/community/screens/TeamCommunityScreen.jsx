import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, Dimensions } from "react-native";
import { AppText } from "../../../shared/theme/components/AppText";
import PostList from "../component/communityMain/PostList";
import useCommunityPosts from "../hooks/useCommunityPosts";

import { useUserStore } from "../../../shared/store/userStore";
import { TEAM_DATA } from "../../../shared/constants/teams";
import CommunityTopBar from "../component/communityMain/CommunityTapBar";
import { useMyLikedPostsInfiniteQuery } from "../../profile/hooks/useMypagePosts";

const { width } = Dimensions.get("window");

const TeamCommunityScreen = ({ route }) => {
  const initialSort = route?.params?.initialSort || "latest";
  const [sort, setSort] = useState(initialSort);
  const user = useUserStore((state) => state.user);
  const favoriteTeamCode = user?.favoriteTeamCode;
  const favoriteTeamName = user?.favoriteTeamName;

  // heart fill 복원을 위해, 유저가 감정을 남긴(=liked) 게시물 목록을 서버에서 hydrate
  useMyLikedPostsInfiniteQuery({
    enabled: !!user,
    hydrateSelection: true,
  });

  const MainIcon = TEAM_DATA[favoriteTeamCode]?.MainIcon;

  /** 게시판 구분은 API에서 TEAM / ALL 고정 (팀 코드 아님) */
  const { posts, loadMore, isLoading } = useCommunityPosts({
    channel: "TEAM",
    sort,
  });

  if (!user) return null;

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
