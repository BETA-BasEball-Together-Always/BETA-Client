import { create } from "zustand";

const keyOf = (postId, commentId) => `${postId}:${commentId}`;

function collectIds(list, out) {
  for (const c of list ?? []) {
    if (c?.commentId != null) out.add(c.commentId);
    collectIds(c.replies ?? [], out);
  }
}

/**
 * 삭제 직후 서버/캐시가 잠깐 옛 데이터를 주는 경우 UI에서 숨김
 * 서버 트리에 해당 id가 더 이상 없으면 키 제거
 */
export const useCommentRemovalStore = create((set, get) => ({
  hiddenKeys: {},

  hideComment: (postId, commentId) => {
    if (postId == null || commentId == null) return;
    const k = keyOf(postId, commentId);
    set((s) => ({ hiddenKeys: { ...s.hiddenKeys, [k]: true } }));
  },

  unhideComment: (postId, commentId) => {
    if (postId == null || commentId == null) return;
    const k = keyOf(postId, commentId);
    set((s) => {
      const next = { ...s.hiddenKeys };
      delete next[k];
      return { hiddenKeys: next };
    });
  },

  isHidden: (postId, commentId) => !!get().hiddenKeys[keyOf(postId, commentId)],

  /** 서버가 내려준 댓글 트리에 존재하는 id 집합으로 동기화 */
  syncWithServerTree: (postId, commentsRoot) => {
    if (postId == null) return;
    const ids = new Set();
    collectIds(commentsRoot ?? [], ids);
    const pid = String(postId);
    set((s) => {
      const next = { ...s.hiddenKeys };
      Object.keys(next).forEach((k) => {
        const idx = k.indexOf(":");
        if (idx < 0) return;
        if (k.slice(0, idx) !== pid) return;
        const id = Number(k.slice(idx + 1));
        if (!ids.has(id)) delete next[k];
      });
      return { hiddenKeys: next };
    });
  },

  clearPost: (postId) => {
    set((s) => {
      const next = { ...s.hiddenKeys };
      Object.keys(next).forEach((k) => {
        if (k.startsWith(`${postId}:`)) delete next[k];
      });
      return { hiddenKeys: next };
    });
  },
}));
