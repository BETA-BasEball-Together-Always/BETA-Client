import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPostsApi } from "../services/communityService";
import communityKeys from "../services/communityKeys";

export default function useCommunityPosts({ channel, sort }) {
  const query = useInfiniteQuery({
    queryKey: communityKeys.postList({ channel, sort }),

    queryFn: async ({ pageParam }) => {
      return fetchPostsApi({
        channel,
        sort,
        cursor: sort === "latest" ? pageParam : null,
        offset: sort === "popular" ? pageParam : null,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasNext) return undefined;

      if (sort === "popular") {
        return allPages.reduce((acc, page) => acc + page.posts.length, 0);
      }
    },
  });

  const posts = query.data?.pages.flatMap((page) => page.posts) ?? [];

  return {
    posts,
    loadMore: query.fetchNextPage,
    refetch: query.refetch,
    isLoading: query.isLoading,
  };
}
