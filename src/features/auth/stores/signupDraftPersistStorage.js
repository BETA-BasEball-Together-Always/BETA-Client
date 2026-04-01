import * as FileSystem from "expo-file-system";
import { createJSONStorage } from "zustand/middleware";

const FILE_NAME = "auth_signup_draft_v1.json";

function getUri() {
  const base = FileSystem.documentDirectory;
  return base ? `${base}${FILE_NAME}` : null;
}

/**
 * 회원가입 draft persist용 스토리지
 * documentDirectory는 모듈 로드 직후 null일 수 있어 getItem/setItem마다 URI를 재계산
 */
export const signupDraftJSONStorage = createJSONStorage(() => ({
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
