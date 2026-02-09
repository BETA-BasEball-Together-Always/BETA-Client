// src/features/auth/services/socialLoginMutation.js
import { useMutation } from "@tanstack/react-query";
import { authKeys } from "./authKeys";
// TODO: 프로젝트에 맞게 axiosInstance 경로 수정
import api from "../../../shared/libs/api";

/**
 * 소셜 로그인 API
 * @param {'KAKAO'|'NAVER'} provider
 * @param {{ token: string }} body
 */
const socialLoginApi = (provider, body) => {
  // 전체 URL 출력
  //   console.log(
  //     "➡️ 요청 URL:",
  //     `${api.defaults.baseURL}${`/api/auth/login/${provider}`}`
  //   );
  //   console.log("socialLoginApi called with:", provider, body);
  return api.post(`/api/auth/login/${provider}`, body);
};

/**
 * 사용 예:
 * const socialLoginMutation = useSocialLoginMutation();
 * socialLoginMutation.mutate({ provider: 'KAKAO', token: kakaoToken });
 */
export const useSocialLoginMutation = () => {
  return useMutation({
    mutationKey: authKeys.socialLogin("GLOBAL"), // Devtools에서 묶어보는용, 실사용은 변수로 구분
    mutationFn: ({ provider, token, deviceId }) =>
      socialLoginApi(provider, { token, deviceId }),
    // 👇 성공 시 여기서 response 사용 가능
  });
};
