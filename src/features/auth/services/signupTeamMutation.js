// src/features/auth/services/signupTeamMutation.js
import { useMutation } from "@tanstack/react-query";
import api from "../../../shared/libs/api";
import { getAccessTokenFromStoreOrMemory } from "../../../shared/libs/getAccessToken";

const signupTeamApi = async ({ teamCode }) => {
  const accessToken = await getAccessTokenFromStoreOrMemory();
  if (!accessToken) throw new Error("NO_ACCESS_TOKEN");

  const response = await api.post(
    "/api/v1/auth/signup/team",
    { teamCode },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  // { signupStep: 'TEAM_SELECTED' }
  return response.data;
};

export const useSignupTeamMutation = () => {
  return useMutation({
    mutationFn: signupTeamApi,
  });
};
