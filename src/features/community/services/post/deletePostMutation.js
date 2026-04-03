import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postKeys } from "./postKeys";
import api from "../../../../shared/libs/api";
import postDetailKeys from "../postDetail/postDetailKeys";
import communityKeys from "../communityKeys";
import { clearUserEmotionSelection } from "../../store/userEmotionSelectionStore";
import { useSoftDeletedPostStore } from "../../store/softDeletedPostStore";

// 게시글 삭제
const deletePostApi = async (postId) => {
  const res = await api.delete(`/api/v1/community/posts/${postId}`);

  return res.data;
};

function removePostFromInfiniteData(prev, postId) {
  if (!prev?.pages) return prev;
  return {
    ...prev,
    pages: prev.pages.map((page) => ({
      ...page,
      posts: (page.posts ?? []).filter((p) => p.postId !== postId),
    })),
  };
}

export const useDeletePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: postKeys.deletePost(),

    mutationFn: (postId) => deletePostApi(postId),

    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: communityKeys.posts() });
      await queryClient.cancelQueries({ queryKey: ["mypage"] });
      await queryClient.cancelQueries({ queryKey: ["userPosts"] });

      const snapCommunity = queryClient.getQueriesData({
        queryKey: communityKeys.posts(),
      });
      const snapMypage = queryClient.getQueriesData({ queryKey: ["mypage"] });
      const snapUserPosts = queryClient.getQueriesData({
        queryKey: ["userPosts"],
      });

      queryClient.setQueriesData({ queryKey: communityKeys.posts() }, (prev) =>
        removePostFromInfiniteData(prev, postId),
      );
      queryClient.setQueriesData({ queryKey: ["mypage"] }, (prev) =>
        removePostFromInfiniteData(prev, postId),
      );
      queryClient.setQueriesData({ queryKey: ["userPosts"] }, (prev) =>
        removePostFromInfiniteData(prev, postId),
      );

      return { snapCommunity, snapMypage, snapUserPosts };
    },

    onError: (_error, _postId, context) => {
      context?.snapCommunity?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
      context?.snapMypage?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
      context?.snapUserPosts?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
    },

    onSuccess: (_data, postId) => {
      if (postId != null)
        useSoftDeletedPostStore.getState().markDeleted(postId);
    },

    onSettled: (_data, error, postId) => {
      if (error == null && postId != null) {
        queryClient.removeQueries({ queryKey: postDetailKeys.detail(postId) });
        clearUserEmotionSelection(postId);
      }
      queryClient.invalidateQueries({ queryKey: communityKeys.posts() });
      queryClient.invalidateQueries({ queryKey: ["mypage"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
    },
  });
};
