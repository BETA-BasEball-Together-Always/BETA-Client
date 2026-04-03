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
import PushDeviceBootstrap from "../shared/component/PushDeviceBootstrap";
import PushOpenBootstrap from "../shared/components/PushOpenBootstrap";
import { flushPendingPushNavigation } from "../shared/services/pushOpenService";
import { rootNavigationRef } from "./navigation/rootNavigation";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
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

  const [fontsLoaded] = useFonts({
    NotoSansKR_Light: require("@shared/assets/fonts/NotoSansKR-Light.ttf"),
    NotoSansKR_Regular: require("@shared/assets/fonts/NotoSansKR-Regular.ttf"),
    NotoSansKR_Medium: require("@shared/assets/fonts/NotoSansKR-Medium.ttf"),
    NotoSansKR_SemiBold: require("@shared/assets/fonts/NotoSansKR-SemiBold.ttf"),
  });

  useEffect(() => {
    try {
      initializeNaver();
      console.log("Naver SDK initialized");
    } catch (e) {
      console.log("Naver SDK init failed:", e);
    }
  }, []);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected && !!state.isInternetReachable;
      onlineManager.setOnline(online);
    });
    return () => unsub();
  }, []);

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
