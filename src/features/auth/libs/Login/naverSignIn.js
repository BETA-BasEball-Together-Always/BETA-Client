// src/features/auth/screens/libs/naverSignIn.js
import NaverLogin from "@react-native-seoul/naver-login";

export const naverSignIn = async () => {
  // 1) 로그인 시도
  const {isSuccess, successResponse, failureResponse} =
    await NaverLogin.login();

  // 2) 실패 처리
  if (!isSuccess) {
    if (failureResponse?.isCancel) {
      return {cancelled: true};
    }
    throw new Error(failureResponse?.message || "Naver login failed");
  }

  // 3) accessToken으로 프로필 불러오기
  const profileResult = await NaverLogin.getProfile(
    successResponse.accessToken
  );

  return {
    cancelled: false,
    token: successResponse, // accessToken, refreshToken 등
    profile: profileResult.response, // 네이버 프로필(이메일, 닉네임 등)
  };
};
