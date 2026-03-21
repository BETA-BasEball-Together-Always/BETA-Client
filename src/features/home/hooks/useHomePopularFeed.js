import { useEffect } from "react";
import useCommunityPosts from "../../community/hooks/useCommunityPosts";
import { useDailyPopularPosts } from "./useDailyPopularPosts";

/** 인기 API 페이지를 추가로 불러와도 부담이 과하지 않도록 상한 */
const MAX_POPULAR_PAGES = 25;

export default function useHomePopularFeed() {
  const {
    posts,
    fetchNextPage,
    refetch,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    pageCount,
  } = useCommunityPosts({
    channel: "ALL",
    sort: "popular",
  });

  const dailyPopular = useDailyPopularPosts(posts);

  useEffect(() => {
    if (isLoading || isFetchingNextPage) return;
    if (!hasNextPage) return;
    if (dailyPopular.length >= 5) return;
    if (pageCount >= MAX_POPULAR_PAGES) return;
    fetchNextPage();
  }, [
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    dailyPopular.length,
    pageCount,
    fetchNextPage,
  ]);

  return {
    dailyPopular,
    refetch,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
  };
}
