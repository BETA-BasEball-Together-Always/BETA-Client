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
import { useSignupDraftStore } from "../../features/auth/stores/useSignupDraftStore";

const Stack = createNativeStackNavigator();

const SIGNUP_DRAFT_HYDRATION_WAIT_RESUME_ROUTES = new Set([
  "SocialSignup",
  "SignupFavoriteTeam",
  "SignupGenderAge",
  "TermsDetail",
  "SignupNickname",
]);

const RootNavigator = () => {
  const [boot, setBoot] = useState(null);
  /** 세션 준비 후 SplashScreen에서 BETA 로고 페이드아웃이 끝나면 true */
  const [splashDismissed, setSplashDismissed] = useState(false);

  const [draftHydrated, setDraftHydrated] = useState(() =>
    useSignupDraftStore.persist.hasHydrated(),
  );
  const [hydrationWaitTimedOut, setHydrationWaitTimedOut] = useState(false);

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

  useEffect(() => {
    if (draftHydrated) return;
    let cancelled = false;
    const unsub = useSignupDraftStore.persist.onFinishHydration(() => {
      if (!cancelled) setDraftHydrated(true);
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [draftHydrated]);

  const shouldWaitSignupDraftHydration =
    boot?.destination === "auth" &&
    boot?.resume != null &&
    typeof boot.resume?.name === "string" &&
    SIGNUP_DRAFT_HYDRATION_WAIT_RESUME_ROUTES.has(boot.resume.name);

  useEffect(() => {
    if (!shouldWaitSignupDraftHydration) {
      setHydrationWaitTimedOut(false);
      return;
    }
    if (draftHydrated) {
      setHydrationWaitTimedOut(false);
      return;
    }
    setHydrationWaitTimedOut(false);
    const t = setTimeout(() => {
      setHydrationWaitTimedOut(true);
    }, 3000);
    return () => {
      clearTimeout(t);
    };
  }, [shouldWaitSignupDraftHydration, draftHydrated]);

  const onSplashExitComplete = useCallback(() => {
    setSplashDismissed(true);
  }, []);

  if (!splashDismissed) {
    const canExitSplash =
      boot != null &&
      (!shouldWaitSignupDraftHydration ||
        draftHydrated ||
        hydrationWaitTimedOut);
    return (
      <SplashScreen
        bootResult={canExitSplash ? boot : null}
        onExitComplete={onSplashExitComplete}
      />
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
