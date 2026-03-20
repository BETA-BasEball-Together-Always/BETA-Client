import { create } from "zustand";

const VALID_EMOTION_TYPES = new Set(["LIKE", "SAD", "FUN", "HYPE"]);

/**
 * postId -> emotionType (LIKE|SAD|FUN|HYPE|null)
 *
 * - In-memory Map만 쓰면 API 하이드레이션 이후에도 UI가 갱신되지 않아서
 *   Zustand로 바꿔 postCard 등에서 즉시 반영되게 처리
 */
export const useUserEmotionSelectionStore = create((set) => ({
  selectionsByPostId: {},
  setUserEmotionSelection: (postId, emotionTypeOrNull) =>
    set((prev) => {
      if (postId == null) return prev;

      const nextValue =
        emotionTypeOrNull == null
          ? null
          : VALID_EMOTION_TYPES.has(emotionTypeOrNull)
            ? emotionTypeOrNull
            : null;

      return {
        selectionsByPostId: {
          ...prev.selectionsByPostId,
          [postId]: nextValue,
        },
      };
    }),
  setUserEmotionSelectionsBulk: (entries) =>
    set((prev) => ({
      selectionsByPostId: {
        ...prev.selectionsByPostId,
        ...Object.fromEntries(
          (entries ?? []).map(([postId, emotionTypeOrNull]) => [
            postId,
            emotionTypeOrNull == null
              ? null
              : VALID_EMOTION_TYPES.has(emotionTypeOrNull)
                ? emotionTypeOrNull
                : null,
          ]),
        ),
      },
    })),
  clearUserEmotionSelection: (postId) =>
    set((prev) => {
      if (postId == null) return prev;
      const next = { ...prev.selectionsByPostId };
      delete next[postId];
      return { selectionsByPostId: next };
    }),
}));

/**
 * 기존 코드 호환용: store를 직접 업데이트하는 함수 export
 * (emotionMutations 등에서 "일반 함수 형태"로 import 중)
 */
export function setUserEmotionSelection(postId, emotionTypeOrNull) {
  useUserEmotionSelectionStore
    .getState()
    .setUserEmotionSelection(postId, emotionTypeOrNull);
}

export function clearUserEmotionSelection(postId) {
  useUserEmotionSelectionStore.getState().clearUserEmotionSelection(postId);
}

export function getUserEmotionSelection(postId) {
  if (postId == null) return undefined;
  return useUserEmotionSelectionStore.getState().selectionsByPostId[postId];
}

export function useUserEmotionSelection(postId) {
  return useUserEmotionSelectionStore((s) => s.selectionsByPostId[postId]);
}
