import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postKeys } from "./postKeys";
import api from "../../../../shared/libs/api";
import postDetailKeys from "../postDetail/postDetailKeys";
import communityKeys from "../communityKeys";

// 게시글 삭제
const deletePostApi = async (postId) => {
  const res = await api.delete(`/api/v1/community/posts/${postId}`);

  return res.data;
};

export const useDeletePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: postKeys.deletePost(),

    mutationFn: (postId) => deletePostApi(postId),

    onSuccess: (data, postId) => {
      if (postId != null) {
        queryClient.removeQueries({ queryKey: postDetailKeys.detail(postId) });
      }

      queryClient.invalidateQueries({ queryKey: communityKeys.posts() });

      // 마이페이지 / 타인 프로필 피드 infinite 목록에서 즉시 제거 + 재검증
      queryClient.setQueriesData({ queryKey: ["mypage"] }, (prev) => {
        if (!prev?.pages) return prev;
        return {
          ...prev,
          pages: prev.pages.map((page) => ({
            ...page,
            posts: (page.posts ?? []).filter((p) => p.postId !== postId),
          })),
        };
      });
      queryClient.setQueriesData({ queryKey: ["userPosts"] }, (prev) => {
        if (!prev?.pages) return prev;
        return {
          ...prev,
          pages: prev.pages.map((page) => ({
            ...page,
            posts: (page.posts ?? []).filter((p) => p.postId !== postId),
          })),
        };
      });

      queryClient.invalidateQueries({ queryKey: ["mypage"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });

      console.log("게시글 삭제 성공: ", data);
    },

    onError: (error) => {
      console.log("게시글 삭제 실패: ", error);
      console.log("게시글 삭제 실패 response: ", error.response);
      console.log("게시글 삭제 실패 data: ", error.data);
    },
  });
};
