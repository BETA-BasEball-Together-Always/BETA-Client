import { useMutation } from "@tanstack/react-query";
import { postKeys } from "./postKeys";
import api from "../../../../shared/libs/api";

// 게시글 수정!
const updatePostApi = async ({ postId, formData }) => {
  const res = await api.put(`/api/v1/community/posts/${postId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const useUpdatePostMutation = () => {
  return useMutation({
    mutationKey: postKeys.updatePost(),

    mutationFn: ({ postId, formData }) => updatePostApi({ postId, formData }),

    onSuccess: (data) => {
      console.log("게시글 수정 성공: ", data);
    },

    onError: (error) => {
      console.log("게시글 수정 실패: ", error);
      console.log("게시글 수정 실패 response: ", error.response);
      console.log("게시글 수정 실패 data: ", error.data);
    },
  });
};
