// src/features/auth/screens/LoginScreen.jsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
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
import { normalizeSignupStep } from "../../../../shared/services/sessionBootstrap";
import { cancelWithdrawAccountApi } from "../../services/authSessionService";

// 아이콘(svg) - 프로젝트 경로에 맞게 유지
import BetaLogo from "@shared/assets/svg/logos/BetaLogo.svg";
import KakaoIcon from "../../assets/Login/kakao.svg";
import NaverIcon from "../../assets/Login/naver.svg";
import AppleIcon from "../../assets/Login/apple.svg";

/**
 * 백엔드/프록시에 따라 필드 위치가 달라질 수 있음!
 * (ErrorResponse: code+message / Spring 기본: message만 / error 중첩 등)
 */
function getSocialLoginErrorPayload(error) {
  const raw = error?.response?.data;
  if (raw == null) {
    return { code: null, message: null, data: null };
  }
  if (typeof raw === "string") {
    return { code: null, message: raw, data: null };
  }
  if (typeof raw !== "object") {
    return { code: null, message: null, data: raw };
  }
  const code =
    raw.code ?? raw.errorCode ?? raw.error?.code ?? raw.errCode ?? null;
  const message =
    (typeof raw.message === "string" ? raw.message : null) ??
    (typeof raw.error?.message === "string" ? raw.error.message : null) ??
    (typeof raw.detail === "string" ? raw.detail : null);
  return {
    code: code != null ? String(code) : null,
    message,
    data: raw,
  };
}

function trimSignupEmail(value) {
  if (typeof value !== "string") return "";
  const t = value.trim();
  return t.length > 0 ? t : "";
}

/**
 * 회원가입 이어하기 시 네비게이션용 이메일.
 * - OpenAPI: SignupStatusResponse.email (CONSENT_AGREED 이후) — getSignupStatus
 * - OpenAPI: UserDto.email — 소셜 로그인 응답의 user 객체에 정의 (UserResponse 스키마는 비어 있음)
 * @param {object | null | undefined} userResponse — POST /api/v1/auth/login/{provider} 의 userResponse
 * @param {unknown} emailFromServer — GET /api/v1/auth/signup/status 의 email
 */
function resolveSignupFlowEmailFromLogin(userResponse, emailFromServer) {
  const fromStatus = trimSignupEmail(
    emailFromServer == null ? "" : String(emailFromServer),
  );
  if (fromStatus) return fromStatus;
  const top = trimSignupEmail(userResponse?.email);
  if (top) return top;
  const nested = userResponse?.user;
  if (nested && typeof nested === "object") {
    const fromUser = trimSignupEmail(nested.email);
    if (fromUser) return fromUser;
  }
  return "";
}

