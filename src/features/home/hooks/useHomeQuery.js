import { useQuery } from "@tanstack/react-query";
import { fetchHome } from "../services/homeService";
import { homeKeys } from "../services/homeKeys";

export default function useHomeQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: homeKeys.all,
    queryFn: fetchHome,
    enabled,
    staleTime: 60 * 1000,
  });
}
