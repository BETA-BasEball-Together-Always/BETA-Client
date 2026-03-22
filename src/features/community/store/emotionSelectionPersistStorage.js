import * as FileSystem from "expo-file-system";
import { createJSONStorage } from "zustand/middleware";

const FILE_NAME = "community_user_emotion_selections_v1.json";

function getUri() {
  const base = FileSystem.documentDirectory;
  return base ? `${base}${FILE_NAME}` : null;
}

/**
 * zustand persist용 스토리지.
 * documentDirectory는 모듈 로드 직후에는 null일 수 있어,
 * getItem/setItem 호출 시마다 getUri()를 다시 본다 (이전 noop 고정 버그 방지).
 */
export const emotionSelectionJSONStorage = createJSONStorage(() => ({
  getItem: async (_name) => {
    const uri = getUri();
    if (!uri) return null;
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists) return null;
      return await FileSystem.readAsStringAsync(uri);
    } catch {
      return null;
    }
  },
  setItem: async (_name, value) => {
    const uri = getUri();
    if (!uri) return;
    try {
      await FileSystem.writeAsStringAsync(uri, value);
    } catch {
      /* ignore */
    }
  },
  removeItem: async (_name) => {
    const uri = getUri();
    if (!uri) return;
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch {
      /* ignore */
    }
  },
}));
