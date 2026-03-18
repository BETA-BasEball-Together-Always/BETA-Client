import * as AppleAuthentication from "expo-apple-authentication";

export const appleSignIn = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      //이름 및 이메일 요청 (가능하다면 성별 및 나이대 요청도 고려할 것)
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error("애플 identityToken이 없습니다.");
    }

    return {
      // 애플 로그인: 사용자 정보를 처음 로그인할 때만 전달하고 이후로는 null값만 나옴!!
      // identityToken만으로도 인증하도록 요청할 것!!
      cancelled: false,
      token: {
        identityToken: credential.identityToken,
        // authorizationCode: credential.authorizationCode,
        // user: credential.user,
        // realUserStatus: credential.realUserStatus,
      },
      profile: {
        fullName: credential.fullName ?? null,
        email: credential.email ?? null,
      },
    };
  } catch (error) {
    if (error.code === "ERR_REQUEST_CANCELED") {
      console.log("Apple login cancelled");
      return { cancelled: true };
    }

    console.log("Apple login error:", error);
    throw error;
  }
};
