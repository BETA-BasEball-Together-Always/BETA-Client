import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useCommunityPosts from "../hooks/useCommunityPosts";
import PostList from "../component/communityMain/PostList";
import { useUserStore } from "../../../shared/store/userStore";
import FetchStateView from "../../../shared/components/FetchStateView";

import AllCommunityBackgroundLayer from "../component/AllCommunityBackgroundLayer";
import CommunityTopBar from "../component/communityMain/CommunityTapBar";
import { useMyLikedPostsInfiniteQuery } from "../../profile/hooks/useMypagePosts";

const AllCommunityScreen = ({ route }) => {
  const paramSort = route?.params?.initialSort;
  const [sort, setSort] = useState(() =>
    paramSort === "popular" || paramSort === "latest" ? paramSort : "latest",
  );
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (paramSort === "popular" || paramSort === "latest") setSort(paramSort);
  }, [paramSort]);

  // heart fill 복원을 위해, 유저가 감정을 남긴(=liked) 게시물 목록을 서버에서 hydrate
  useMyLikedPostsInfiniteQuery({
    enabled: !!user,
    hydrateSelection: true,
  });

  const {
    posts,
    loadMore,
    isLoading,
    isFetching,
    isError,
    refetch,
    isFetchingNextPage,
  } = useCommunityPosts({
    channel: "ALL",
    sort,
  });

  const blockingLoad =
    !isError && posts.length === 0 && (isLoading || isFetching);

  if (!user) return null;

  return (
    <View style={styles.screenRoot}>
      <AllCommunityBackgroundLayer />

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <CommunityTopBar isTeam={false} />

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
            showTeam={true}
            sort={sort}
            onSortChange={setSort}
            user={user}
          />
        </FetchStateView>
      </SafeAreaView>
    </View>
  );
};

export default AllCommunityScreen;

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: "#020408",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  fetchArea: {
    flex: 1,
  },
});
