import { useMutation, useQueryClient } from "@tanstack/react-query";
import postDetailKeys from "./postDetail/postDetailKeys";
import { togglePostEmotionApi } from "./postDetail/postDetailApi";
import communityKeys from "./communityKeys";
import { setUserEmotionSelection } from "../store/userEmotionSelectionStore";
import { useRef } from "react";

export const useTogglePostEmotionMutation = (postId, options = {}) => {
  const queryClient = useQueryClient();
  const chainRef = useRef(Promise.resolve());
  const { onSuccess: userOnSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ emotionType }) => {
      const run = () =>
        togglePostEmotionApi({
          postId,
          emotionType,
        });

      const next = chainRef.current.catch(() => {}).then(run);
      chainRef.current = next.catch(() => {});
      return next;
    },
    onSuccess: async (data, variables, context) => {
      console.log("[community emotion] mutation onSuccess (cache 반영 전)", {
        postId,
        requestUiId: variables?.emotionType,
        requestApiType: variables?.emotionType,
        responseEmotionType: data?.emotionType,
        toggled: data?.toggled,
        emotionsFromServer: data?.emotions,
      });

      queryClient.setQueryData(postDetailKeys.detail(postId), (prev) => {
        if (!prev) return prev;
        const nextEmotions = data?.emotions ?? prev.emotions;
        return {
          ...prev,
          emotions: nextEmotions,
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
                p.postId === postId
                  ? { ...p, emotions: data?.emotions ?? p.emotions }
                  : p,
              ),
            })),
          };
        },
      );

      setUserEmotionSelection(
        postId,
        data?.toggled ? data?.emotionType : null,
      );

      if (typeof userOnSuccess === "function") {
        userOnSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};
