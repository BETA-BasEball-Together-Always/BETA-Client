// src/features/auth/services/signupTeamMutation.js
import { useMutation } from "@tanstack/react-query";
import api from "../../../shared/libs/api";
import * as SecureStore from "expo-secure-store";

const signupTeamApi = async ({ teamCode }) => {
  const accessToken = await SecureStore.getItemAsync("accessToken");
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
