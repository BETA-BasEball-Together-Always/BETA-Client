import { useQuery } from "@tanstack/react-query";
import { fetchSearchSuggestions } from "./searchApi";
import { searchKeys } from "./searchKeys";

export const useSearchSuggestionsQuery = ({
  keyword,
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: searchKeys.suggestions(keyword),
    queryFn: () => fetchSearchSuggestions(keyword),
    enabled: enabled && Boolean(keyword?.trim()),
  });
};

export default useSearchSuggestionsQuery;
