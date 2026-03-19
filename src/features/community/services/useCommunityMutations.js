import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPostApi, deletePostApi } from "./communityService";
import communityKeys from "./communityKeys";

export default function useCommunityMutations({ channel, sort }) {
  const queryClient = useQueryClient();

  // 게시글 생성
  const createPostMutation = useMutation({
    mutationFn: createPostApi,

    onSuccess: () => {
      // 리스트 다시 불러오기
      queryClient.invalidateQueries(communityKeys.postList({ channel, sort }));
    },
  });

  //   게시글 삭제
  const deletePostMutation = useMutation({
    mutationFn: deletePostApi,

    onSuccess: () => {
      queryClient.invalidateQueries(communityKeys.postList({ channel, sort }));
    },
  });

  return {
    createPost: createPostMutation.mutate,
    deletePost: deletePostMutation.mutate,

    isCreating: createPostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
  };
}
