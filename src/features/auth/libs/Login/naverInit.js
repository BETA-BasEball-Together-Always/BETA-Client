// src/features/auth/libs/naverInit.js
import NaverLogin from "@react-native-seoul/naver-login";
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

const NAVER_CLIENT_ID = extra.naverClientId;
const NAVER_CLIENT_SECRET = extra.naverClientSecret;
const NAVER_APP_NAME = extra.naverAppName;
const NAVER_IOS_URL_SCHEME = extra.naverIosUrlScheme;

const mask = (value) => {
  if (!value) return "(missing)";
  if (value.length <= 6) return `${value.slice(0, 2)}***`;
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
};

export const initializeNaver = () => {
  try {
    console.log("[NAVER] initialize config:", {
      appName: NAVER_APP_NAME || "(missing)",
      clientId: mask(NAVER_CLIENT_ID),
      clientSecret: mask(NAVER_CLIENT_SECRET),
      iosScheme: NAVER_IOS_URL_SCHEME || "(missing)",
    });
    NaverLogin.initialize({
      appName: NAVER_APP_NAME,
      consumerKey: NAVER_CLIENT_ID,
      consumerSecret: NAVER_CLIENT_SECRET,
      serviceUrlSchemeIOS: NAVER_IOS_URL_SCHEME,
      disableNaverAppAuthIOS: false,
    });
    console.log("Naver sdk 초기화 완료");
  } catch (error) {
    console.warn("Naver sdk 초기화 실패: ", error);
  }
};
