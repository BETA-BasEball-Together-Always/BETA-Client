// src/features/auth/services/signupStatusMutation.js
import { useMutation } from "@tanstack/react-query";
import api from "../../../shared/libs/api";
import { getAccessTokenFromStoreOrMemory } from "../../../shared/libs/getAccessToken";

/**
 * GET /api/v1/auth/signup/status — 이탈 후 재진입 시 단계별 데이터(email, teamList 등) 조회용
 * 소셜 로그인 응답의 signupStep이 SOCIAL_AUTHENTICATED가 아닐 때 필수
 * accessToken은 로그인 응답 직후 전달(SecureStore 플러시 전 레이스 방지)
 * @param {string} accessToken
 */
export const fetchSignupStatusWithToken = async (accessToken) => {
  if (!accessToken) {
    throw new Error("NO_ACCESS_TOKEN");
  }

  const response = await api.get("/api/v1/auth/signup/status", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

// 현재 회원가입 단계 + 필요 데이터 조회
const fetchSignupStatus = async () => {
  const accessToken = await getAccessTokenFromStoreOrMemory();

  if (!accessToken) {
    throw new Error("NO_ACCESS_TOKEN");
  }

  return fetchSignupStatusWithToken(accessToken);
};

export const useSignupStatusMutation = () => {
  return useMutation({
    mutationFn: fetchSignupStatus,
  });
};
