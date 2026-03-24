import { create } from "zustand";
import { persist } from "zustand/middleware";
import { normalizeCommunityEmotionType } from "../constants/communityReactions";
import { emotionSelectionJSONStorage } from "./emotionSelectionPersistStorage";

const keyOf = (postId) => String(postId);

export const useUserEmotionSelectionStore = create(
  persist(
    (set) => ({
      selectionsByPostId: {},
      setUserEmotionSelection: (postId, emotionTypeOrNull) =>
        set((prev) => {
          if (postId == null) return prev;

          const nextValue =
            emotionTypeOrNull == null
              ? null
              : normalizeCommunityEmotionType(emotionTypeOrNull);

          return {
            selectionsByPostId: {
              ...prev.selectionsByPostId,
              [keyOf(postId)]: nextValue,
            },
          };
        }),
      setUserEmotionSelectionsBulk: (entries) =>
        set((prev) => ({
          selectionsByPostId: {
            ...prev.selectionsByPostId,
            ...Object.fromEntries(
              (entries ?? []).map(([postId, emotionTypeOrNull]) => [
                keyOf(postId),
                emotionTypeOrNull == null
                  ? null
                  : normalizeCommunityEmotionType(emotionTypeOrNull),
              ]),
            ),
          },
        })),
      clearUserEmotionSelection: (postId) =>
        set((prev) => {
          if (postId == null) return prev;
          const next = { ...prev.selectionsByPostId };
          delete next[keyOf(postId)];
          return { selectionsByPostId: next };
        }),
      clearAllEmotionSelections: () => set({ selectionsByPostId: {} }),
    }),
    {
      name: "community-user-emotion-selections",
      storage: emotionSelectionJSONStorage,
      partialize: (state) => ({
        selectionsByPostId: state.selectionsByPostId,
      }),
    },
  ),
);

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
  return useUserEmotionSelectionStore.getState().selectionsByPostId[
    keyOf(postId)
  ];
}

export function useUserEmotionSelection(postId) {
  const k = postId == null ? null : keyOf(postId);
  return useUserEmotionSelectionStore((s) =>
    k == null ? undefined : s.selectionsByPostId[k],
  );
}

/** 로그아웃 시 로컬 감정 맵 + 파일 제거 */
export async function clearPersistedUserEmotionSelections() {
  useUserEmotionSelectionStore.getState().clearAllEmotionSelections();
  try {
    await useUserEmotionSelectionStore.persist.clearStorage();
  } catch {
    /* ignore */
  }
}

/** 첫 프레임 전에 디스크에서 감정 맵을 읽어 하트 UI가 비지 않게 함 */
export async function hydrateUserEmotionSelectionsFromStorage() {
  try {
    await useUserEmotionSelectionStore.persist.rehydrate();
  } catch {
    /* ignore */
  }
}
