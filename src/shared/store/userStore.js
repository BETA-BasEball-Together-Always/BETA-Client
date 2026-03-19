// src/shared/store/userStore.js
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

/**
 * 사용자 전역 상태 + 토큰
 *
 * user 예시 (백엔드 UserDto 기반):
 * {
 *   id,
 *   email,
 *   nickname,
 *   favoriteTeamCode,
 *   favoriteTeamName,
 *   socialProvider,
 *   ...
 * }
 */
export const useUserStore = create((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,

  setUser: (user) => {
    set({ user });
    if (user?.favoriteTeamName) {
      SecureStore.setItemAsync("favoriteTeamLabel", user.favoriteTeamName);
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
  },
}));
