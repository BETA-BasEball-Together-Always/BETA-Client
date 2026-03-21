import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postKeys } from "./postKeys";
import api from "../../../../shared/libs/api";
import postDetailKeys from "../postDetail/postDetailKeys";
import communityKeys from "../communityKeys";

// 게시글 수정!
const updatePostApi = async ({ postId, formData }) => {
  const res = await api.put(`/api/v1/community/posts/${postId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 20000,
  });
  return res.data;
};

export const useUpdatePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: postKeys.updatePost(),

    mutationFn: ({ postId, formData }) => updatePostApi({ postId, formData }),

    onSuccess: (data, variables) => {
      const postId = variables?.postId;
      if (postId != null) {
        queryClient.invalidateQueries({ queryKey: postDetailKeys.detail(postId) });
      }
      queryClient.invalidateQueries({ queryKey: communityKeys.posts() });
      console.log("게시글 수정 성공: ", data);
    },

    onError: (error) => {
      console.log("게시글 수정 실패: ", error);
      console.log("게시글 수정 실패 response: ", error.response);
      console.log("게시글 수정 실패 data: ", error.data);
    },
  });
};
