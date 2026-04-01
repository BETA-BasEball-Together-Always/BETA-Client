import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postKeys } from "./postKeys";
import api from "../../../../shared/libs/api";
import postDetailKeys from "../postDetail/postDetailKeys";
import communityKeys from "../communityKeys";
import { resolveCommunityPostId } from "../../constants/communityReactions";
import { homeKeys } from "../../../home/services/homeKeys";

function patchPostFromUpdateResponse(prev, data) {
  if (!prev || data == null || typeof data !== "object") return prev;
  const next = { ...prev };
  if (typeof data.content === "string") next.content = data.content;
  if (Array.isArray(data.hashtags)) next.hashtags = data.hashtags;
  if (data.channel != null) next.channel = data.channel;
  if (data.status != null) next.status = data.status;
  return next;
}

function patchPostInInfinitePages(prev, postId, data) {
  if (!prev?.pages) return prev;
  return {
    ...prev,
    pages: prev.pages.map((page) => ({
      ...page,
      posts: (page.posts ?? []).map((p) => {
        const pid = resolveCommunityPostId(p);
        if (String(pid) !== String(postId)) return p;
        return patchPostFromUpdateResponse(p, data);
      }),
    })),
  };
}

// 게시글 수정!
const updatePostApi = async ({ postId, formData }) => {

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
        queryClient.setQueryData(postDetailKeys.detail(postId), (prev) =>
          prev ? patchPostFromUpdateResponse(prev, data) : prev,
        );
        queryClient.setQueriesData(
          { queryKey: communityKeys.posts() },
          (prev) => patchPostInInfinitePages(prev, postId, data),
        );
        queryClient.setQueryData(homeKeys.all, (prev) => {
          if (!prev?.popularPosts || !Array.isArray(prev.popularPosts))
            return prev;
          return {
            ...prev,
            popularPosts: prev.popularPosts.map((p) => {
              const pid = resolveCommunityPostId(p);
              if (String(pid) !== String(postId)) return p;
              return patchPostFromUpdateResponse(p, data);
            }),
          };
        });
        queryClient.setQueriesData({ queryKey: ["mypage"] }, (prev) =>
          patchPostInInfinitePages(prev, postId, data),
        );
        queryClient.setQueriesData({ queryKey: ["userPosts"] }, (prev) =>
          patchPostInInfinitePages(prev, postId, data),
        );
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
