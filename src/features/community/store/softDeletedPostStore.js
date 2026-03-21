import { create } from "zustand";

const TTL_MS = 3 * 60 * 1000;

/**
 * 삭제 API 성공 직후 목록에 잠깐 남는 경우 피드에서 비활성 UI 표시
 * TTL 이후 자동 만료(메모리 정리)
 */
export const useSoftDeletedPostStore = create((set, get) => ({
  /** @type {Record<string, number>} postId -> expiresAt */
  entries: {},

  markDeleted: (postId) => {
    if (postId == null) return;
    const key = String(postId);
    set((s) => ({
      entries: { ...s.entries, [key]: Date.now() + TTL_MS },
    }));
  },

  isTombstoned: (postId) => {
    const exp = get().entries[String(postId)];
    return typeof exp === "number" && exp > Date.now();
  },
}));
