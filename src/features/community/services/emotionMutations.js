import { useMutation, useQueryClient } from "@tanstack/react-query";
import postDetailKeys from "./postDetail/postDetailKeys";
import { togglePostEmotionApi } from "./postDetail/postDetailApi";
import communityKeys from "./communityKeys";
import { toApiEmotionType, toUiEmotionType } from "../utils/emotionTypeMap";
import { setUserEmotionSelection } from "../store/userEmotionSelectionStore";
import { useRef } from "react";

export const useTogglePostEmotionMutation = (postId, options = {}) => {
  const queryClient = useQueryClient();
  const chainRef = useRef(Promise.resolve());
  const { onSuccess: userOnSuccess, ...restOptions } = options;

  return useMutation({
    // 연속 탭 시 이전 요청 완료 후 다음 요청 — 레이스로 카운트/하트 UI 깨짐 방지
    mutationFn: ({ emotionType }) => {
      const apiEmotionType = toApiEmotionType(emotionType);

      const run = () =>
        togglePostEmotionApi({
          postId,
          emotionType: apiEmotionType,
        });

      const next = chainRef.current.catch(() => {}).then(run);
      chainRef.current = next.catch(() => {});
      return next;
    },
    onSuccess: (data, variables, context) => {
      console.log("[community emotion] mutation onSuccess (cache 반영 전)", {
        postId,
        requestUiId: variables?.emotionType,
        requestApiType: toApiEmotionType(variables?.emotionType),
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

      queryClient.setQueriesData({ queryKey: communityKeys.posts() }, (prev) => {
        if (!prev?.pages) return prev;
        return {
          ...prev,
          pages: prev.pages.map((page) => ({
            ...page,
            posts: page.posts.map((p) =>
              p.postId === postId ? { ...p, emotions: data?.emotions ?? p.emotions } : p,
            ),
          })),
        };
      });

      setUserEmotionSelection(
        postId,
        data?.toggled ? toUiEmotionType(data.emotionType) : null,
      );

      if (typeof userOnSuccess === "function") {
        userOnSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};
