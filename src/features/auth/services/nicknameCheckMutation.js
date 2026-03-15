// src/features/auth/services/nicknameCheckMutation.js
import { useMutation } from "@tanstack/react-query";
import { authKeys } from "./authKeys";
import api from "../../../shared/libs/api";
import * as SecureStore from "expo-secure-store";

/**
 * 닉네임 중복 확인 API
 * @param {string} nickname
 */
const nicknameCheckApi = async (nickname) => {
  // 닉네임 중복 체크는 인증 필요 → SecureStore에 저장된 accessToken을 사용
  const accessToken = await SecureStore.getItemAsync("accessToken");

  if (!accessToken) {
    throw new Error("NO_ACCESS_TOKEN");
  }

  const response = await api.get("/api/v1/auth/nickname/duplicate-check", {
    params: { nickname },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  // 백엔드 명세: { duplicate: boolean }
  return response.data.duplicate;
};

// useCheckedField에서 mutateAsync로 직접 호출하는 용도
export const useNicknameCheckMutation = () => {
  return useMutation({
    mutationKey: authKeys.nicknameDuplicate("GLOBAL"),
    mutationFn: (nickname) => nicknameCheckApi(nickname),
    onSuccess: (data) => {
      console.log("Nickname check success:", data);
    },
    onError: (error) => {
      console.log("Nickname check error:", error);
    },
  });
};
