import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchSearchPostsPage } from "./searchApi";
import { searchKeys } from "./searchKeys";

export const useSearchPostsInfiniteQuery = ({
  keyword,
  channel,
  sort,
  enabled = true,
} = {}) => {
  return useInfiniteQuery({
    queryKey: searchKeys.posts(keyword, channel, sort),
    queryFn: ({ pageParam }) =>
      fetchSearchPostsPage({
        keyword,
        channel,
        sort,
        cursor: pageParam ?? null,
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.hasNext || !lastPage?.nextCursor) {
        return undefined;
      }

      return lastPage.nextCursor;
    },
    enabled:
      enabled &&
      Boolean(keyword?.trim()) &&
      Boolean(channel) &&
      Boolean(sort),
  });
};

export default useSearchPostsInfiniteQuery;
