// src/features/auth/screens/libs/naverSignIn.js
import NaverLogin from "@react-native-seoul/naver-login";
import { isNaverLoginConfigured } from "./naverInit";

const NAVER_LOGIN_TIMEOUT_MS = 15000;

const withTimeout = (promise, timeoutMs) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("NAVER_LOGIN_TIMEOUT"));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });

export const naverSignIn = async () => {
  if (!isNaverLoginConfigured()) {
    return { cancelled: true, missingConfig: true };
  }

  try {
    console.log("[NAVER] login() 호출 시작");
    const result = await withTimeout(
      NaverLogin.login(),
      NAVER_LOGIN_TIMEOUT_MS,
    );
    console.log("[NAVER] login() 응답 수신");

    if (!result) {
      console.warn("NaverLogin.login()가 undefined를 반환했습니다.");
      return { cancelled: true };
    }

    const { isSuccess, successResponse, failureResponse } = result;
    console.log("네이버 로그인 결과: ", result);

    if (!isSuccess) {
      if (failureResponse?.isCancel) {
        console.log("네이버 로그인 취소됨");
        return { cancelled: true, userCancel: true };
      }
      console.warn("네이버 로그인 실패: ", failureResponse);
      throw new Error(failureResponse?.message || "Naver login failed");
    }

    // accessToken으로 프로필 조회!
    const profileResult = await NaverLogin.getProfile(
      successResponse.accessToken,
    );
    console.log("네이버 프로필: ", profileResult);

    return {
      cancelled: false,
      token: successResponse,
      profile: profileResult?.response ?? null,
    };
  } catch (error) {
    if (error?.message === "NAVER_LOGIN_TIMEOUT") {
      console.error(
        `[NAVER] 로그인 콜백 타임아웃(${NAVER_LOGIN_TIMEOUT_MS}ms) - iOS URL Scheme/네이티브 설정을 확인하세요.`,
      );
      return { cancelled: true, timeout: true };
    }
    console.error("naverSignIn 오류: ", error);
    console.error("naverSignIn 오류 데이터: ", error.data);
    console.error("naverSignIn 오류 리스폰스: ", error.response);
    return {
      cancelled: true,
      errorMessage: error?.message ?? String(error),
    };
  }
};
