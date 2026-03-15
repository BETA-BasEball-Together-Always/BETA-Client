// src/features/auth/services/signupCompleteMutation.js
import { useMutation } from "@tanstack/react-query";
import { authKeys } from "./authKeys";
import api from "../../../shared/libs/api"; // TODO: 경로 수정

/**
 * 회원가입 완료 API
 * @param {{
 *   socialToken?: string;
 *   social?: 'KAKAO' | 'NAVER';
 *   email: string;
 *   password: string;
 *   nickName: string;
 *   favoriteTeamCode: string;
 *   gender?: 'M' | 'F';
 *   age?: number;
 *   bio?: string;
 *   personalInfoRequired: boolean;
 *   agreeMarketing?: boolean;
 * }} body
 */
const signupCompleteApi = (body) => {
  return api.post("/api/auth/signup/complete", body);
};

/**
 * 사용 예:
 * const signupMutation = useSignupCompleteMutation();
 * signupMutation.mutate(formValues);
 */
export const useSignupCompleteMutation = () => {
  return useMutation({
    mutationKey: authKeys.signupComplete(),
    mutationFn: signupCompleteApi,
    onSuccess: (response) => {
      console.log("소셜 로그인 성공:", response.data);
    },
    onError: (error) => {
      console.log("소셜 로그인 실패:", error);
    },
  });
};
