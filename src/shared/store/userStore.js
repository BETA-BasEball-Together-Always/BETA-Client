// src/shared/store/userStore.js
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

const USER_JSON_KEY = "userJson";

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
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    await SecureStore.deleteItemAsync("favoriteTeamLabel");
    try {
      await SecureStore.deleteItemAsync(USER_JSON_KEY);
    } catch {
      /* ignore */
    }
  },
}));
