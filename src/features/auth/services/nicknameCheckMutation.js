// src/features/auth/services/nicknameCheckMutation.js
import { useMutation } from "@tanstack/react-query";
import { authKeys } from "./authKeys";
import api from "../../../shared/libs/api";
import { getAccessTokenFromStoreOrMemory } from "../../../shared/libs/getAccessToken";

/**
 * 닉네임 중복 확인 API
 * @param {string} nickname
 */
const nicknameCheckApi = async (nickname) => {
  const accessToken = await getAccessTokenFromStoreOrMemory();

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
  const raw = response?.data?.duplicate;
  if (typeof raw !== "boolean") {
    throw new Error("INVALID_NICKNAME_CHECK_RESPONSE");
  }
  return raw;
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
