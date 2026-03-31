import React, { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { homeKeys } from "../../features/home/services/homeKeys";

/**
 * 백그라운드 → 포그라운드 시 커뮤니티·홈·마이페이지·검색 등 캐시를 무효화해
 * 다른 사용자의 게시/댓글/감정/좋아요 등이 앱 재실행 없이 반영되도록 함.
 */
const CommunityDataSync = () => {
  const queryClient = useQueryClient();
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      if (next !== "active" || prev === "active") return;

      queryClient.invalidateQueries({ queryKey: ["community"] });
      queryClient.invalidateQueries({ queryKey: homeKeys.all });
      queryClient.invalidateQueries({ queryKey: ["mypage"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      queryClient.invalidateQueries({ queryKey: ["search"] });
    });
    return () => sub.remove();
  }, [queryClient]);

  return null;
};

export default CommunityDataSync;
