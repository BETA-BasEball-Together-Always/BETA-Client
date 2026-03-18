// src/features/auth/screens/libs/naverSignIn.js
import NaverLogin from "@react-native-seoul/naver-login";

export const naverSignIn = async () => {
  try {
    const result = await NaverLogin.login();

    if (!result) {
      console.warn("NaverLogin.login()가 undefined를 반환했습니다.");
      return { cancelled: true };
    }

    const { isSuccess, successResponse, failureResponse } = result;
    console.log("네이버 로그인 결과: ", result);

    if (!isSuccess) {
      if (failureResponse?.isCancel) {
        console.log("네이버 로그인 취소됨");
        return { cancelled: true };
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
    console.error("naverSignIn 오류: ", error);
    console.error("naverSignIn 오류 데이터: ", error.data);
    console.error("naverSignIn 오류 리스폰스: ", error.response);
    return { cancelled: true };
  }
};
