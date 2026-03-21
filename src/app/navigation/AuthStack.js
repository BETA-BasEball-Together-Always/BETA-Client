import React, { useEffect, useLayoutEffect, useRef } from "react";
import LoginScreen from "@features/auth/screens/Login/LoginScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation, useRoute } from "@react-navigation/native";
import SignupFavoriteTeamScreen from "../../features/auth/screens/SignupFavoriteTeam/SignupFavoriteTeamScreen";
import SignupGenderAgeScreen from "../../features/auth/screens/SignupGenderAge/SignupGenderAgeScreen";
import SignupNicknameScreen from "../../features/auth/screens/SignupNickname/SignupNicknameScreen";
import SocialSignupScreen from "../../features/auth/screens/SignupCredentials/SocialSignupScreen";
import TermsDetailScreen from "../../features/auth/screens/TermsDetail/TermsDetailScreen";
import SignupCompleteScreen from "../../features/auth/screens/SignupComplete/SignupCompleteScreen";
import { consumePendingAuthResume } from "../../shared/auth/pendingAuthResume";
import { buildRootResetForAuthNestedResume } from "../../shared/auth/signupResumeStack";

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const resume = route.params?.resume ?? null;
  const authErrorMessage = route.params?.authErrorMessage ?? null;

  const didApplyResumeStack = useRef(false);

  useEffect(() => {
    consumePendingAuthResume();
  }, []);

  useLayoutEffect(() => {
    if (didApplyResumeStack.current || !resume) return;
    const action = buildRootResetForAuthNestedResume(resume);
    if (!action) return;
    didApplyResumeStack.current = true;
    navigation.dispatch(action);
  }, [resume, navigation]);

  const initialRouteName = resume?.name ?? "Login";

  const initialParamsFor = (screenName) =>
    resume?.name === screenName ? resume.params : undefined;

  const loginInitialParams =
    initialRouteName === "Login" && authErrorMessage
      ? { authErrorMessage }
      : undefined;

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRouteName}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        initialParams={loginInitialParams}
      />
      <Stack.Screen
        name="SocialSignup"
        component={SocialSignupScreen}
        initialParams={initialParamsFor("SocialSignup")}
      />
      <Stack.Screen
        name="TermsDetail"
        component={TermsDetailScreen}
        initialParams={initialParamsFor("TermsDetail")}
      />
      <Stack.Screen name="SignupNickname" component={SignupNicknameScreen} />
      <Stack.Screen
        name="SignupFavoriteTeam"
        component={SignupFavoriteTeamScreen}
        initialParams={initialParamsFor("SignupFavoriteTeam")}
      />
      <Stack.Screen
        name="SignupGenderAge"
        component={SignupGenderAgeScreen}
        initialParams={initialParamsFor("SignupGenderAge")}
      />
      <Stack.Screen
        name="SignupComplete"
        component={SignupCompleteScreen}
        initialParams={initialParamsFor("SignupComplete")}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
