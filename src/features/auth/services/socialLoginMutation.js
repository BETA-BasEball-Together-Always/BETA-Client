// src/features/auth/services/socialLoginMutation.js
import { useMutation } from "@tanstack/react-query";
import { authKeys } from "./authKeys";
// TODO: 프로젝트에 맞게 axiosInstance 경로 수정
import api from "../../../shared/libs/api";

/**
 * 소셜 로그인 API
 * @param {'KAKAO'|'NAVER'|'APPLE'} provider
 * @param {{ token: string; deviceId: string }} body
 */
const socialLoginApi = (provider, body) => {
  return api.post(`/api/v1/auth/login/${provider}`, body);
};

/**
 * 사용 예:
 * const socialLoginMutation = useSocialLoginMutation();
 * socialLoginMutation.mutate({ provider: 'KAKAO', token: kakaoToken, deviceId });
 */
export const useSocialLoginMutation = () => {
  return useMutation({
    mutationKey: authKeys.socialLogin("GLOBAL"), // Devtools에서 묶어보는용, 실사용은 변수로 구분
    mutationFn: ({ provider, token, deviceId }) =>
      socialLoginApi(provider, { token, deviceId }),
  });
};
