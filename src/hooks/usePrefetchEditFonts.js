// src/hooks/usePrefetchEditFonts.ts
// Expo Font를 사용하여 편집 화면에서 사용하는 폰트를 선택 화면에서 미리 로드하는 커스텀 훅
import * as Font from "expo-font";
import { useRef } from "react";

export function usePrefetchEditFonts() {
  const loadedRef = useRef(false);

  const prefetch = async () => {
    if (loadedRef.current) return;
    await Font.loadAsync({
      Surround_Bold:    require("../shared/assets/fonts/Surround-Bold.ttf"),
      Dohyeon_Regular:  require("../shared/assets/fonts/Dohyeon-Regular.ttf"),
      Myungjo_Medium:   require("../shared/assets/fonts/Myungjo-Medium.ttf"),
      MeetMe_Regular:   require("../shared/assets/fonts/MeetMe-Regular.ttf"),
    });
    loadedRef.current = true;
  };

  return { prefetch, isPrefetched: () => loadedRef.current };
}
