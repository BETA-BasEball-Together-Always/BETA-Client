import { useMutation, useQueryClient } from "@tanstack/react-query";
import postDetailKeys from "./postDetail/postDetailKeys";
import { togglePostEmotionApi } from "./postDetail/postDetailApi";
import communityKeys from "./communityKeys";
import { homeKeys } from "../../home/services/homeKeys";
import { mypageQueryKeys } from "../../profile/mypageQueryKeys";
import { setUserEmotionSelection } from "../store/userEmotionSelectionStore";
import { parseEmotionToggleServerResponse } from "../constants/communityReactions";
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
      const parsed = parseEmotionToggleServerResponse(data, variables);
      const {
        toggledOn,
        toggledOff,
        resolvedEmotionType: resolvedEmotionAfterToggle,
        ambiguous,
      } = parsed;

      console.log("[community emotion] mutation onSuccess (cache 반영 전)", {
        postId,
        requestUiId: variables?.emotionType,
        requestApiType: variables?.emotionType,
        responseEmotionType: data?.emotionType,
        resolvedEmotionAfterToggle,
        toggled: data?.toggled,
        parsedToggle: { toggledOn, toggledOff, ambiguous },
        emotionsFromServer: data?.emotions,
      });

      queryClient.setQueryData(postDetailKeys.detail(postId), (prev) => {
        if (!prev) return prev;
        const nextEmotions = data?.emotions ?? prev.emotions;
        if (ambiguous) {
          return { ...prev, emotions: nextEmotions };
        }
        return {
          ...prev,
          emotions: nextEmotions,
          ...(toggledOff
            ? { emotionType: null }
            : {
                emotionType:
                  resolvedEmotionAfterToggle ?? prev.emotionType ?? null,
              }),
        };
      });

      const patchPostEmotionsInPages = (prev) => {
        if (!prev?.pages) return prev;
        return {
          ...prev,
          pages: prev.pages.map((page) => ({
            ...page,
            posts: (page.posts ?? []).map((p) =>
              String(p.postId) === String(postId)
                ? {
                    ...p,
                    emotions: data?.emotions ?? p.emotions,
                    ...(ambiguous
                      ? {}
                      : toggledOff
                        ? { emotionType: null }
                        : {
                            emotionType:
                              resolvedEmotionAfterToggle ??
                              p.emotionType ??
                              null,
                          }),
                  }
                : p,
            ),
          })),
        };
      };

      queryClient.setQueriesData(
        { queryKey: communityKeys.posts() },
        patchPostEmotionsInPages,
      );

      queryClient.setQueryData(homeKeys.all, (prev) => {
        if (!prev?.popularPosts || !Array.isArray(prev.popularPosts)) {
          return prev;
        }
        return {
          ...prev,
          popularPosts: prev.popularPosts.map((p) =>
            String(p.postId) === String(postId)
              ? {
                  ...p,
                  emotions: data?.emotions ?? p.emotions,
                  ...(ambiguous
                    ? {}
                    : toggledOff
                      ? { emotionType: null }
                      : {
                          emotionType:
                            resolvedEmotionAfterToggle ?? p.emotionType ?? null,
                        }),
                }
              : p,
          ),
        };
      });

      /** 마이스타디움 내 피드 탭/댓글 단 글 탭: 커뮤니티 목록과 동일하게 emotions 동기화 */
      queryClient.setQueryData(
        mypageQueryKeys.posts(),
        patchPostEmotionsInPages,
      );
      queryClient.setQueryData(
        mypageQueryKeys.commented(),
        patchPostEmotionsInPages,
      );

      if (!ambiguous) {
        setUserEmotionSelection(
          postId,
          toggledOn ? resolvedEmotionAfterToggle : null,
        );
      }

      // 마이페이지「좋아요」탭: 감정 제거 시 목록에서 제거 (API /mypage/liked는 반응 있는 글만)
      if (toggledOff) {
        queryClient.setQueryData(mypageQueryKeys.liked(), (prev) => {
          if (!prev?.pages) return prev;
          return {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              posts: (page.posts ?? []).filter(
                (p) => String(p.postId) !== String(postId),
              ),
            })),
          };
        });
      }

      // 감정 등록/변경 시 좋아요 탭 목록이 즉시 반영되도록 서버 목록 재조회
      if (toggledOn) {
        queryClient.invalidateQueries({ queryKey: mypageQueryKeys.liked() });
      }

      if (typeof userOnSuccess === "function") {
        userOnSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};
