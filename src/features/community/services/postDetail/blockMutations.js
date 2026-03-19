import { useMutation } from "@tanstack/react-query";
import { blockUserApi, unblockUserApi } from "./postDetailApi";

export const useBlockUserMutation = () => {
  return useMutation({
    mutationFn: ({ userId }) => blockUserApi({ userId }),
  });
};

export const useUnblockUserMutation = () => {
  return useMutation({
    mutationFn: ({ userId }) => unblockUserApi({ userId }),
  });
};
