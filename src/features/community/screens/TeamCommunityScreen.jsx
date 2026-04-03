import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import PostList from "../component/communityMain/PostList";
import useCommunityPosts from "../hooks/useCommunityPosts";
// import CommunityLoadingSpinner from "../../../shared/components/CommunityLoadingSpinner";
import FetchStateView from "../../../shared/components/FetchStateView";

import { useUserStore } from "../../../shared/store/userStore";
import { TEAM_DATA } from "../../../shared/constants/teams";
import CommunityTopBar from "../component/communityMain/CommunityTapBar";
import { useMyLikedPostsInfiniteQuery } from "../../profile/hooks/useMypagePosts";
import communityKeys from "../services/communityKeys";
const FEED_REFETCH_MS = 10 * 1000;

const TeamCommunityScreen = ({ route }) => {
  const paramSort = route?.params?.initialSort;
  const [sort, setSort] = useState(() =>
    paramSort === "popular" || paramSort === "latest" ? paramSort : "latest",
  );
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const isFocused = useIsFocused();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (paramSort === "popular" || paramSort === "latest") setSort(paramSort);
  }, [paramSort]);

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
    }, [queryClient]),
  );
  const favoriteTeamCode = user?.favoriteTeamCode;
  const favoriteTeamName = user?.favoriteTeamName;

  // const normalizedTeamCode =
  //   typeof favoriteTeamCode === "string"
  //     ? favoriteTeamCode.trim().toUpperCase()
  //     : favoriteTeamCode;

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
    refetchInterval: isFocused ? FEED_REFETCH_MS : false,
  });

  const blockingLoad =
    !isError && posts.length === 0 && (isLoading || isFetching);

  if (!user) return null;

  // 사용자는 "초기 로딩 1회"만 스피너가 돌길 원합니다.
  // (isLoading이 짧게 토글되는 상황에서 스피너 깜빡임을 줄이기 위함)
  // const [completedInitialLoad, setCompletedInitialLoad] = useState(false);
  // useEffect(() => {
  //   if (!completedInitialLoad && !isLoading && !isError) {
  //     setCompletedInitialLoad(true);
  //   }
  // }, [completedInitialLoad, isError, isLoading]);

  // const showInitialLoadingSpinner = isLoading && !completedInitialLoad;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {MainIcon && (
        <View style={styles.bgLogoContainer} pointerEvents="none">
          <MainIcon width={307} height={307} />
          <View style={styles.bgLogoOverlay} />
        </View>
      )}

      <CommunityTopBar isTeam={true} teamName={favoriteTeamName} />

      {/* <View style={styles.fetchArea}> */}
      <FetchStateView
        style={styles.fetchArea}
        isLoading={blockingLoad}
        isError={isError}
        isFetching={isFetching}
        onRetry={() => refetch()}
      >
        <PostList
          posts={posts}
          onEndReached={loadMore}
          isLoading={isFetchingNextPage}
          isFeedBusy={isLoading || isFetching}
          refreshing={isRefreshing}
          onRefresh={async () => {
            try {
              setIsRefreshing(true);
              await refetch();
            } finally {
              setIsRefreshing(false);
            }
          }}
          removeClippedSubviews={false}
          stabilizePostBodyMeasure
          sort={sort}
          onSortChange={setSort}
          user={user}
          createPostBoardId="TEAM"
        />
      </FetchStateView>

      {/* {showInitialLoadingSpinner && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <CommunityLoadingSpinner size={44} />
          </View>
        )} */}
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
  loadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(2, 4, 8, 0.35)",
  },
});