const LoginScreen = ({ navigation, route }) => {
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const socialLoginMutation = useSocialLoginMutation();
  const setTokens = useUserStore((state) => state.setTokens);
  const setUser = useUserStore((state) => state.setUser);
  const clearAuth = useUserStore((state) => state.clearAuth);

  const authErrorMessage = route?.params?.authErrorMessage ?? null;

  useEffect(() => {
    if (!authErrorMessage) return;
    Alert.alert("로그인 실패", authErrorMessage);
  }, [authErrorMessage]);

  const showApiAuthError = (error, title, fallbackMessage) => {
    const msg =
      getSocialLoginErrorPayload(error).message ??
      error?.message ??
      fallbackMessage;
    Alert.alert(title, msg);
  };

  const showDuplicateEmailAlert = (error) => {
    const payload = getSocialLoginErrorPayload(error);
    const msg =
      payload.message ??
      "이미 가입된 이메일입니다. 소셜 로그인을 확인해 주세요.";
    Alert.alert("로그인 안내", msg);
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
      const baseUser = userResponse?.user ? userResponse.user : userResponse;
      const withdrawnAt = baseUser?.withdrawnAt ?? null;
      const scheduledDeletionAt = baseUser?.scheduledDeletionAt ?? null;

      const scheduled =
        scheduledDeletionAt &&
        !Number.isNaN(new Date(scheduledDeletionAt).getTime())
          ? new Date(scheduledDeletionAt)
          : null;

      // 30일이 지나 영구 삭제 대상(또는 삭제 완료)로 판단되면 앱 세션을 즉시 비우고 안내
      if (scheduled && Date.now() >= scheduled.getTime()) {
        await clearAuth();
        delete api.defaults.headers.Authorization;
        Alert.alert(
          "로그인 안내",
          "탈퇴한 계정은 30일이 지나 삭제되었습니다. 새 계정으로 가입해 주세요.",
        );
        return;
      }

      // 탈퇴 요청 상태면(30일 이내) 재로그인 시 탈퇴 취소 시도
      if (withdrawnAt || scheduledDeletionAt) {
        try {
          await cancelWithdrawAccountApi();
        } catch (e) {
          // 취소가 실패하더라도 로그인 자체는 진행되게 하되 사용자에게는 안내
          console.warn("[withdraw/cancel] failed", e?.response?.data ?? e);
          Alert.alert(
            "안내",
            "계정 탈퇴 취소 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.",
          );
        }
      }

      // 기존 회원 → 유저 정보 전역 저장 후 메인으로
      if (baseUser) {
        // 탈퇴 취소가 성공했더라도 응답이 업데이트되지 않는 케이스가 있어, 클라이언트 표시는 정상 상태로 보정
        const normalizedUser =
          withdrawnAt || scheduledDeletionAt
            ? { ...baseUser, withdrawnAt: null, scheduledDeletionAt: null }
            : baseUser;
        setUser(normalizedUser);
      }
      navigation.replace("Main");
      return;
    }

    // 회원가입 미완료
    // - SOCIAL_AUTHENTICATED 또는 단계 미표시: 약관만 필요 -> GET /signup/status 생략 가능
    // - 그 외(CONSENT_AGREED, PROFILE_COMPLETED, TEAM_SELECTED 등): 해당 화면 구성용
    //   email 등은 반드시 GET /api/v1/auth/signup/status 로 조회 (팀 목록은 각 화면에서 status 재조회)
    let signupStep = normalizeSignupStep(userResponse.signupStep);
    let emailFromServer = null;

    const canSkipSignupStatus =
      signupStep == null || signupStep === "SOCIAL_AUTHENTICATED";

    if (!canSkipSignupStatus) {
      try {
        const status = await fetchSignupStatusWithToken(
          userResponse.accessToken,
        );
        if (status?.signupStep != null) {
          const normalized = normalizeSignupStep(status.signupStep);
          if (normalized) {
            signupStep = normalized;
          }
        }
        emailFromServer = status?.email ?? null;
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
            email: resolveSignupFlowEmailFromLogin(userResponse, emailFromServer),
          },
        });
        break;

      case "PROFILE_COMPLETED":
        // 2단계: 팀 선택 — 목록은 SignupFavoriteTeam에서 GET /signup/status 로 로드
        navigation.navigate("SignupFavoriteTeam", {
          signup: {
            email: resolveSignupFlowEmailFromLogin(userResponse, emailFromServer),
          },
        });
        break;

      case "TEAM_SELECTED":
        // 3단계: 성별/나이 입력 — getSignupResumeRoute 와 동일하게 email 전달
        navigation.navigate("SignupGenderAge", {
          signup: {
            email: resolveSignupFlowEmailFromLogin(userResponse, emailFromServer),
          },
        });
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

            const payload = getSocialLoginErrorPayload(error);
            const code = payload.code;
            if (
              error?.response?.status === 409 &&
              (payload.code === "USER006" || !!payload.message)
            ) {
              showDuplicateEmailAlert(error);
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

            const payload = getSocialLoginErrorPayload(error);
            const code = payload.code;
            if (
              error?.response?.status === 409 &&
              (payload.code === "USER006" || !!payload.message)
            ) {
              showDuplicateEmailAlert(error);
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
            const payload = getSocialLoginErrorPayload(error);
            const code = payload.code;
            if (
              error?.response?.status === 409 &&
              (code === "USER006" || !!payload.message)
            ) {
              showDuplicateEmailAlert(error);
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
});
