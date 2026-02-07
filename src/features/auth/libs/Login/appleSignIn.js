import * as AppleAuthentication from "expo-apple-authentication";

export const appleSignIn = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    return {
      cancelled: false,
      token: credential,
      profile: {
        fullName: credential.fullName,
        email: credential.email,
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
