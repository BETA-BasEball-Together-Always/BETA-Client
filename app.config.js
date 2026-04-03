// app.config.js
import dotenv from "dotenv";

// 기본은 .env만 로드됨(import "dotenv/config"). .env.local은 자동으로 안 읽히므로 여기서 병합합니다.
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

/** FCM/APNs용 — 없으면 iOS에서 getToken 시 aps-environment 인타이틀먼트 오류 발생!!! prebuild 후 재빌드 필요!!! */
const apsEnvironment =
  process.env.EAS_BUILD_PROFILE === "production"
    ? "production"
    : "development";

export default ({ config }) => ({
  ...config,
  scheme:
    (process.env.NAVER_IOS_URL_SCHEME ?? "").trim() ||
    (Array.isArray(config.scheme) ? config.scheme[0] : config.scheme),
  ios: {
    ...config.ios,
    entitlements: {
      ...(config.ios?.entitlements ?? {}),
      "aps-environment": apsEnvironment,
    },
  },
  extra: {
    ...config.extra,
    backendUrl: (process.env.EXPO_PUBLIC_BACKEND_URL ?? "").trim(),
    naverClientId: (process.env.NAVER_CLIENT_ID ?? "").trim(),
    naverClientSecret: (process.env.NAVER_CLIENT_SECRET ?? "").trim(),
    naverAppName: (process.env.NAVER_APP_NAME ?? "").trim(),
    naverIosUrlScheme:
      (process.env.NAVER_IOS_URL_SCHEME ?? "").trim() ||
      (Array.isArray(config.scheme) ? config.scheme[0] : config.scheme),
  },
  plugins: [
    ...(config.plugins || []),
    "expo-secure-store",
    [
      "@react-native-seoul/naver-login",
      {
        urlScheme:
          (process.env.NAVER_IOS_URL_SCHEME ?? "").trim() ||
          (Array.isArray(config.scheme) ? config.scheme[0] : config.scheme),
      },
    ],
  ],
});
