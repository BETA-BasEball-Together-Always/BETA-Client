// src/features/auth/services/signupConsentMutation.js
import { useMutation } from "@tanstack/react-query";
import api from "../../../shared/libs/api";
import { getAccessTokenFromStoreOrMemory } from "../../../shared/libs/getAccessToken";

const signupConsentApi = async ({ personalInfoRequired, agreeMarketing }) => {
  const accessToken = await getAccessTokenFromStoreOrMemory();
  if (!accessToken) throw new Error("NO_ACCESS_TOKEN");

  const response = await api.post(
    "/api/v1/auth/signup/consent",
    {
      personalInfoRequired,
      agreeMarketing,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  // { signupStep: 'CONSENT_AGREED', email }
  return response.data;
};

export const useSignupConsentMutation = () => {
  return useMutation({
    mutationFn: signupConsentApi,
  });
};
