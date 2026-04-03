import { useQuery } from "@tanstack/react-query";
import { fetchHome } from "../services/homeService";
import { homeKeys } from "../services/homeKeys";

export default function useHomeQuery({
  enabled = true,
  refetchInterval = false,
} = {}) {
  return useQuery({
    queryKey: homeKeys.all,
    queryFn: fetchHome,
    enabled,
    staleTime: 0,
    refetchInterval,
    refetchIntervalInBackground: false,
  });
}
