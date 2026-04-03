// src/features/auth/libs/naverInit.js
import NaverLogin from "@react-native-seoul/naver-login";
import Constants from "expo-constants";

function normalizeScheme(value) {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return typeof value === "string" ? value : null;
}

function getExtra() {
  // 환경별(Constants.expoConfig/manifest/manifest2) 차이로 extra가 비어
  // 네이버 설정 누락으로 오탐지되는 케이스가 있어 안전하게 병합!
  return (
    Constants.expoConfig?.extra ??
    Constants.manifest2?.extra ??
    Constants.manifest?.extra ??
    {}
  );
}

function getAppScheme() {
  return normalizeScheme(
    Constants.expoConfig?.scheme ??
      Constants.manifest2?.scheme ??
      Constants.manifest?.scheme,
  );
}

function getNaverConfig() {
  const extra = getExtra();
  return {
    clientId: extra?.naverClientId ?? null,
    clientSecret: extra?.naverClientSecret ?? null,
    appName: extra?.naverAppName ?? null,
    iosScheme: extra?.naverIosUrlScheme ?? getAppScheme() ?? null,
  };
}

const mask = (value) => {
  if (!value) return "(missing)";
  if (value.length <= 6) return `${value.slice(0, 2)}***`;
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
};

/** 네이버 SDK/로그인에 필요한 extra 값이 모두 있을 때만 true */
export const isNaverLoginConfigured = () => {
  const cfg = getNaverConfig();
  return Boolean(cfg.clientId && cfg.clientSecret && cfg.appName && cfg.iosScheme);
};

export const initializeNaver = () => {
  const cfg = getNaverConfig();
  if (!isNaverLoginConfigured()) {
    const missing = Object.entries({
      naverClientId: cfg.clientId,
      naverClientSecret: cfg.clientSecret,
      naverAppName: cfg.appName,
      naverIosUrlScheme: cfg.iosScheme,
    })
      .filter(([, v]) => !v)
      .map(([k]) => k);
    console.warn("[NAVER] initialize 생략: missing fields:", missing);
    console.warn(
      "[NAVER] 초기화 생략: extra에 naverClientId / naverClientSecret / naverAppName / naverIosUrlScheme 가 모두 필요합니다. (.env + prebuild 확인)",
    );
    return;
  }
  try {
    console.log("[NAVER] initialize config:", {
      appName: cfg.appName || "(missing)",
      clientId: mask(cfg.clientId),
      clientSecret: mask(cfg.clientSecret),
      iosScheme: cfg.iosScheme || "(missing)",
    });
    NaverLogin.initialize({
      appName: cfg.appName,
      consumerKey: cfg.clientId,
      consumerSecret: cfg.clientSecret,
      serviceUrlSchemeIOS: cfg.iosScheme,
      disableNaverAppAuthIOS: false,
    });
    console.log("Naver sdk 초기화 완료");
  } catch (error) {
    console.warn("Naver sdk 초기화 실패: ", error);
  }
};
