import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postKeys } from "./postKeys";
import api from "../../../../shared/libs/api";
import communityKeys from "../communityKeys";

// 게시글 작성!
const createPostApi = async (formData) => {
  // 기본 axios 인스턴스는 application/json 이므로, FormData 전송 시 Content-Type을 비워( false ) boundary가 포함된 multipart로 보내지게 한다.
  const res = await api.post("/api/v1/community/posts", formData, {
    headers: {
      "Content-Type": false,
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
