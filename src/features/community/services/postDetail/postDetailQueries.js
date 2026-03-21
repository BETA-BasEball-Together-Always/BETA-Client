import { useQuery } from "@tanstack/react-query";
import postDetailKeys from "./postDetailKeys";
import { fetchPostDetailApi, fetchPostCommentsApi } from "./postDetailApi";

export const usePostDetailQuery = (postId, options) => {
  return useQuery({
    queryKey: postDetailKeys.detail(postId),
    queryFn: () => fetchPostDetailApi(postId),
    enabled: !!postId,
    /** 댓글은 작성/수정/삭제 API 성공 후 로컬 캐시만 갱신(방법 A) — 포커스 시 GET으로 트리 덮어쓰기 방지 */
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 30 * 60 * 1000,
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
