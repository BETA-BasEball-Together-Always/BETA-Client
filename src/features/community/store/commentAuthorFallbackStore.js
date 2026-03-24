import { create } from "zustand";
import * as FileSystem from "expo-file-system";

const CACHE_FILE = `${FileSystem.cacheDirectory}deleted-comment-authors.json`;

let hydratePromise = null;

async function readMapFromDisk() {
  try {
    const info = await FileSystem.getInfoAsync(CACHE_FILE);
    if (!info.exists) return {};
    const raw = await FileSystem.readAsStringAsync(CACHE_FILE);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed != null ? parsed : {};
  } catch {
    return {};
  }
}

async function writeMapToDisk(map) {
  try {
    await FileSystem.writeAsStringAsync(CACHE_FILE, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/**
 * 소프트 삭제(답글 있음) 댓글: 서버가 reload 후 author를 비우는 경우 UI 복구용 스냅샷
 */
export const useCommentAuthorFallbackStore = create((set, get) => ({
  map: {},
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    if (hydratePromise) return hydratePromise;
    hydratePromise = (async () => {
      const m = await readMapFromDisk();
      set({ map: m, hydrated: true });
    })();
    return hydratePromise;
  },

  /** 삭제 직전 mergeFlatAuthor(c) 결과를 저장 */
  saveAuthorSnapshot: (commentId, author) => {
    if (commentId == null || author == null) return;
    const id = String(commentId);
    set((s) => {
      const next = { ...s.map, [id]: author };
      writeMapToDisk(next);
      return { map: next, hydrated: true };
    });
  },

  getSnapshot: (commentId) =>
    commentId == null ? undefined : get().map[String(commentId)],
}));
