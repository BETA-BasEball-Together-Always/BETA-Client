import { useMutation } from "@tanstack/react-query";
import { postKeys } from "./postKeys";
import api from "../../../../shared/libs/api";

// 게시글 삭제
const deletePostApi = async (postId) => {
  const res = await api.delete(`/api/v1/community/posts/${postId}`);

  return res.data;
};

export const useDeletePostMutation = () => {
  return useMutation({
    mutationKey: postKeys.deletePost(),

    mutationFn: (postId) => deletePostApi(postId),

    onSuccess: (data) => {
      console.log("게시글 삭제 성공: ", data);
    },

    onError: (error) => {
      console.log("게시글 삭제 실패: ", error);
      console.log("게시글 삭제 실패 response: ", error.response);
      console.log("게시글 삭제 실패 data: ", error.data);
    },
  });
};
