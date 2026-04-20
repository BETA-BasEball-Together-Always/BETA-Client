import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMySearchLog } from "./searchApi";
import { searchKeys } from "./searchKeys";

export const useDeleteSearchLogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMySearchLog,
    onMutate: async (logId) => {
      await queryClient.cancelQueries({ queryKey: searchKeys.logs() });

      const previous = queryClient.getQueryData(searchKeys.logs());

      queryClient.setQueryData(searchKeys.logs(), (old) => {
        const nextLogs = (old?.logs ?? []).filter(
          (log) => String(log?.id) !== String(logId),
        );
        return { ...(old ?? {}), logs: nextLogs };
      });

      return { previous };
    },
    onError: (_error, _logId, context) => {
      if (context?.previous != null) {
        queryClient.setQueryData(searchKeys.logs(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.logs() });
    },
  });
};

export default useDeleteSearchLogMutation;
