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
  // 네이버 iOS URL Scheme과 동일한 값을 쓰도록 env 우선 (app.json scheme과 불일치하면 로그인 콜백 실패)
  scheme: process.env.NAVER_IOS_URL_SCHEME || config.scheme,
  ios: {
    ...config.ios,
    entitlements: {
      ...(config.ios?.entitlements ?? {}),
      "aps-environment": apsEnvironment,
    },
  },
  extra: {
    ...config.extra,
    backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL, //url 변수명 다른 것 수정
    naverClientId: process.env.NAVER_CLIENT_ID,
    naverClientSecret: process.env.NAVER_CLIENT_SECRET,
    naverAppName: process.env.NAVER_APP_NAME,
    naverIosUrlScheme: process.env.NAVER_IOS_URL_SCHEME,
  },
  plugins: [
    ...(config.plugins || []),
    "expo-secure-store",
    [
      "@react-native-seoul/naver-login",
      {
        urlScheme: process.env.NAVER_IOS_URL_SCHEME,
      },
    ],
  ],
});
