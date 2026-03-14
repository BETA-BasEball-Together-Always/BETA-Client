// src/features/auth/services/nicknameCheckMutation.js
import {useMutation} from "@tanstack/react-query";
import {authKeys} from "./authKeys";
import api from "../../../shared/libs/api"; // TODO: 경로 수정

/**
 * 닉네임 중복 확인 API
 * @param {string} nickname
 */
const nicknameCheckApi = async (nickname) => {
  const response = await api.get("/api/auth/nickname/duplicate-check", {
    params: {nickname},
  });
  return response.data.duplicate;
};

/**
 * 사용 예:
 * const { data, isLoading } = useNicknameCheckMutation(nickname, {
 *   enabled: nickname.length > 1,
 * });
 */
export const useNicknameCheckMutation = (nickname, options = {}) => {
  return useMutation({
    mutationKey: authKeys.nicknameDuplicate(nickname),
    mutationFn: (nickname) => nicknameCheckApi(nickname),
    onSuccess: (data) => {
      console.log("Nickname check success:", data);
    },
    onError: (error) => {
      console.log("Nickname check error:", error);
    },
  });
};
