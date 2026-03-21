import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchSearchUsersPage } from "./searchApi";
import { searchKeys } from "./searchKeys";

export const useSearchUsersInfiniteQuery = ({
  keyword,
  enabled = true,
} = {}) => {
  return useInfiniteQuery({
    queryKey: searchKeys.users(keyword),
    queryFn: ({ pageParam }) =>
      fetchSearchUsersPage({
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

export default useSearchUsersInfiniteQuery;
