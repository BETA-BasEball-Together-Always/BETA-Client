// src/features/auth/libs/kakaoAuth.js
import { login, getProfile, logout } from "@react-native-seoul/kakao-login";

export const kakaoSignIn = async () => {
  try {
    // 혹시 기존 세션이 남아있으면 정리 (선택)
    try {
      await logout();
    } catch (e) {
      // 로그아웃 실패는 굳이 막 에러낼 필요 없음
    }

    // 1) 카카오 로그인 → 토큰 획득
    const token = await login();
    // token 안에 accessToken, refreshToken, idToken 등이 들어있음
    // console.log("Kakao token:", token);

    // 2) 프로필 정보 가져오기 (이메일, 닉네임 등)
    const profile = await getProfile();
    // console.log("Kakao profile:", profile);

    return { token, profile };
  } catch (error) {
    // 사용자가 취소한 경우
    if (error.code === "E_CANCELLED_OPERATION") {
      console.log("Kakao login cancelled");
      return { cancelled: true };
    }

    console.log("Kakao login error:", error);
    throw error;
  }
};
