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
    isPending,
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

  /** 첫 페이지 직후 ~ 다음 페이지 요청 사이 프레임에서 빈 문구가 잠깐 뜨는 것 방지 */
  const mayStillFetchMorePopular =
    dailyPopular.length < 5 &&
    pageCount < MAX_POPULAR_PAGES &&
    (hasNextPage ?? false);

  const isPopularFeedBusy =
    isPending ||
    isFetchingNextPage ||
    (dailyPopular.length === 0 && mayStillFetchMorePopular);

  useEffect(() => {
    if (isPending || isFetchingNextPage) return;
    if (!hasNextPage) return;
    if (dailyPopular.length >= 5) return;
    if (pageCount >= MAX_POPULAR_PAGES) return;
    fetchNextPage();
  }, [
    isPending,
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
    isPending,
    isError,
    error,
    isFetchingNextPage,
    isPopularFeedBusy,
  };
}
