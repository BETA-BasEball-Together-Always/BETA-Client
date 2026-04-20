import { MutationCache, QueryClient } from "@tanstack/react-query";
import { notifyOfflineIfNeeded } from "../utils/networkErrors";

const mutationCache = new MutationCache({
  onError: (error) => {
    notifyOfflineIfNeeded(error);
  },
});

/**
 * QueryClientProvider / sessionBootstrap / 네비게이션 프리패치 등에서 동일 인스턴스 공유
 */
export const appQueryClient = new QueryClient({
  mutationCache,
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
    mutations: {
      networkMode: "always",
    },
  },
});
