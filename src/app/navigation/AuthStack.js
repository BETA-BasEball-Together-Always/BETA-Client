import React, { useEffect, useLayoutEffect, useMemo } from "react";
import LoginScreen from "@features/auth/screens/Login/LoginScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation, useRoute } from "@react-navigation/native";
import SignupFavoriteTeamScreen from "../../features/auth/screens/SignupFavoriteTeam/SignupFavoriteTeamScreen";
import SignupGenderAgeScreen from "../../features/auth/screens/SignupGenderAge/SignupGenderAgeScreen";
import SignupNicknameScreen from "../../features/auth/screens/SignupNickname/SignupNicknameScreen";
import SocialSignupScreen from "../../features/auth/screens/SignupCredentials/SocialSignupScreen";
import TermsDetailScreen from "../../features/auth/screens/TermsDetail/TermsDetailScreen";
import TermsTosDetailScreen from "../../features/auth/screens/TermsDetail/TermsTosDetailScreen";
import TermsPrivacyRequiredDetailScreen from "../../features/auth/screens/TermsDetail/TermsPrivacyRequiredDetailScreen";
import SignupCompleteScreen from "../../features/auth/screens/SignupComplete/SignupCompleteScreen";
import { consumePendingAuthResume } from "../../shared/auth/pendingAuthResume";
import {
  hasAuthResumeResetAlreadyApplied,
  markAuthResumeResetApplied,
} from "../../shared/auth/authResumeResetGuard";
import { buildRootResetForAuthNestedResume } from "../../shared/auth/signupResumeStack";
import { rootNavigationRef } from "./rootNavigation";

const Stack = createNativeStackNavigator();

const VALID_AUTH_RESUME_SCREEN_NAMES = new Set([
  "Login",
  "SocialSignup",
  "TermsDetail",
  "TermsTosDetail",
  "TermsPrivacyRequiredDetail",
  "SignupNickname",
  "SignupFavoriteTeam",
  "SignupGenderAge",
  "SignupComplete",
]);

function coerceResumeForAuthStack(resume) {
  if (!resume || typeof resume?.name !== "string") return null;
  const name = resume.name.trim();
  if (!VALID_AUTH_RESUME_SCREEN_NAMES.has(name)) {
    return { name: "Login", params: {} };
  }
  if (resume.params != null && typeof resume.params === "object") {
    return { name, params: resume.params };
  }
  return { name };
}

/**
 * 레이아웃 직후 바로 reset하면 컨테이너/네이티브 스택이 아직 준비되지 않은 경우가 있어
 * InteractionManager + rAF로 한 틱 미루고, root ref가 준비된 뒤 dispatch
 *
 * @param {object} [options]
 * @param {() => void} [options.onBeforeDispatch] — navigation.dispatch 직전
 * @param {() => void} [options.onDone] — dispatch 이후 finally
 * @param {() => boolean} [options.shouldSkip] — true면 dispatch 생략 (이펙트 cleanup 등)
 */
function dispatchResumeWhenReady(navigation, action, options) {
  const { onBeforeDispatch, onDone, shouldSkip } = options ?? {};
  let didRun = false;
  const run = () => {
    if (didRun) return;
    if (shouldSkip?.()) return;
    didRun = true;
    try {
      onBeforeDispatch?.();
      navigation.dispatch(action);
    } catch (e) {
      console.warn("[AuthStack] resume stack dispatch failed", e);
    } finally {
      onDone?.();
    }
  };

  // 준비되어 있으면 즉시 dispatch (깜빡임 최소화)
  if (rootNavigationRef.isReady()) {
    run();
    return;
  }

  // 준비되지 않았으면 rAF로 한 번만 미룸
  requestAnimationFrame(() => {
    run();
  });
}

const AuthStack = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const rawResume = route.params?.resume ?? null;
  const resume = useMemo(
    () => (rawResume == null ? null : coerceResumeForAuthStack(rawResume)),
    [rawResume],
  );
  const authErrorMessage = route.params?.authErrorMessage ?? null;

  useEffect(() => {
    consumePendingAuthResume();
  }, []);

  useLayoutEffect(() => {
    if (!resume) return;
    // TermsDetail은 reset 없이 initialRouteName으로 충분 (불필요한 전환 방지)
    if (resume?.name === "TermsDetail") return;
    if (hasAuthResumeResetAlreadyApplied(resume)) return;
    const action = buildRootResetForAuthNestedResume(resume);
    if (!action) return;
    markAuthResumeResetApplied(resume);
    let cancelled = false;
    dispatchResumeWhenReady(navigation, action, {
      shouldSkip: () => cancelled,
    });
    return () => {
      cancelled = true;
    };
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
      screenOptions={{
        headerShown: false,
        // `useStepBack`에서 history가 없을 땐 `navigation.replace()`를 사용!!
        // 이 경우 기본 애니메이션이 push처럼 보여서 뒤로 이동이 헷갈릴 수 있어
        // replace에서도 pop 애니메이션(좌->우)으로 통일
        animationTypeForReplace: "pop",
        // 회원가입 단계의 "다음"은 navigation.navigate (push)로 이동하도록 바꿨기 때문에
        // push 애니메이션 방향을 명시해 "오른쪽->왼쪽" 전환이 보이도록 강제
        animation: "slide_from_right",
      }}
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
      <Stack.Screen
        name="TermsTosDetail"
        component={TermsTosDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TermsPrivacyRequiredDetail"
        component={TermsPrivacyRequiredDetailScreen}
        options={{ headerShown: false }}
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
