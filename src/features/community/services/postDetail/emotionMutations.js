import { useMutation, useQueryClient } from "@tanstack/react-query";
import postDetailKeys from "./postDetailKeys";
import { togglePostEmotionApi } from "./postDetailApi";

export const useTogglePostEmotionMutation = (postId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ emotionType }) =>
      togglePostEmotionApi({ postId, emotionType }),
    onSuccess: (data) => {
      queryClient.setQueryData(postDetailKeys.detail(postId), (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          emotions: data.emotions,
        };
      });
    },
  });
};
