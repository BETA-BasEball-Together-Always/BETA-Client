import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchSearchHashtagsPage } from "./searchApi";
import { searchKeys } from "./searchKeys";

export const useSearchHashtagsInfiniteQuery = ({
  keyword,
  enabled = true,
} = {}) => {
  return useInfiniteQuery({
    queryKey: searchKeys.hashtags(keyword),
    queryFn: ({ pageParam }) =>
      fetchSearchHashtagsPage({
        keyword,
        cursor: pageParam ?? null,
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.hasNext || !lastPage?.nextCursor) {
        return undefined;
      }

      return lastPage.nextCursor;
    },
    enabled: enabled && Boolean(keyword?.trim()),
  });
};

export default useSearchHashtagsInfiniteQuery;
