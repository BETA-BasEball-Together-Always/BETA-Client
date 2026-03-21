import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMySearchLog } from "./searchApi";
import { searchKeys } from "./searchKeys";

export const useDeleteSearchLogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMySearchLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: searchKeys.logs(),
      });
    },
  });
};

export default useDeleteSearchLogMutation;
