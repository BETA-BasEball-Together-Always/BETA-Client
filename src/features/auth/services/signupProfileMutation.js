// src/features/auth/services/signupProfileMutation.js
import { useMutation } from "@tanstack/react-query";
import api from "../../../shared/libs/api";
import { getAccessTokenFromStoreOrMemory } from "../../../shared/libs/getAccessToken";

const signupProfileApi = async ({ nickname }) => {
  const accessToken = await getAccessTokenFromStoreOrMemory();
  if (!accessToken) throw new Error("NO_ACCESS_TOKEN");

  const response = await api.post(
    "/api/v1/auth/signup/profile",
    { nickname },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  // { signupStep: 'PROFILE_COMPLETED', teamList: [...] }
  return response.data;
};

export const useSignupProfileMutation = () => {
  return useMutation({
    mutationFn: signupProfileApi,
  });
};
