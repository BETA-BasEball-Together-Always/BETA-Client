// src/features/auth/services/emailCheckMutation.js
import {useMutation} from "@tanstack/react-query";
import {authKeys} from "./authKeys";
import api from "../../../shared/libs/api"; // TODO: 경로 수정

/**
 * 이메일 중복 확인 API
 * @param {string} email
 */
const emailDuplicateCheckApi = async (email) => {
  const response = await api.get("/api/auth/email/duplicate-check", {
    params: {email},
  });
  return response.data.duplicate;
};

/**
 * 사용 예:
 * const { data, isLoading } = useEmailCheckMutation(email, {
 *   enabled: email.includes('@'),
 * });
 */
export const useEmailCheckMutation = (email, options = {}) => {
  return useMutation({
    mutationKey: authKeys.emailDuplicate(email),
    mutationFn: (email) => emailDuplicateCheckApi(email),
    onSuccess: (data) => {
      console.log("Email check success:", data);
      // console.log("Email check success:", data.data);
    },
    onError: (error) => {
      console.log("Email check error:", error);
    },
  });
};
