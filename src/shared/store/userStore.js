// src/shared/store/userStore.js
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { clearPersistedUserEmotionSelections } from "../../features/community/store/userEmotionSelectionStore";

const USER_JSON_KEY = "userJson";

async function safeDeleteSecureStoreKey(key) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    /* 키 없음/플랫폼 오류 등 — 로그아웃 흐름은 계속 진행 */
  }
}

export const useUserStore = create((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,

  setUser: async (user) => {
    set({ user });
    if (user?.favoriteTeamName) {
      SecureStore.setItemAsync("favoriteTeamLabel", user.favoriteTeamName);
    }
    try {
      if (user) {
        await SecureStore.setItemAsync(USER_JSON_KEY, JSON.stringify(user));
      } else {
        await SecureStore.deleteItemAsync(USER_JSON_KEY);
      }
    } catch {
      /* ignore */
    }
  },

  /**
   * 토큰 + 로컬 저장
   */
  setTokens: async ({ accessToken, refreshToken }) => {
    set({ accessToken, refreshToken });
    if (accessToken) {
      await SecureStore.setItemAsync("accessToken", accessToken);
    }
    if (refreshToken) {
      await SecureStore.setItemAsync("refreshToken", refreshToken);
    }
  },

  /**
   * 전체 인증 정보 초기화
   */
  clearAuth: async () => {
    set({ user: null, accessToken: null, refreshToken: null });
    await safeDeleteSecureStoreKey("accessToken");
    await safeDeleteSecureStoreKey("refreshToken");
    await safeDeleteSecureStoreKey("favoriteTeamLabel");
    await safeDeleteSecureStoreKey(USER_JSON_KEY);
    await clearPersistedUserEmotionSelections();
  },
}));
