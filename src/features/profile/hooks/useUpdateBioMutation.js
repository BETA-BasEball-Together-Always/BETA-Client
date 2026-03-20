import { useMutation } from "@tanstack/react-query";
import { updateMyBioApi } from "../services/mypageService";

export default function useUpdateBioMutation() {
  return useMutation({
    mutationFn: updateMyBioApi,
  });
}
