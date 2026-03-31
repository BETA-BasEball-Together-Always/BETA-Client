// src/features/auth/screens/LoginScreen.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { login, unlink } from "@react-native-seoul/kakao-login";

import AuthBackground from "../../components/AuthBackground";
import { kakaoSignIn } from "../../libs/Login/kakaoSignIn";
import { naverSignIn } from "../../libs/Login/naverSignIn";
import { appleSignIn } from "../../libs/Login/appleSignIn";
import { useSocialLoginMutation } from "../../services/socialLoginMutation";
import { fetchSignupStatusWithToken } from "../../services/signupStatusMutation";

import * as SecureStore from "expo-secure-store";
import { getDeviceId } from "../../libs/Login/deviceUtils";
import { useUserStore } from "../../../../shared/store/userStore";

import api from "../../../../shared/libs/api";

// 아이콘(svg) - 프로젝트 경로에 맞게 유지
import BetaLogo from "@shared/assets/svg/logos/BetaLogo.svg";
import KakaoIcon from "../../assets/Login/kakao.svg";
import NaverIcon from "../../assets/Login/naver.svg";
import AppleIcon from "../../assets/Login/apple.svg";
import { AppText } from "../../../../shared/theme/components/AppText";

const SOCIAL_PROVIDER_KEYS = ["KAKAO", "NAVER", "APPLE"];

function normalizeSocialProviderKey(value) {
  const u = String(value ?? "").toUpperCase();
  return SOCIAL_PROVIDER_KEYS.includes(u) ? u : null;
}

function inferRegisteredProviderFromMessage(message) {
  const msg = String(message ?? "");
  if (!msg.trim()) return null;
  const upper = msg.toUpperCase();
  for (const p of SOCIAL_PROVIDER_KEYS) {
    if (upper.includes(p)) return p;
  }
  if (/카카오/.test(msg)) return "KAKAO";
  if (/네이버/.test(msg)) return "NAVER";
  if (/애플/.test(msg)) return "APPLE";
  return null;
}

function getRegisteredProviderForUser006(error) {
  const data = error?.response?.data;

  // 1순위: API에서 내려주는 user.socialProvider (실제 가입된 소셜)
  const fromUser =
    data && typeof data === "object"
      ? normalizeSocialProviderKey(data?.user?.socialProvider)
      : null;
  if (fromUser) return fromUser;

  // 2순위: 서버에서 내려주는 socialProvider 필드 (이메일 중복 체크 결과)
  const fromApi =
    data && typeof data === "object"
      ? normalizeSocialProviderKey(data?.socialProvider)
      : null;
  if (fromApi) return fromApi;

  // 3순위: 마지막으로 에러 메시지 내 텍스트로 추론
  const msg =
    typeof data === "string" ? data : (data?.message ?? error?.message ?? null);
  return inferRegisteredProviderFromMessage(msg);
}

