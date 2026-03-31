import { useMutation, useQueryClient } from "@tanstack/react-query";
import postDetailKeys from "./postDetail/postDetailKeys";
import { togglePostEmotionApi } from "./postDetail/postDetailApi";
import communityKeys from "./communityKeys";
import { homeKeys } from "../../home/services/homeKeys";
import { mypageQueryKeys } from "../../profile/mypageQueryKeys";
import { setUserEmotionSelection } from "../store/userEmotionSelectionStore";
import { parseEmotionToggleServerResponse } from "../constants/communityReactions";
import { resolveCommunityPostId } from "../constants/communityReactions";
import { useRef } from "react";

const EMOTION_COUNT_FIELD = {
  LIKE: "likeCount",
  SAD: "sadCount",
  FUN: "funCount",
  HYPE: "hypeCount",
};

function patchEmotionCounts(emotions, fromType, toType) {
  const base = emotions && typeof emotions === "object" ? emotions : {};
  const next = { ...base };

  const dec = (t) => {
    const f = EMOTION_COUNT_FIELD[t];
    if (!f) return;
    const prev = typeof next[f] === "number" ? next[f] : 0;
    next[f] = Math.max(prev - 1, 0);
  };
  const inc = (t) => {
    const f = EMOTION_COUNT_FIELD[t];
    if (!f) return;
    const prev = typeof next[f] === "number" ? next[f] : 0;
    next[f] = prev + 1;
  };

  if (fromType && fromType !== toType) dec(fromType);
  if (toType && fromType !== toType) inc(toType);

  return next;
}

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
    onMutate: async (variables) => {
      const requestedType = variables?.emotionType;
      await queryClient.cancelQueries({ queryKey: postDetailKeys.detail(postId) });

      const previousDetail = queryClient.getQueryData(postDetailKeys.detail(postId));
      const previousHome = queryClient.getQueryData(homeKeys.all);
      const previousCommunityPostsQueries = queryClient.getQueriesData({
        queryKey: communityKeys.posts(),
      });
      const previousMypagePosts = queryClient.getQueryData(mypageQueryKeys.posts());
      const previousMypageCommented = queryClient.getQueryData(
        mypageQueryKeys.commented(),
      );

      const prevEmotionTypeRaw =
        previousDetail?.emotionType ??
        previousDetail?.selectedEmotionType ??
        previousDetail?.emotion ??
        null;
      const prevEmotionType = prevEmotionTypeRaw ?? null;

      const toggledOff =
        requestedType != null &&
        prevEmotionType != null &&
        String(prevEmotionType) === String(requestedType);

      const nextEmotionType = toggledOff ? null : requestedType ?? null;

      // store가 UI에 직접 영향을 주는 구조라(상세/카드 공통) 먼저 갱신
      setUserEmotionSelection(postId, nextEmotionType);

      // 1) PostDetail 캐시 optimistic
      queryClient.setQueryData(postDetailKeys.detail(postId), (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          emotions: patchEmotionCounts(prev.emotions, prev.emotionType ?? null, nextEmotionType),
          emotionType: nextEmotionType,
        };
      });

      const patchPostEmotionsInPagesOptimistic = (prev) => {
        if (!prev?.pages) return prev;
        return {
          ...prev,
          pages: prev.pages.map((page) => ({
            ...page,
            posts: (page.posts ?? []).map((p) => {
              const pid = resolveCommunityPostId(p) ?? p.postId ?? p.id;
              if (String(pid) !== String(postId)) return p;
              const fromType = p.emotionType ?? null;
              return {
                ...p,
                emotions: patchEmotionCounts(p.emotions, fromType, nextEmotionType),
                emotionType: nextEmotionType,
              };
            }),
          })),
        };
      };

      // 2) 커뮤니티 리스트 캐시 optimistic
      queryClient.setQueriesData(
        { queryKey: communityKeys.posts() },
        patchPostEmotionsInPagesOptimistic,
      );

      // 3) 홈 인기글 optimistic
      queryClient.setQueryData(homeKeys.all, (prev) => {
        if (!prev?.popularPosts || !Array.isArray(prev.popularPosts)) return prev;
        return {
          ...prev,
          popularPosts: prev.popularPosts.map((p) => {
            const pid = resolveCommunityPostId(p) ?? p.postId ?? p.id;
            if (String(pid) !== String(postId)) return p;
            const fromType = p.emotionType ?? null;
            return {
              ...p,
              emotions: patchEmotionCounts(p.emotions, fromType, nextEmotionType),
              emotionType: nextEmotionType,
            };
          }),
        };
      });

      // 4) 마이스타디움 탭들 optimistic
      queryClient.setQueryData(mypageQueryKeys.posts(), patchPostEmotionsInPagesOptimistic);
      queryClient.setQueryData(
        mypageQueryKeys.commented(),
        patchPostEmotionsInPagesOptimistic,
      );

      return {
        previousDetail,
        previousHome,
        previousCommunityPostsQueries,
        previousMypagePosts,
        previousMypageCommented,
        previousStoreSelection: prevEmotionType,
      };
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
              String(resolveCommunityPostId(p) ?? p.postId ?? p.id) ===
              String(postId)
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
            String(resolveCommunityPostId(p) ?? p.postId ?? p.id) ===
            String(postId)
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
                (p) =>
                  String(resolveCommunityPostId(p) ?? p.postId ?? p.id) !==
                  String(postId),
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
    onError: (_err, _variables, context) => {
      // optimistic 롤백
      if (context?.previousDetail !== undefined) {
        queryClient.setQueryData(postDetailKeys.detail(postId), context.previousDetail);
      }
      if (Array.isArray(context?.previousCommunityPostsQueries)) {
        for (const [key, data] of context.previousCommunityPostsQueries) {
          queryClient.setQueryData(key, data);
        }
      }
      if (context?.previousHome !== undefined) {
        queryClient.setQueryData(homeKeys.all, context.previousHome);
      }
      if (context?.previousMypagePosts !== undefined) {
        queryClient.setQueryData(mypageQueryKeys.posts(), context.previousMypagePosts);
      }
      if (context?.previousMypageCommented !== undefined) {
        queryClient.setQueryData(
          mypageQueryKeys.commented(),
          context.previousMypageCommented,
        );
      }
      setUserEmotionSelection(postId, context?.previousStoreSelection ?? null);
    },
    ...restOptions,
  });
};
