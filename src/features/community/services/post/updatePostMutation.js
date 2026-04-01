import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postKeys } from "./postKeys";
import api from "../../../../shared/libs/api";
import postDetailKeys from "../postDetail/postDetailKeys";
import communityKeys from "../communityKeys";

// 게시글 수정!
const updatePostApi = async ({ postId, formData }) => {
  // api 인스턴스 기본값이 application/json 이라면, FormData 요청에 그대로 섞이면 본문이 서버에 제대로 바인딩되지 않을 수 있음.
  // RN에서는 boundary 없이 "multipart/form-data"만 지정하는 것도 문제가 되므로, Content-Type은 비우고( false ) 네이티브가 boundary 포함 헤더를 붙이게 둔다.
  const res = await api.put(`/api/v1/community/posts/${postId}`, formData, {
    headers: {
      "Content-Type": false,
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
        queryClient.invalidateQueries({
          queryKey: postDetailKeys.detail(postId),
        });
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
