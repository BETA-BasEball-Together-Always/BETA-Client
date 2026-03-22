import React, { useEffect, useState } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import PostList from "../component/communityMain/PostList";
import useCommunityPosts from "../hooks/useCommunityPosts";
import FetchStateView from "../../../shared/components/FetchStateView";

import { useUserStore } from "../../../shared/store/userStore";
import { TEAM_DATA } from "../../../shared/constants/teams";
import CommunityTopBar from "../component/communityMain/CommunityTapBar";
import { useMyLikedPostsInfiniteQuery } from "../../profile/hooks/useMypagePosts";

const TeamCommunityScreen = ({ route }) => {
  const paramSort = route?.params?.initialSort;
  const [sort, setSort] = useState(() =>
    paramSort === "popular" || paramSort === "latest" ? paramSort : "latest",
  );
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (paramSort === "popular" || paramSort === "latest") setSort(paramSort);
  }, [paramSort]);
  const favoriteTeamCode = user?.favoriteTeamCode;
  const favoriteTeamName = user?.favoriteTeamName;

  // heart fill 복원을 위해, 유저가 감정을 남긴(=liked) 게시물 목록을 서버에서 hydrate
  useMyLikedPostsInfiniteQuery({
    enabled: !!user,
    hydrateSelection: true,
  });

  const MainIcon = TEAM_DATA[favoriteTeamCode]?.MainIcon;

  const {
    posts,
    loadMore,
    isLoading,
    isFetching,
    isError,
    refetch,
    isFetchingNextPage,
  } = useCommunityPosts({
    channel: null,
    sort,
  });

  const blockingLoad =
    !isError && posts.length === 0 && (isLoading || isFetching);

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

      <FetchStateView
        style={styles.fetchArea}
        isLoading={blockingLoad}
        isError={isError}
        onRetry={() => refetch()}
      >
        <PostList
          posts={posts}
          onEndReached={loadMore}
          isLoading={isFetchingNextPage}
          isFeedBusy={isLoading || isFetching}
          removeClippedSubviews={false}
          stabilizePostBodyMeasure
          sort={sort}
          onSortChange={setSort}
          user={user}
        />
      </FetchStateView>
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
  fetchArea: {
    flex: 1,
  },
});
