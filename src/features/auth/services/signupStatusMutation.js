// src/features/auth/services/signupStatusMutation.js
import { useMutation } from "@tanstack/react-query";
import api from "../../../shared/libs/api";
import * as SecureStore from "expo-secure-store";

// 현재 회원가입 단계 + 필요 데이터 조회
const fetchSignupStatus = async () => {
  const accessToken = await SecureStore.getItemAsync("accessToken");

  if (!accessToken) {
    throw new Error("NO_ACCESS_TOKEN");
  }

  const response = await api.get("/api/v1/auth/signup/status", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // { signupStep, email, teamList }
  return response.data;
};

export const useSignupStatusMutation = () => {
  return useMutation({
    mutationFn: fetchSignupStatus,
  });
};
