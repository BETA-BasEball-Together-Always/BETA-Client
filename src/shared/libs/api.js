// src/shared/api/api.js
import axios from "axios";
import Constants from "expo-constants";
import NetInfo from "@react-native-community/netinfo";
import * as SecureStore from "expo-secure-store";
import { useUserStore } from "../store/userStore";
import { refreshTokensApi } from "./authTokenRefresh";
import { notifyDatabaseMaintenanceIfNeeded } from "../utils/networkErrors";
// import * as SecureStore from "expo-secure-store";
// import {useAuthStore} from "../store/authStore"; // 경로는 프로젝트에 맞게 수정해줘

// // ✅ Zustand 스토어 훅을 일반 함수처럼 쓰기 위한 alias
// const authStore = useAuthStore;

// // ✅ Refresh Token SecureStore 키
// const REFRESH_TOKEN_KEY = "refreshToken";

// // 🔹 refresh token 읽기/쓰기 유틸
// const getRefreshToken = async () => {
//   try {
//     return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
//   } catch (e) {
//     console.log("getRefreshToken error:", e);
//     return null;
//   }
// };

// const setRefreshToken = async (token) => {
//   try {
//     if (!token) {
//       await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
//     } else {
//       await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
//     }
//   } catch (e) {
//     console.log("setRefreshToken error:", e);
//   }
// };

// axios 인스턴스 생성
const BACKEND_BASE_URL =
  //EXPO_PUBLIC_BACKEND_URL이 testflight에서는 undefined 되는 경우가 많으므로 순서 변경
  Constants.expoConfig?.extra?.backendUrl ||
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  "https://beta-app.kr"; //fallback 추가

console.log("[API] BASE_URL:", BACKEND_BASE_URL);

if (!BACKEND_BASE_URL) {
  console.error(
    "[API] backend baseURL is missing. Set EXPO_PUBLIC_BACKEND_URL or extra.backendUrl.",
  );
}

const api = axios.create({
  baseURL: BACKEND_BASE_URL ?? undefined,
  timeout: 10000, //업로드 전용 api는 20000ms 고려
  headers: {
    "Content-Type": "application/json",
  },
});

function canSendRequest(state) {
  if (state.isConnected === false) return false;
  if (state.isInternetReachable === false) return false;
  return true;
}

const NETINFO_CACHE_TTL_MS = 1500;
let lastNetInfoFetchAt = 0;
let lastNetInfoState = null;
let netInfoInFlightPromise = null;

async function getNetInfoStateCached() {
  const now = Date.now();

  if (lastNetInfoState && now - lastNetInfoFetchAt < NETINFO_CACHE_TTL_MS) {
    return lastNetInfoState;
  }

  if (netInfoInFlightPromise) {
    return await netInfoInFlightPromise;
  }

  netInfoInFlightPromise = NetInfo.fetch()
    .then((state) => {
      lastNetInfoState = state;
      lastNetInfoFetchAt = Date.now();
      return state;
    })
    .finally(() => {
      netInfoInFlightPromise = null;
    });

  return await netInfoInFlightPromise;
}

