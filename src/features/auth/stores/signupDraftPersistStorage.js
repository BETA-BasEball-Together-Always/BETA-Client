import * as FileSystem from "expo-file-system";
import { createJSONStorage } from "zustand/middleware";

const FILE_NAME = "auth_signup_draft_v1.json";

const URI_RETRY_INTERVAL_MS = 50;
const URI_RETRY_MAX_ATTEMPTS = 80;

function getUri() {
  const base = FileSystem.documentDirectory;
  return base ? `${base}${FILE_NAME}` : null;
}

/**
 * documentDirectory가 아직 null인 경우가 있어 짧은 간격으로 재시도한 뒤 URI 확보
 */
async function resolveUriWithRetry() {
  for (let attempt = 0; attempt < URI_RETRY_MAX_ATTEMPTS; attempt++) {
    const uri = getUri();
    if (uri) return uri;
    await new Promise((r) => setTimeout(r, URI_RETRY_INTERVAL_MS));
  }
  return getUri();
}

/**
 * 회원가입 draft persist용 스토리지
 * documentDirectory는 모듈 로드 직후 null일 수 있어 읽기/쓰기 전 URI를 재시도로 확보
 */
export const signupDraftJSONStorage = createJSONStorage(() => ({
  getItem: async (_name) => {
    const uri = await resolveUriWithRetry();
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
    const uri = await resolveUriWithRetry();
    if (!uri) return;
    try {
      await FileSystem.writeAsStringAsync(uri, value);
    } catch {
      /* ignore */
    }
  },
  removeItem: async (_name) => {
    const uri = await resolveUriWithRetry();
    if (!uri) return;
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch {
      /* ignore */
    }
  },
}));
