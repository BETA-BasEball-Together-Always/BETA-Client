import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import api from "../libs/api";
import { useUserStore } from "../store/userStore";
import {
  setPendingAuthErrorMessage,
  setPendingAuthResume,
} from "../auth/pendingAuthResume";

//api.js와 sessionBootstrap.js에서 중복된 base url 환경변수 정의!!
//api.js에서 baseURL 가져오는 것으로 수정
const BASE_URL = api.defaults.baseURL;

console.log("[BOOTSTRAP] BASE_URL:", BASE_URL);
console.log("[BOOTSTRAP] ENV:", process.env.EXPO_PUBLIC_BACKEND_URL);
console.log("[BOOTSTRAP] EXTRA:", Constants.expoConfig?.extra?.backendUrl);

const INCOMPLETE_SIGNUP_STEPS = new Set([
  "SOCIAL_AUTHENTICATED",
  "CONSENT_AGREED",
  "PROFILE_COMPLETED",
  "TEAM_SELECTED",
]);

/**
 * 회원가입 미완료 시 로그인 화면과 동일한 화면으로 복귀!!
 * @returns {{ name: string, params?: object }}
 */
export function getSignupResumeRoute(signupStep, data) {
  switch (signupStep) {
    case "SOCIAL_AUTHENTICATED":
      return { name: "TermsDetail", params: {} };
    case "CONSENT_AGREED":
      return {
        name: "SocialSignup",
        params: {
          signup: {
            email: data?.email ?? null,
          },
        },
      };
    case "PROFILE_COMPLETED":
      return {
        name: "SignupFavoriteTeam",
        params: {
          signup: {},
          teamList: data?.teamList ?? [],
        },
      };
    case "TEAM_SELECTED":
      return {
        name: "SignupGenderAge",
        params: { signup: {} },
      };
    default:
      return { name: "TermsDetail", params: {} };
  }
}

async function refreshTokensApi(refreshToken) {
  console.log("[REFRESH] BASE_URL:", BASE_URL);

  if (!BASE_URL) {
    throw new Error("BACKEND_BASE_URL_MISSING");
  }
  const { data } = await axios.post(
    `${BASE_URL}/api/v1/auth/refresh`,
    { refreshToken },
    { timeout: 15000 },
  );
  return data;
}

async function fetchSignupStatus() {
  const res = await api.get("/api/v1/auth/signup/status");
  return res.data;
}

async function loadCachedUser() {
  try {
    const raw = await SecureStore.getItemAsync("userJson");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function applyTokens(accessToken, refreshToken) {
  await useUserStore.getState().setTokens({ accessToken, refreshToken });
  if (accessToken) {
    api.defaults.headers.Authorization = `Bearer ${accessToken}`;
  } else {
    delete api.defaults.headers.Authorization;
  }
}

async function clearSession() {
  await useUserStore.getState().clearAuth();
  delete api.defaults.headers.Authorization;
}

function extractApiMessage(error, fallback) {
  const msg =
    error?.response?.data?.message ??
    error?.response?.data?.error?.message ??
    error?.message;
  return typeof msg === "string" && msg.trim().length > 0 ? msg : fallback;
}

/**
 * 앱 재실행 시 SecureStore 토큰으로 세션 복구 (로그인한 사용자는 메인으로 이동할 수 있도록)
 */
export async function bootstrapSession() {
  const storedAccess = await SecureStore.getItemAsync("accessToken");
  const storedRefresh = await SecureStore.getItemAsync("refreshToken");

  if (!storedAccess && !storedRefresh) {
    return { destination: "auth", authErrorMessage: null };
  }

  setPendingAuthErrorMessage(null);

  let accessToken = storedAccess;
  const refreshToken = storedRefresh;

  if (!accessToken && refreshToken) {
    try {
      const data = await refreshTokensApi(refreshToken);
      accessToken = data?.accessToken;
      if (!accessToken) {
        await clearSession();
        const msg = "로그인이 필요합니다. 다시 로그인해 주세요.";
        setPendingAuthErrorMessage(msg);
        return { destination: "auth", authErrorMessage: msg };
      }
      await applyTokens(accessToken, data?.refreshToken ?? refreshToken);
    } catch (e) {
      await clearSession();
      const msg = extractApiMessage(
        e,
        "로그인이 필요합니다. 다시 로그인해 주세요.",
      );
      setPendingAuthErrorMessage(msg);
      return { destination: "auth", authErrorMessage: msg };
    }
  } else {
    await applyTokens(accessToken, refreshToken);
  }

  let statusData;
  try {
    statusData = await fetchSignupStatus();
  } catch (e) {
    const status = e?.response?.status;
    if (status === 401 && refreshToken) {
      try {
        const data = await refreshTokensApi(refreshToken);
        accessToken = data?.accessToken;
        if (!accessToken) {
          await clearSession();
          const msg = "로그인이 필요합니다. 다시 로그인해 주세요.";
          setPendingAuthErrorMessage(msg);
          return { destination: "auth", authErrorMessage: msg };
        }
        await applyTokens(accessToken, data?.refreshToken ?? refreshToken);
        statusData = await fetchSignupStatus();
      } catch (e2) {
        await clearSession();
        const msg = extractApiMessage(
          e2,
          "로그인이 필요합니다. 다시 로그인해 주세요.",
        );
        setPendingAuthErrorMessage(msg);
        return { destination: "auth", authErrorMessage: msg };
      }
    } else {
      await clearSession();
      const msg = extractApiMessage(
        e,
        "로그인이 필요합니다. 다시 로그인해 주세요.",
      );
      setPendingAuthErrorMessage(msg);
      return { destination: "auth", authErrorMessage: msg };
    }
  }

  const step = statusData?.signupStep;

  if (step && INCOMPLETE_SIGNUP_STEPS.has(step)) {
    const resume = getSignupResumeRoute(step, statusData);
    setPendingAuthResume(resume);
    setPendingAuthErrorMessage(null);
    return { destination: "auth", resume };
  }

  let user = statusData?.user ?? null;
  if (!user) {
    user = await loadCachedUser();
  }
  if (user) {
    await useUserStore.getState().setUser(user);
    return { destination: "main" };
  }

  await clearSession();
  const msg = "로그인이 필요합니다. 다시 로그인해 주세요.";
  setPendingAuthErrorMessage(msg);
  return { destination: "auth", authErrorMessage: msg };
}
