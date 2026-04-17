import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import api from "../libs/api";
import { refreshTokensApi } from "../libs/authTokenRefresh";
import { useUserStore } from "../store/userStore";
import {
  setPendingAuthErrorMessage,
  setPendingAuthResume,
} from "../auth/pendingAuthResume";
import { applySignupStatusToDraft } from "../auth/applySignupStatusToDraft";

//api.js와 sessionBootstrap.js에서 중복된 base url 환경변수 정의!!
//api.js에서 baseURL 가져오는 것으로 수정
const BASE_URL = api.defaults.baseURL;

console.log("[BOOTSTRAP] BASE_URL:", BASE_URL);
console.log("[BOOTSTRAP] ENV:", process.env.EXPO_PUBLIC_BACKEND_URL);
console.log("[BOOTSTRAP] EXTRA:", Constants.expoConfig?.extra?.backendUrl);

export const SIGNUP_STEP_INCOMPLETE_ENUM = Object.freeze([
  "SOCIAL_AUTHENTICATED",
  "CONSENT_AGREED",
  "PROFILE_COMPLETED",
  "TEAM_SELECTED",
]);

const INCOMPLETE_SIGNUP_STEPS = new Set(SIGNUP_STEP_INCOMPLETE_ENUM);

/** 예외/불완전 응답/알 수 없는 step 시 Auth 복귀 화면 */
export const FIRST_SIGNUP_RESUME_ROUTE = Object.freeze({
  name: "Login",
  params: {},
});

/**
 * bootstrap 실패 시 Auth 스택으로 보낼 안전한 결과 (세션은 유지해 재가입 이어가기 가능)
 */
export function getBootstrapAuthSignupStartFallback() {
  return {
    destination: "auth",
    resume: { name: "Login", params: {} },
    authErrorMessage: null,
  };
}

/**
 * 서버/클라이언트 간 공백/대소문자 차이로 미완료 단계 매칭이 깨지지 않게 정규화
 * @param {unknown} raw
 * @returns {string | null}
 */
export function normalizeSignupStep(raw) {
  if (raw == null) return null;
  const s = String(raw).trim().toUpperCase();
  return s.length > 0 ? s : null;
}

function sanitizeSignupStatusPayload(data) {
  try {
    if (!data || typeof data !== "object") {
      return {};
    }
    const teamList = Array.isArray(data?.teamList) ? data.teamList : [];
    const rawEmail = data?.email;
    const email =
      typeof rawEmail === "string"
        ? rawEmail.trim()
        : rawEmail != null
          ? String(rawEmail)
          : null;
    return {
      ...data,
      teamList,
      email: email ?? rawEmail ?? null,
    };
  } catch (e) {
    console.warn("[sanitizeSignupStatusPayload]", e);
    return {};
  }
}

/**
 * 회원가입 미완료 시 로그인 화면과 동일한 화면으로 복귀!!
 * @returns {{ name: string, params?: object }}
 */
export function getSignupResumeRoute(signupStep, data) {
  try {
    const safe = sanitizeSignupStatusPayload(data);
    const emailStr =
      typeof safe?.email === "string"
        ? safe.email
        : safe?.email != null
          ? String(safe.email)
          : "";

    switch (signupStep) {
      case "SOCIAL_AUTHENTICATED":
        return { name: "TermsDetail", params: {} };
      case "CONSENT_AGREED":
        return {
          name: "SocialSignup",
          params: {
            signup: {
              email: safe?.email ?? null,
            },
          },
        };
      case "PROFILE_COMPLETED":
        return {
          name: "SignupFavoriteTeam",
          params: {
            signup: {
              email: emailStr,
            },
          },
        };
      case "TEAM_SELECTED":
        return {
          name: "SignupGenderAge",
          params: {
            signup: {
              email: emailStr,
            },
          },
        };
      default:
        return { ...FIRST_SIGNUP_RESUME_ROUTE };
    }
  } catch (e) {
    console.warn("[getSignupResumeRoute]", e);
    return { ...FIRST_SIGNUP_RESUME_ROUTE };
  }
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
  try {
    return await bootstrapSessionInner();
  } catch (e) {
    console.warn("[bootstrapSession] unexpected error", e);
    setPendingAuthResume({ ...FIRST_SIGNUP_RESUME_ROUTE });
    setPendingAuthErrorMessage(null);
    return getBootstrapAuthSignupStartFallback();
  }
}

async function bootstrapSessionInner() {
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
    if ((status === 401 || status === 403) && refreshToken) {
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

  const statusPayload = sanitizeSignupStatusPayload(statusData);
  const step = normalizeSignupStep(statusPayload?.signupStep);

  /**
   * signupStep이 null/undefined/빈 문자열이거나, INCOMPLETE_SIGNUP_STEPS에 없는 값이면
   * 미완료 전용 분기로 들어가지 않음! -> 아래에서 user로 main 여부 판단, 없으면 Login 폴백
   */

  if (step && INCOMPLETE_SIGNUP_STEPS.has(step)) {
    try {
      applySignupStatusToDraft(statusPayload);
    } catch (e) {
      console.warn("[bootstrapSession] applySignupStatusToDraft failed", e);
    }
    let resume;
    try {
      resume = getSignupResumeRoute(step, statusPayload);
    } catch (e) {
      console.warn("[bootstrapSession] getSignupResumeRoute failed", e);
      resume = { ...FIRST_SIGNUP_RESUME_ROUTE };
    }
    setPendingAuthResume(resume);
    setPendingAuthErrorMessage(null);
    return { destination: "auth", resume };
  }

  let user = statusPayload?.user ?? null;
  if (!user) {
    try {
      user = await loadCachedUser();
    } catch (e) {
      console.warn("[bootstrapSession] loadCachedUser failed", e);
      user = null;
    }
  }
  if (user && typeof user === "object") {
    try {
      await useUserStore.getState().setUser(user);
    } catch (e) {
      console.warn("[bootstrapSession] setUser failed", e);
      setPendingAuthResume({ ...FIRST_SIGNUP_RESUME_ROUTE });
      setPendingAuthErrorMessage(null);
      return getBootstrapAuthSignupStartFallback();
    }
    return { destination: "main" };
  }

  /** 토큰은 있으나 user/미완료 step이 비어 있는 등 모호한 응답일 경우 가입 이어가기 가능한 시작 화면 */
  setPendingAuthResume({ ...FIRST_SIGNUP_RESUME_ROUTE });
  setPendingAuthErrorMessage(null);
  return getBootstrapAuthSignupStartFallback();
}
