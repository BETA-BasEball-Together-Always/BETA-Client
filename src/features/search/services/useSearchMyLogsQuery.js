import { useQuery } from "@tanstack/react-query";
import { fetchMySearchLogs } from "./searchApi";
import { searchKeys } from "./searchKeys";

export const useSearchMyLogsQuery = ({ enabled = true } = {}) => {
  return useQuery({
    queryKey: searchKeys.logs(),
    queryFn: fetchMySearchLogs,
    enabled,
  });
};

export default useSearchMyLogsQuery;
