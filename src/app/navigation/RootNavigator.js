import React, { useCallback, useEffect, useState } from "react";
import AuthStack from "./AuthStack";
import MainTabNavigator from "./MainTabNavigator";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "@app/SplashScreen";
import CommunityStack from "./CommunityStack";
import SearchScreen from "@features/search/screens/SearchScreen";
import {
  bootstrapSession,
  getBootstrapAuthSignupStartFallback,
} from "../../shared/services/sessionBootstrap";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const [boot, setBoot] = useState(null);
  /** 세션 준비 후 SplashScreen에서 BETA 로고 페이드아웃이 끝나면 true */
  const [splashDismissed, setSplashDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await bootstrapSession();
        if (!cancelled) setBoot(result);
      } catch (e) {
        console.warn("[bootstrapSession]", e);
        if (!cancelled) setBoot(getBootstrapAuthSignupStartFallback());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSplashExitComplete = useCallback(() => {
    setSplashDismissed(true);
  }, []);

  if (!splashDismissed) {
    return (
      <SplashScreen bootResult={boot} onExitComplete={onSplashExitComplete} />
    );
  }

  const safeBoot = boot ?? getBootstrapAuthSignupStartFallback();
  const initialRouteName = safeBoot?.destination === "main" ? "Main" : "Auth";

  const authInitialParams =
    safeBoot?.destination === "auth"
      ? {
          resume: safeBoot?.resume ?? null,
          authErrorMessage: safeBoot?.authErrorMessage ?? null,
        }
      : undefined;

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRouteName}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen
        name="Auth"
        component={AuthStack}
        initialParams={authInitialParams}
      />
      <Stack.Screen name="Community" component={CommunityStack} />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ animation: "slide_from_right" }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
