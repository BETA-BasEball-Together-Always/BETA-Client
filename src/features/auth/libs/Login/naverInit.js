// src/features/auth/libs/naverInit.js
import NaverLogin from "@react-native-seoul/naver-login";
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

const NAVER_CLIENT_ID = extra.naverClientId;
const NAVER_CLIENT_SECRET = extra.naverClientSecret;
const NAVER_APP_NAME = extra.naverAppName;
const NAVER_IOS_URL_SCHEME = extra.naverIosUrlScheme;

export const initializeNaver = () => {
  NaverLogin.initialize({
    appName: NAVER_APP_NAME,
    consumerKey: NAVER_CLIENT_ID,
    consumerSecret: NAVER_CLIENT_SECRET,
    serviceUrlSchemeIOS: NAVER_IOS_URL_SCHEME,
    disableNaverAppAuthIOS: false,
  });
};
