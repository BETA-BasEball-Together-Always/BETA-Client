import React, { useEffect, useState } from "react";
import { AppState } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";

import NetInfo from "@react-native-community/netinfo";
import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
  focusManager,
} from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { initializeNaver } from "../features/auth/libs/Login/naverInit";
import { hydrateUserEmotionSelectionsFromStorage } from "../features/community/store/userEmotionSelectionStore";
import PushDeviceBootstrap from "../shared/components/PushDeviceBootstrap";
import PushOpenBootstrap from "../shared/components/PushOpenBootstrap";
import { flushPendingPushNavigation } from "../shared/services/pushOpenService";
import { rootNavigationRef } from "./navigation/rootNavigation";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 데이터 신선도/수명 관련 기본값
      staleTime: 30 * 1000, // 30초 동안은 fresh
      gcTime: 10 * 60 * 1000, // 5분 지나면 캐시 가비지 컬렉션
      retry: 1, // 실패 시 1회 재시도
      refetchOnReconnect: true, // 네트워크 복구 시 자동 리패치
      refetchOnWindowFocus: true, // RN에선 focusManager로 동작
    },
  },
});

const AppProviders = ({ children }) => {
  const [emotionHydrated, setEmotionHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await hydrateUserEmotionSelectionsFromStorage();
      if (!cancelled) setEmotionHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 1) 전역 폰트 로드 (NotoSansKR 3종)
  const [fontsLoaded] = useFonts({
    NotoSansKR_Light: require("@shared/assets/fonts/NotoSansKR-Light.ttf"),
    NotoSansKR_Regular: require("@shared/assets/fonts/NotoSansKR-Regular.ttf"),
    NotoSansKR_Medium: require("@shared/assets/fonts/NotoSansKR-Medium.ttf"),
    NotoSansKR_SemiBold: require("@shared/assets/fonts/NotoSansKR-SemiBold.ttf"),
  });

  // ✅ 0) 네이버 SDK 초기화 (앱 시작 시 한 번)
  useEffect(() => {
    try {
      initializeNaver();
      console.log("Naver SDK initialized");
    } catch (e) {
      console.log("Naver SDK init failed:", e);
    }
  }, []);

  // 2) 네트워크 연결 상태를 TanStack Query에 알려줌(동기화용) */
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected && !!state.isInternetReachable;
      onlineManager.setOnline(online);
    });
    return () => unsub();
  }, []);

  /* 앱 전후면(포커스) 상태를 TanStack Query에 알려줌(동기화용) */
  useEffect(() => {
    const sub = AppState.addEventListener("change", (status) => {
      focusManager.setFocused(status === "active");
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  const handleNavigationReady = () => {
    flushPendingPushNavigation();
  };

  const handleNavigationStateChange = () => {
    flushPendingPushNavigation();
  };

  if (!fontsLoaded || !emotionHydrated) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer
          ref={rootNavigationRef}
          onReady={handleNavigationReady}
          onStateChange={handleNavigationStateChange}
        >
          {children}
        </NavigationContainer>
        <PushOpenBootstrap />
        <PushDeviceBootstrap />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default AppProviders;
