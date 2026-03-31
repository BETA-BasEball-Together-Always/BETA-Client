import { useQuery } from "@tanstack/react-query";
import postDetailKeys from "./postDetailKeys";
import { fetchPostDetailApi, fetchPostCommentsApi } from "./postDetailApi";

export const usePostDetailQuery = (postId, options = {}) => {
  return useQuery({
    queryKey: postDetailKeys.detail(postId),
    queryFn: () => fetchPostDetailApi(postId),
    enabled: !!postId,
    /** 다른 사용자 활동 반영: 포그라운드/재연결 시 서버와 동기화 */
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: "always",
    staleTime: 0,
    ...options,
  });
};

export const usePostCommentsQuery = (postId, cursorId, options) => {
  return useQuery({
    queryKey: [...postDetailKeys.comments(postId), cursorId ?? null],
    queryFn: () => fetchPostCommentsApi({ postId, cursorId }),
    enabled: !!postId,
    ...options,
  });
};
