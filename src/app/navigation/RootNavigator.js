import React, { useEffect, useState } from "react";
import AuthStack from "./AuthStack";
import MainTabNavigator from "./MainTabNavigator";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "@app/SplashScreen";
import CommunityStack from "./CommunityStack";
import { bootstrapSession } from "../../shared/services/sessionBootstrap";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const [boot, setBoot] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const MIN_SPLASH_MS = 1200;

    (async () => {
      try {
        const [result] = await Promise.all([
          bootstrapSession(),
          new Promise((r) => setTimeout(r, MIN_SPLASH_MS)),
        ]);
        if (!cancelled) setBoot(result);
      } catch (e) {
        console.warn("[bootstrapSession]", e);
        if (!cancelled)
          setBoot({ destination: "auth", authErrorMessage: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (boot == null) {
    return <SplashScreen />;
  }

  const initialRouteName = boot.destination === "main" ? "Main" : "Auth";

  const authInitialParams =
    boot.destination === "auth"
      ? {
          resume: boot.resume ?? null,
          authErrorMessage: boot.authErrorMessage ?? null,
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
    </Stack.Navigator>
  );
};

export default RootNavigator;
