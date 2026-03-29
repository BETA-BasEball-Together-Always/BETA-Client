import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postKeys } from "./postKeys";
import api from "../../../../shared/libs/api";
import communityKeys from "../communityKeys";

// 게시글 작성!
const createPostApi = async (formData) => {
  // Content-Type은 지정하지 말고 axios가 boundary 포함해 자동 설정하도록 둔다.
  const res = await api.post("/api/v1/community/posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 20000,
  });
  return res.data;
};

/** 커뮤니티 피드 + 마이페이지 목록 갱신 (탭이 비활성일 때도 refetch 되도록 all) */
export function invalidateCommunityPostLists(queryClient) {
  queryClient.invalidateQueries({
    queryKey: communityKeys.posts(),
    refetchType: "all",
  });
  queryClient.invalidateQueries({
    queryKey: ["mypage"],
    refetchType: "all",
  });
}

export const useCreatePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: postKeys.createPost(),

    mutationFn: (formData) => createPostApi(formData),

    onSuccess: (data) => {
      console.log("게시글 작성 성공: ", data);
      invalidateCommunityPostLists(queryClient);
    },
    onError: (error) => {
      if (__DEV__) {
        console.log("게시글 작성 실패: ", error?.message);
        console.log("게시글 작성 실패 response: ", error?.response);
        console.log("게시글 작성 실패 data: ", error?.response?.data);
      }
    },
  });
};