api.interceptors.request.use(
  async (config) => {
    try {
      const state = await getNetInfoStateCached();
      if (!canSendRequest(state)) {
        const err = new Error("NETWORK_UNAVAILABLE");
        err.code = "CLIENT_OFFLINE";
        err.isOffline = true;
        return Promise.reject(err);
      }
    } catch {
      // NetInfo 실패 시 요청은 진행
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.request.use(
  (config) => {
    const { accessToken } = useUserStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue = [];

function processAuthQueue(error, token = null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
}

function isAuthRefreshExemptUrl(url) {
  if (!url || typeof url !== "string") return false;
  return (
    url.includes("/api/v1/auth/refresh") ||
    url.includes("/auth/refresh") ||
    url.includes("/api/v1/auth/login") ||
    url.includes("/auth/login")
  );
}

async function getStoredRefreshToken() {
  let refreshToken = useUserStore.getState().refreshToken;
  if (refreshToken) return refreshToken;
  try {
    refreshToken = await SecureStore.getItemAsync("refreshToken");
  } catch {
    /* ignore */
  }
  return refreshToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    notifyDatabaseMaintenanceIfNeeded(error);

    const originalRequest = error.config;
    const status = error.response?.status;

    if (
      !originalRequest ||
      !error.response ||
      (status !== 401 && status !== 403) ||
      originalRequest._retry ||
      isAuthRefreshExemptUrl(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    const refreshToken = await getStoredRefreshToken();
    if (!refreshToken) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          originalRequest._retry = true;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const data = await refreshTokensApi(refreshToken);
      const newAccess = data?.accessToken;
      if (!newAccess) {
        throw new Error("NO_NEW_ACCESS_TOKEN");
      }
      const newRefresh = data?.refreshToken ?? refreshToken;
      await useUserStore.getState().setTokens({
        accessToken: newAccess,
        refreshToken: newRefresh,
      });
      api.defaults.headers.Authorization = `Bearer ${newAccess}`;
      processAuthQueue(null, newAccess);
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (refreshErr) {
      processAuthQueue(refreshErr, null);
      const status = refreshErr.response?.status;
      const fatalRefresh =
        refreshErr.message === "NO_NEW_ACCESS_TOKEN" ||
        status === 401 ||
        status === 403;
      if (fatalRefresh) {
        const { forceLogoutToLogin } = await import(
          "../services/authSessionActions"
        );
        await forceLogoutToLogin();
      }
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  },
);

// // ✅ 요청 인터셉터: Zustand에서 accessToken 읽어서 Authorization 헤더에 세팅
// api.interceptors.request.use(
//   (config) => {
//     const { accessToken } = authStore.getState(); // ✅ hook 아님, 그냥 상태 읽기
//     if (accessToken) {
//       config.headers.Authorization = `Bearer ${accessToken}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// // ✅ 401 처리 + refresh 로직 (동시 요청 queue 포함)
// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach((p) => {
//     if (error) {
//       p.reject(error);
//     } else {
//       p.resolve(token);
//     }
//   });
//   failedQueue = [];
// };

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // 401 + 아직 retry 안 했을 때만 refresh 로직 진입
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       // 이미 누가 refresh 중이면, 나는 줄 서서 기다렸다가 새 토큰으로 다시 요청
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({resolve, reject});
//         })
//           .then((token) => {
//             if (token) {
//               originalRequest.headers.Authorization = `Bearer ${token}`;
//             }
//             return api(originalRequest);
//           })
//           .catch((err) => Promise.reject(err));
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         // 🔹 SecureStore에서 refresh token 가져오기
//         const refreshToken = await getRefreshToken();
//         if (!refreshToken) {
//           // refresh token도 없으면 그냥 로그아웃 처리
//           const {logout} = authStore.getState();
//           logout && logout();
//           throw new Error("NO_REFRESH_TOKEN");
//         }

//         // 🔹 순수 axios로 refresh 요청 (api 사용 X: 인터셉터 중복 방지)
//         const refreshResponse = await axios.post(
//           `${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/refresh`,
//           {refreshToken}
//         );

//         // 백엔드 응답 형식에 맞게 destructuring 해줘
//         const {accessToken: newAccessToken, refreshToken: newRefreshToken} =
//           refreshResponse.data;

//         if (!newAccessToken) {
//           throw new Error("NO_NEW_ACCESS_TOKEN");
//         }

//         // ✅ access token은 Zustand에만 저장
//         const {setAccessToken} = authStore.getState();
//         setAccessToken && setAccessToken(newAccessToken);

//         // ✅ refresh token은 SecureStore에만 저장 (서버가 새로 주면 업데이트)
//         if (newRefreshToken) {
//           await setRefreshToken(newRefreshToken);
//         }

//         // axios 기본 헤더 + 이번 originalRequest 헤더에 새 토큰 반영
//         api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

//         // 기다리던 요청들 깨워서 새 토큰 전달
//         processQueue(null, newAccessToken);

//         // 방금 실패했던 요청 다시 실행
//         return api(originalRequest);
//       } catch (err) {
//         // refresh 실패 → 줄 서 있던 애들 전부 실패시키고 로그아웃
//         processQueue(err, null);
//         const {logout} = authStore.getState();
//         logout && logout();
//         return Promise.reject(err);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     // 나머지 에러는 그대로 상위로 던짐
//     return Promise.reject(error);
//   }
// );

export default api;
