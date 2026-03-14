import { useMutation } from "@tanstack/react-query";
import { postKeys } from "./postKeys";
import api from "../../../../shared/libs/api";

// 게시글 작성!
const createPostApi = async (formData) => {
  const res = await api.post("/api/v1/community/post", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const useCreatePostMutation = () => {
  return useMutation({
    mutationKey: postKeys.createPost(),

    mutationFn: (formData) => createPostApi(formData),

    onSuccess: (data) => {
      console.log("게시글 작성 성공: ", data);
    },
    onError: (error) => {
      console.log("게시글 작성 실패: ", error);
      console.log("게시글 작성 실패 response: ", error.response);
      console.log("게시글 작성 실패 data: ", error.data);
    },
  });
};
