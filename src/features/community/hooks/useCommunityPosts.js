import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  fetchPostsApi,
  totalEmotionCountFromPost,
} from "../services/communityService";
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

export default function useCommunityPosts({ channel, sort, enabled = true }) {
  const channelForList = channel ?? null;

  const query = useInfiniteQuery({
    queryKey: communityKeys.postList({ channel: channelForList, sort }),

    queryFn: async ({ pageParam }) => {
      if (sort === "popular") {
        const p =
          pageParam != null && typeof pageParam === "object"
            ? pageParam
            : null;
        return fetchPostsApi({
          channel: channelForList,
          sort,
          cursorId: p?.cursorId,
          cursorEmotionCount: p?.cursorEmotionCount,
        });
      }

      const cursorId =
        typeof pageParam === "number" || typeof pageParam === "string"
          ? pageParam
          : undefined;

      return fetchPostsApi({
        channel: channelForList,
        sort,
        cursorId,
      });
    },
    enabled,
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.hasNext) return undefined;

      if (sort === "popular") {
        const posts = lastPage.posts ?? [];
        const lastPost = posts[posts.length - 1];
        const cursorId =
          lastPage.nextCursorId ??
          lastPage.nextCursor ??
          lastPage.cursorId ??
          lastPage.cursor ??
          lastPost?.postId;
        const cursorEmotionCount =
          lastPage.nextCursorEmotionCount ??
          lastPage.cursorEmotionCount ??
          (lastPost != null ? totalEmotionCountFromPost(lastPost) : undefined);
        if (cursorId == null || cursorEmotionCount == null) return undefined;
        return { cursorId, cursorEmotionCount };
      }

      return (
        lastPage.nextCursorId ??
        lastPage.nextCursor ??
        lastPage.cursorId ??
        lastPage.cursor ??
        lastPage.nextPageCursor ??
        undefined
      );
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
    isError: query.isError,
    error: query.error,
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
    pageCount: query.data?.pages?.length ?? 0,
  };
}
