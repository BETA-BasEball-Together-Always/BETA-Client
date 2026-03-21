import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchPostsApi } from "../services/communityService";
import communityKeys from "../services/communityKeys";

function dedupePostsById(pages) {
  const map = new Map();
  for (const page of pages ?? []) {
    for (const p of page?.posts ?? []) {
      if (p?.postId != null && !map.has(p.postId)) map.set(p.postId, p);
    }
  }
  return Array.from(map.values());
}

function getNextLatestCursor(lastPage) {
  if (!lastPage?.hasNext) return undefined;
  return (
    lastPage.nextCursor ??
    lastPage.nextCursorId ??
    lastPage.cursorId ??
    lastPage.cursor ??
    lastPage.nextPageCursor ??
    undefined
  );
}

function getNextPopularOffset(lastPage, pageParam) {
  if (!lastPage?.hasNext) return undefined;
  if (typeof lastPage.nextOffset === "number") return lastPage.nextOffset;
  const prev = typeof pageParam === "number" ? pageParam : 0;
  return prev + 1;
}

export default function useCommunityPosts({ channel, sort, enabled = true }) {
  const channelForList = channel ?? null;

  const query = useInfiniteQuery({
    queryKey: communityKeys.postList({ channel: channelForList, sort }),

    queryFn: async ({ pageParam }) => {
      if (sort === "popular") {
        const offset = typeof pageParam === "number" ? pageParam : 0;
        return fetchPostsApi({
          channel: channelForList,
          sort: "popular",
          offset,
        });
      }

      const cursor =
        pageParam === null || pageParam === undefined ? undefined : pageParam;

      return fetchPostsApi({
        channel: channelForList,
        sort: "latest",
        cursor,
      });
    },
    enabled,
    initialPageParam: sort === "popular" ? 0 : undefined,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (sort === "popular") {
        return getNextPopularOffset(lastPage, lastPageParam);
      }
      return getNextLatestCursor(lastPage);
    },
  });

  const posts = useMemo(
    () => dedupePostsById(query.data?.pages),
    [query.data?.pages],
  );

  return {
    posts,
    loadMore: query.fetchNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
    pageCount: query.data?.pages?.length ?? 0,
  };
}
