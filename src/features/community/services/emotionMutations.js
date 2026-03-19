import { useMutation, useQueryClient } from "@tanstack/react-query";
import postDetailKeys from "./postDetail/postDetailKeys";
import { togglePostEmotionApi } from "./postDetail/postDetailApi";
import communityKeys from "./communityKeys";

export const useTogglePostEmotionMutation = (postId, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ emotionType }) =>
      togglePostEmotionApi({ postId, emotionType }),
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(postDetailKeys.detail(postId), (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          emotions: data.emotions,
        };
      });

      queryClient.setQueriesData(
        { queryKey: communityKeys.posts() },
        (prev) => {
          if (!prev?.pages) return prev;
          return {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              posts: page.posts.map((p) =>
                p.postId === postId ? { ...p, emotions: data.emotions } : p,
              ),
            })),
          };
        },
      );

      if (typeof options.onSuccess === "function") {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
};