const LoginScreen = ({ navigation, route }) => {
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const socialLoginMutation = useSocialLoginMutation();

  const [providerConflict, setProviderConflict] = useState(
    /** @type {null | { providerKey: null | "KAKAO" | "NAVER" | "APPLE", message: string | null }} */ (
      null
    ),
  );
  const setTokens = useUserStore((state) => state.setTokens);
  const setUser = useUserStore((state) => state.setUser);

  const authErrorMessage = route?.params?.authErrorMessage ?? null;

  useEffect(() => {
    if (!authErrorMessage) return;
    Alert.alert("로그인 실패", authErrorMessage);
  }, [authErrorMessage]);

  const showApiAuthError = (error, title, fallbackMessage) => {
    const msg =
      error?.response?.data?.message ??
      error?.response?.data?.error?.message ??
      error?.message ??
      fallbackMessage;
    Alert.alert(title, msg);
  };

  const conflictColors = useMemo(
    () => ({
      KAKAO: "#FEE500",
      NAVER: "#03C75A",
      APPLE: "#F9F9F9",
    }),
    [],
  );

  const conflictProviderName = useMemo(
    () => ({
      KAKAO: "카카오",
      NAVER: "네이버",
      APPLE: "애플",
    }),
    [],
  );

  const handleUser006ProviderConflict = (currentProvider, error) => {
    const registered =
      getRegisteredProviderForUser006(error) ||
      normalizeSocialProviderKey(currentProvider);
    setProviderConflict({
      providerKey: registered,
      message: null,
    });
    setIsSocialLoading(false);
  };

  const handleSocialLoginResult = async (provider, response) => {
    const data = response?.data;
    const userResponse = data?.userResponse;
    const isNewUser =
      typeof data?.isNewUser === "boolean"
        ? data.isNewUser
        : typeof data?.newUser === "boolean"
          ? data.newUser
          : !userResponse?.user;

    if (!userResponse?.accessToken) {
      Alert.alert("로그인 오류", "응답을 처리할 수 없습니다.");
      return;
    }

    const api = require("../../../../shared/libs/api").default;
    api.defaults.headers.Authorization = `Bearer ${userResponse.accessToken}`;

    if (!isNewUser) {
      // 기존 회원 → 유저 정보 전역 저장 후 메인으로
      if (userResponse?.user) {
        setUser(userResponse.user);
      } else if (userResponse) {
        setUser(userResponse);
      }
      navigation.replace("Main");
      return;
    }

    // 회원가입 미완료
    // - SOCIAL_AUTHENTICATED 또는 단계 미표시: 약관만 필요 -> GET /signup/status 생략 가능
    // - 그 외(CONSENT_AGREED, PROFILE_COMPLETED, TEAM_SELECTED 등): 해당 화면 구성용
    //   email/teamList 등은 반드시 GET /api/v1/auth/signup/status 로 조회
    let signupStep = userResponse.signupStep;
    let emailFromServer = null;
    let teamListFromServer = null;

    const canSkipSignupStatus =
      signupStep == null || signupStep === "SOCIAL_AUTHENTICATED";

    if (!canSkipSignupStatus) {
      try {
        const status = await fetchSignupStatusWithToken(
          userResponse.accessToken,
        );
        if (status?.signupStep) {
          signupStep = status.signupStep;
        }
        emailFromServer = status?.email ?? null;
        teamListFromServer = status?.teamList ?? null;
      } catch (e) {
        console.log("signup/status 조회 실패:", e);
        Alert.alert(
          "안내",
          "회원가입 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
        );
        return;
      }
    }
    switch (signupStep) {
      case "SOCIAL_AUTHENTICATED":
        // 약관 동의 페이지로
        navigation.navigate("TermsDetail");
        break;

      case "CONSENT_AGREED":
        // 1단계: 이메일(읽기 전용) + 닉네임
        navigation.navigate("SocialSignup", {
          signup: {
            email: emailFromServer || userResponse.email,
          },
        });
        break;

      case "PROFILE_COMPLETED":
        // 2단계: 팀 선택 (teamList 필요)
        navigation.navigate("SignupFavoriteTeam", {
          signup: {},
          teamList: teamListFromServer || [],
        });
        break;

      case "TEAM_SELECTED":
        // 3단계: 성별/나이 입력
        navigation.navigate("SignupGenderAge", { signup: {} });
        break;

      default:
        // 알 수 없는 상태면 약관부터 시작
        navigation.navigate("TermsDetail");
        break;
    }
  };

  const handleAppleLogin = async () => {
    if (isSocialLoading) return;
    setIsSocialLoading(true);

    try {
      const { token, cancelled } = await appleSignIn();
      if (cancelled) {
        console.log("Apple 로그인 취소됨");
        setIsSocialLoading(false);
        return;
      }

      // console.log("애플 identityToken:", token?.identityToken);

      if (!token?.identityToken) {
        console.log("identityToken 없음");
        setIsSocialLoading(false);
        return;
      }

      const deviceId = await getDeviceId();
      // console.log("deviceID: ", deviceId);

      socialLoginMutation.mutate(
        { provider: "APPLE", token: token.identityToken, deviceId },
        {
          onSuccess: async (response) => {
            const userResponse = response.data?.userResponse;

            try {
              // 토큰은 전역 store + SecureStore에 동시 저장
              await setTokens({
                accessToken: userResponse.accessToken,
                refreshToken: userResponse.refreshToken,
              });

              await handleSocialLoginResult("APPLE", response);
            } finally {
              setIsSocialLoading(false);
            }
          },
          onError: (error) => {
            console.log("Apple 서버 로그인 실패");
            console.log("상태 코드: ", error?.response?.status);
            console.log("에러 데이터: ", error?.response?.data);
            console.log("에러 메시지: ", error?.message);
            console.log("요청 URL:", error.config?.baseURL + error.config?.url);

            const code = error?.response?.data?.code;
            if (error?.response?.status === 409 && code === "USER006") {
              handleUser006ProviderConflict("APPLE", error);
              return;
            }

            showApiAuthError(
              error,
              "애플 로그인 실패",
              "잠시 후 다시 시도해 주세요.",
            );
            setIsSocialLoading(false);
          },
        },
      );
    } catch (error) {
      console.log("애플 로그인 js 단계 오류");
      console.log("애플 로그인 오류:", error);
      console.log("애플 로그인 오류 메시지:", error?.message);
      console.log("애플 로그인 오류 코드:", error?.code);
      showApiAuthError(
        error,
        "애플 로그인 실패",
        "잠시 후 다시 시도해 주세요.",
      );
      setIsSocialLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    if (isSocialLoading) return;
    setIsSocialLoading(true);

    try {
      const { token, profile, cancelled } = await kakaoSignIn();
      if (cancelled) {
        setIsSocialLoading(false);
        return;
      }

      // console.log("카카오 토큰:", token);
      // console.log("카카오 프로필:", profile);

      const deviceId = await getDeviceId();
      // console.log("deviceID: ", deviceId);

      socialLoginMutation.mutate(
        { provider: "KAKAO", token: token.accessToken, deviceId },
        {
          onSuccess: async (response) => {
            const userResponse = response.data.userResponse;

            try {
              await setTokens({
                accessToken: userResponse.accessToken,
                refreshToken: userResponse.refreshToken,
              });

              await handleSocialLoginResult("KAKAO", response);
            } finally {
              setIsSocialLoading(false);
            }
          },
          onError: (error) => {
            console.log("카카오 서버 로그인 실패");
            console.log("상태 코드: ", error?.response?.status);
            console.log("에러 데이터: ", error?.response?.data);
            console.log("에러 메시지: ", error?.message);
            console.log("요청 URL:", error.config?.baseURL + error.config?.url);

            const code = error?.response?.data?.code;
            if (error?.response?.status === 409 && code === "USER006") {
              handleUser006ProviderConflict("KAKAO", error);
              return;
            }
            if (error?.response?.status === 400 && code === "SOCIAL004") {
              const msg =
                error?.response?.data?.message ??
                "카카오 계정에 이메일이 등록되어 있지 않습니다.";
              Alert.alert("카카오 로그인 오류", msg);
              setIsSocialLoading(false);
              return;
            }
            showApiAuthError(
              error,
              "카카오 로그인 실패",
              "잠시 후 다시 시도해주세요.",
            );
            setIsSocialLoading(false);
          },
        },
      );
    } catch (error) {
      console.log("카카오 로그인 JS 단계 오류:", error);
      showApiAuthError(
        error,
        "카카오 로그인 실패",
        "잠시 후 다시 시도해주세요.",
      );
      setIsSocialLoading(false);
    }
  };

  const handleNaverLogin = async () => {
    if (isSocialLoading) return;
    setIsSocialLoading(true);

    try {
      console.log("[NAVER] 로그인 버튼 클릭");
      const naverResult = await naverSignIn();
      const { token, profile, cancelled } = naverResult;
      if (cancelled) {
        if (naverResult.missingConfig) {
          console.warn(
            "[NAVER][dev] extra에 네이버 설정이 비어 있습니다. 환경변수 NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, NAVER_APP_NAME, NAVER_IOS_URL_SCHEME를 .env / .env.local 또는 EAS(빌드 프로필)에 맞춰 넣고, app.config가 이를 extra로 넘기는지 확인한 뒤 prebuild·재빌드하세요.",
          );
          Alert.alert(
            "로그인 안내",
            "로그인을 완료할 수 없습니다. 잠시 후 다시 시도해 주세요.",
          );
        } else if (naverResult.timeout) {
          console.warn(
            "[NAVER][dev] 로그인 콜백 타임아웃. iOS serviceUrlSchemeIOS(NAVER_IOS_URL_SCHEME)·@react-native-seoul/naver-login 플러그인 urlScheme·네이버 앱 설치 여부를 확인하세요.",
          );
          Alert.alert(
            "네이버 로그인",
            "응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.",
          );
        } else if (naverResult.errorMessage) {
          console.warn(
            "[NAVER][dev] login() 실패 상세:",
            naverResult.errorMessage,
          );
          Alert.alert(
            "네이버 로그인",
            "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
          );
        } else if (!naverResult.userCancel) {
          console.warn("[NAVER][dev] 로그인 취소/실패(상세):", naverResult);
          Alert.alert(
            "네이버 로그인",
            "로그인을 완료할 수 없습니다. 잠시 후 다시 시도해 주세요.",
          );
        }
        console.log("[NAVER] 로그인 취소/중단됨", naverResult);
        setIsSocialLoading(false);
        return;
      }

      console.log("네이버 토큰:", token);
      console.log("네이버 프로필:", profile);

      const deviceId = await getDeviceId();

      socialLoginMutation.mutate(
        { provider: "NAVER", token: token.accessToken, deviceId },
        {
          onSuccess: async (response) => {
            const userResponse = response.data.userResponse;

            try {
              await setTokens({
                accessToken: userResponse.accessToken,
                refreshToken: userResponse.refreshToken,
              });

              await handleSocialLoginResult("NAVER", response);
            } finally {
              setIsSocialLoading(false);
            }
          },
          onError: (error) => {
            console.log("네이버 소셜 로그인 실패:", error);
            const code = error?.response?.data?.code;
            if (error?.response?.status === 409 && code === "USER006") {
              handleUser006ProviderConflict("NAVER", error);
              return;
            }
            if (error?.response?.status === 400 && code === "SOCIAL004") {
              const msg =
                error?.response?.data?.message ??
                "네이버 계정에 이메일이 등록되어 있지 않습니다.";
              Alert.alert("네이버 로그인 오류", msg);
              setIsSocialLoading(false);
              return;
            }
            showApiAuthError(
              error,
              "네이버 로그인 실패",
              "잠시 후 다시 시도해주세요.",
            );
            setIsSocialLoading(false);
          },
        },
      );
    } catch (error) {
      console.log(error);
      console.log("네이버 로그인 JS 단계 오류:", error);
      showApiAuthError(
        error,
        "네이버 로그인 실패",
        "잠시 후 다시 시도해주세요.",
      );
      setIsSocialLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <AuthBackground />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.container}>
          {/* 중앙 로고 텍스트 */}
          <View style={styles.logoArea}>
            <BetaLogo width={150} height={50} />
          </View>

          {/* 하단 버튼 영역 */}
          <View style={styles.bottomArea}>
            <TouchableOpacity
              style={[styles.fullButton, styles.appleButton]}
              onPress={handleAppleLogin}
              activeOpacity={0.85}
              disabled={isSocialLoading}
            >
              <AppleIcon width={20} height={20} />
              <Text style={[styles.fullButtonText, styles.appleText]}>
                Apple 로그인
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.fullButton, styles.kakaoButton]}
              onPress={handleKakaoLogin}
              activeOpacity={0.85}
              disabled={isSocialLoading}
            >
              <KakaoIcon width={18} height={18} />
              <Text style={[styles.fullButtonText, styles.kakaoText]}>
                카카오 로그인
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.fullButton, styles.naverButton]}
              onPress={handleNaverLogin}
              activeOpacity={0.85}
              disabled={isSocialLoading}
            >
              <NaverIcon width={16} height={16} />
              <Text style={[styles.fullButtonText, styles.naverText]}>
                네이버 로그인
              </Text>
            </TouchableOpacity>

            {/* <TouchableOpacity onPress={hardResetKakao}>
            <Text style={{color: "white"}}>카카오 세션 초기화</Text>
          </TouchableOpacity> */}
          </View>

          {/* 이미 다른 소셜로 가입된 계정 안내 모달 */}
          <Modal
            visible={!!providerConflict}
            transparent
            animationType="fade"
            onRequestClose={() => setProviderConflict(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                {providerConflict && providerConflict.providerKey && (
                  <>
                    <AppText variant="bodyMedium" style={styles.modalLine}>
                      <AppText
                        variant="bodyMedium"
                        style={[
                          styles.modalHighlight,
                          {
                            color:
                              conflictColors[providerConflict.providerKey] ??
                              "#FFF",
                          },
                          providerConflict.providerKey === "APPLE"
                            ? { fontWeight: "700" }
                            : null,
                        ]}
                      >
                        {conflictProviderName[providerConflict.providerKey]}
                      </AppText>
                      {"로 가입된 계정입니다."}
                    </AppText>
                    <AppText variant="bodyMedium" style={styles.modalLine}>
                      <AppText
                        variant="bodyMedium"
                        style={[
                          styles.modalHighlight,
                          {
                            color:
                              conflictColors[providerConflict.providerKey] ??
                              "#FFF",
                          },
                          providerConflict.providerKey === "APPLE"
                            ? { fontWeight: "700" }
                            : null,
                        ]}
                      >
                        {conflictProviderName[providerConflict.providerKey]}{" "}
                        로그인
                      </AppText>
                      {"을 이용해 주세요."}
                    </AppText>
                  </>
                )}

                <TouchableOpacity
                  style={styles.modalButton}
                  activeOpacity={0.85}
                  onPress={() => setProviderConflict(null)}
                >
                  <AppText variant="bodyMedium" style={styles.modalButtonText}>
                    확인
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  logoArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomArea: {
    paddingBottom: 24,
    gap: 12,
  },

  fullButton: {
    height: 54,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fullButtonText: {
    fontFamily: "NotoSansKR_SemiBold",
    fontSize: 20,
    // borderWidth: 1,
    lineHeight: 27,
  },

  appleButton: {
    backgroundColor: "#FFFFFF",
  },
  appleText: {
    color: "#111111",
  },
  appleIcon: {
    color: "#111111",
    fontSize: 18,
    fontWeight: "900",
    marginTop: -1,
  },

  kakaoButton: {
    backgroundColor: "#FEE500",
  },
  kakaoText: {
    color: "#111111",
  },

  naverButton: {
    backgroundColor: "#03C75A",
  },
  naverText: {
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  modalCard: {
    width: "100%",
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.85)",
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: "center",
  },
  modalLine: {
    color: "#F9F9F9",
    lineHeight: 22,
    textAlign: "center",
    alignSelf: "stretch",
  },
  modalHighlight: {
    fontWeight: "700",
  },
  modalButton: {
    marginTop: 18,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E1E1E",
  },
});
