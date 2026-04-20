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
import { clearAuthResumeResetGuard } from "../auth/authResumeResetGuard";
import { appQueryClient } from "../libs/appQueryClient";
import { SIGNUP_STATUS_QUERY_KEY } from "../../features/auth/services/signupStatusMutation";
import { hydrateSignupDraftFromStorage } from "../../features/auth/stores/useSignupDraftStore";

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

async function fetchSignupStatusWithAccessToken(accessToken) {
  const token = typeof accessToken === "string" ? accessToken.trim() : "";
  if (!token) {
    return await fetchSignupStatus();
  }
  const res = await api.get("/api/v1/auth/signup/status", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
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
 * SecureStore userJson — 보통 완료 가입·메인 진입 후 setUser로만 저장됨(미완료 가입 플로우는 대부분 미기록).
 */
function isCachedUserEligibleForSignupStatusSkip(user) {
  if (!user || typeof user !== "object") return false;
  return Boolean(user.id ?? user.userId ?? user.email);
}

/**
 * @returns {Promise<
 *   | { outcome: "no_tokens" }
 *   | { outcome: "auth_return"; value: { destination: "auth"; authErrorMessage: string | null } }
 *   | { outcome: "ok"; statusPayload: ReturnType<typeof sanitizeSignupStatusPayload>; statusData: object }
 * >}
 */
async function fetchSignupStatusPipeline() {
  const [storedAccess, storedRefresh] = await Promise.all([
    SecureStore.getItemAsync("accessToken"),
    SecureStore.getItemAsync("refreshToken"),
  ]);

  if (!storedAccess && !storedRefresh) {
    return { outcome: "no_tokens" };
  }

  setPendingAuthErrorMessage(null);

  let accessToken = storedAccess;
  const refreshToken = storedRefresh;
  const cachedUserPromise = loadCachedUser();
  /** accessToken이 이미 있으면 토큰 적용을 미리 시작(네트워크와 병렬) */
  let applyTokensPromise = null;

  /** accessToken이 이미 있으면 refresh API를 부르지 않음(만료 시 추후 /signup/status 401에서 재시도) */
  if (!accessToken && refreshToken) {
    try {
      const data = await refreshTokensApi(refreshToken);
      accessToken = data?.accessToken;
      if (!accessToken) {
        await clearSession();
        const msg = "로그인이 필요합니다. 다시 로그인해 주세요.";
        setPendingAuthErrorMessage(msg);
        return {
          outcome: "auth_return",
          value: { destination: "auth", authErrorMessage: msg },
        };
      }
      await applyTokens(accessToken, data?.refreshToken ?? refreshToken);
    } catch (e) {
      await clearSession();
      const msg = extractApiMessage(
        e,
        "로그인이 필요합니다. 다시 로그인해 주세요.",
      );
      setPendingAuthErrorMessage(msg);
      return {
        outcome: "auth_return",
        value: { destination: "auth", authErrorMessage: msg },
      };
    }
  } else {
    // accessToken이 있을 때는 /signup/status를 헤더 주입으로 먼저 치고,
    // 토큰 적용(store + axios default)은 병렬로 진행할 수 있다.
    applyTokensPromise = applyTokens(accessToken, refreshToken);
  }

  /**
   * 로그인 완료/메인 이용 이력 존재 시 userJson이 있으면 /signup/status 없이 바로 main
   */
  try {
    const cachedUser = await cachedUserPromise;
    if (
      accessToken &&
      isCachedUserEligibleForSignupStatusSkip(cachedUser)
    ) {
      if (applyTokensPromise) {
        await applyTokensPromise;
      }
      // main 진입 직전에는 Authorization 헤더가 필요하므로 토큰 적용은 반드시 완료돼야 한다.
      const statusPayload = sanitizeSignupStatusPayload({
        user: cachedUser,
        signupStep: null,
      });
      return {
        outcome: "ok",
        statusPayload,
        statusData: { user: cachedUser },
        skippedSignupStatusApi: true,
      };
    }
  } catch (e) {
    console.warn("[bootstrapSession] loadCachedUser (fast path)", e);
  }

  let statusData;
  try {
    // accessToken이 있으면 axios default header 세팅을 기다릴 필요 없이 헤더 주입으로 바로 호출
    const statusPromise = fetchSignupStatusWithAccessToken(accessToken);
    if (applyTokensPromise) {
      const [, data] = await Promise.all([applyTokensPromise, statusPromise]);
      statusData = data;
    } else {
      statusData = await statusPromise;
    }
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
          return {
            outcome: "auth_return",
            value: { destination: "auth", authErrorMessage: msg },
          };
        }
        await applyTokens(accessToken, data?.refreshToken ?? refreshToken);
        statusData = await fetchSignupStatusWithAccessToken(accessToken);
      } catch (e2) {
        await clearSession();
        const msg = extractApiMessage(
          e2,
          "로그인이 필요합니다. 다시 로그인해 주세요.",
        );
        setPendingAuthErrorMessage(msg);
        return {
          outcome: "auth_return",
          value: { destination: "auth", authErrorMessage: msg },
        };
      }
    } else {
      await clearSession();
      const msg = extractApiMessage(
        e,
        "로그인이 필요합니다. 다시 로그인해 주세요.",
      );
      setPendingAuthErrorMessage(msg);
      return {
        outcome: "auth_return",
        value: { destination: "auth", authErrorMessage: msg },
      };
    }
  }

  const statusPayload = sanitizeSignupStatusPayload(statusData);
  return { outcome: "ok", statusPayload, statusData };
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
  clearAuthResumeResetGuard();

  // draft rehydrate는 부트스트랩을 불필요하게 붙잡지 않도록 백그라운드 실행
  hydrateSignupDraftFromStorage().catch((e) => {
    console.warn("[bootstrapSession] hydrateSignupDraftFromStorage failed", e);
  });

  const pipeline = await fetchSignupStatusPipeline();

  if (pipeline.outcome === "no_tokens") {
    return { destination: "auth", authErrorMessage: null };
  }
  if (pipeline.outcome === "auth_return") {
    return pipeline.value;
  }

  const { statusPayload } = pipeline;

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
    try {
      appQueryClient.setQueryData(SIGNUP_STATUS_QUERY_KEY, statusPayload);
    } catch (e) {
      console.warn("[bootstrapSession] signup status query seed failed", e);
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
