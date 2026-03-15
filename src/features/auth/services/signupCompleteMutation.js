// src/features/auth/services/signupCompleteMutation.js
import { useMutation } from "@tanstack/react-query";
import { authKeys } from "./authKeys";
import api from "../../../shared/libs/api"; // TODO: 경로 수정

/**
 * 회원가입 완료 API
 * - gender/age가 포함되면 complete-with-info 호출
 * - 아니면 기본 complete 호출
 *
 * @param {{ gender?: 'M' | 'F'; age?: number }} body
 */
const signupCompleteApi = async ({ gender, age } = {}) => {
  const hasExtraInfo = !!gender || typeof age === "number";

  const endpoint = hasExtraInfo
    ? "/api/v1/auth/signup/complete-with-info"
    : "/api/v1/auth/signup/complete";

  const payload = hasExtraInfo ? { gender, age } : undefined;

  const response = await api.post(endpoint, payload);
  return response.data;
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
  });
};
