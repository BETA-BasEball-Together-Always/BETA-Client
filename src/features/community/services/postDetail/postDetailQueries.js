import { useQuery } from "@tanstack/react-query";
import postDetailKeys from "./postDetailKeys";
import { fetchPostDetailApi, fetchPostCommentsApi } from "./postDetailApi";

export const usePostDetailQuery = (postId, options) => {
  return useQuery({
    queryKey: postDetailKeys.detail(postId),
    queryFn: () => fetchPostDetailApi(postId),
    enabled: !!postId,
    ...options,
  });
};

export const usePostCommentsQuery = (postId, cursor, options) => {
  return useQuery({
    queryKey: [...postDetailKeys.comments(postId), cursor ?? null],
    queryFn: () => fetchPostCommentsApi({ postId, cursor }),
    enabled: !!postId,
    ...options,
  });
};
