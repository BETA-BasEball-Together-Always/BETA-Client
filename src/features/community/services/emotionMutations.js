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
    onSuccess: async (data, variables, context) => {
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
        data?.toggled ? toUiEmotionType(data.emotionType) : null,
      );

      // picker에서 "교체"했는데 서버가 기존 감정을 완전히 제거하지 않는 케이스 보정
      // (테스트 로그: SAD -> FUN 이후 sadCount가 남아있는 패턴)
      // - prevEmotionCountBefore 스냅샷 대비 prev 감정 카운트가 감소하지 않으면,
      //   prev 감정을 한 번 더 토글해서 제거를 시도한다.
      const prevEmotionType = variables?.prevEmotionType ?? null; // UI id (EMO_*)
      const prevEmotionCountBefore = variables?.prevEmotionCountBefore ?? 0; // number

      const currentRequestedUiEmotionType = variables?.emotionType ?? null; // UI id (EMO_*)

      const shouldTryCancelPrev =
        prevEmotionType &&
        currentRequestedUiEmotionType &&
        prevEmotionType !== currentRequestedUiEmotionType &&
        data?.toggled === true;

      if (shouldTryCancelPrev) {
        const prevApiEmotionType = toApiEmotionType(prevEmotionType);
        const prevCountAfter = (() => {
          const e = data?.emotions ?? {};
          switch (prevApiEmotionType) {
            case "LIKE":
              return e?.likeCount ?? 0;
            case "SAD":
              return e?.sadCount ?? 0;
            case "FUN":
              return e?.funCount ?? 0;
            case "HYPE":
              return e?.hypeCount ?? 0;
            default:
              return 0;
          }
        })();

        if (prevCountAfter >= prevEmotionCountBefore) {
          try {
            const secondRes = await togglePostEmotionApi({
              postId,
              emotionType: prevApiEmotionType,
            });

            const nextEmotions2 = secondRes?.emotions ?? data?.emotions;

            queryClient.setQueryData(postDetailKeys.detail(postId), (prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                emotions: nextEmotions2,
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
                        ? { ...p, emotions: nextEmotions2 ?? p.emotions }
                        : p,
                    ),
                  })),
                };
              },
            );
          } catch (err) {
            console.log("[community emotion] prev-cancel 보정 실패", {
              postId,
              prevEmotionType,
              err,
            });
          }
        }
      }

      if (typeof userOnSuccess === "function") {
        userOnSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};
