// src/features/auth/screens/LoginScreen.jsx
import React, { useMemo, useState } from "react";
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
import { useSignupStatusMutation } from "../../services/signupStatusMutation";

import * as SecureStore from "expo-secure-store";
import { getDeviceId } from "../../libs/Login/deviceUtils";

// 아이콘(svg) - 프로젝트 경로에 맞게 유지
import BetaLogo from "@shared/assets/svg/logos/BetaLogo.svg";
import KakaoIcon from "../../assets/Login/kakao.svg";
import NaverIcon from "../../assets/Login/naver.svg";
import AppleIcon from "../../assets/Login/apple.svg";

const LoginScreen = ({ navigation }) => {
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const socialLoginMutation = useSocialLoginMutation();
  const [providerConflict, setProviderConflict] = useState(null); // 'KAKAO' | 'NAVER' | 'APPLE' | null
  const signupStatusMutation = useSignupStatusMutation();

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

  const handleSocialLoginResult = async (provider, response) => {
    const data = response?.data;
    const isNewUser =
      typeof data?.isNewUser === "boolean"
        ? data.isNewUser
        : // 백엔드 필드명이 newUser로 올 수도 있어 둘 다 지원
          data?.newUser;
    const userResponse = data?.userResponse;

    if (!userResponse?.accessToken) {
      Alert.alert("로그인 오류", "응답을 처리할 수 없습니다.");
      return;
    }

    // 임시: 토큰을 axios 기본 헤더에만 세팅 (추후 authStore 연동 O)
    // eslint-disable-next-line global-require
    const api = require("../../../../shared/libs/api").default;
    api.defaults.headers.Authorization = `Bearer ${userResponse.accessToken}`;

    if (!isNewUser) {
      // 기존 회원 → 바로 메인으로
      navigation.replace("Main");
      return;
    }

    // 신규 or 회원가입 미완료 → 서버에서 최신 signupStep / 데이터 조회
    let signupStep = userResponse.signupStep;
    let emailFromServer = null;
    let teamListFromServer = null;

    try {
      const status = await signupStatusMutation.mutateAsync();
      if (status?.signupStep) {
        signupStep = status.signupStep;
      }
      emailFromServer = status?.email ?? null;
      teamListFromServer = status?.teamList ?? null;
    } catch (e) {
      console.log("signup/status 조회 실패:", e);
    }

    console.log("회원가입 진행 단계 (복원 포함): ", signupStep);

    switch (signupStep) {
      case "SOCIAL_AUTHENTICATED":
        // 약관 동의 페이지로
        navigation.replace("TermsDetail");
        break;

      case "CONSENT_AGREED":
        // 1단계: 이메일(읽기 전용) + 닉네임
        navigation.replace("SocialSignup", {
          signup: {
            email: emailFromServer || userResponse.email,
          },
        });
        break;

      case "PROFILE_COMPLETED":
        // 2단계: 팀 선택 (teamList 필요)
        navigation.replace("SignupFavoriteTeam", {
          signup: {},
          teamList: teamListFromServer || [],
        });
        break;

      case "TEAM_SELECTED":
        // 3단계: 성별/나이 입력
        navigation.replace("SignupGenderAge", { signup: {} });
        break;

      default:
        // 알 수 없는 상태면 약관부터 시작
        navigation.replace("TermsDetail");
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
        return;
      }

      console.log("애플 identityToken:", token?.identityToken);

      if (!token?.identityToken) {
        console.log("identityToken 없음");
        return;
      }

      const deviceId = await getDeviceId();
      console.log("deviceID: ", deviceId);

      socialLoginMutation.mutate(
        { provider: "APPLE", token: token.identityToken, deviceId },
        {
          onSuccess: async (response) => {
            console.log("Apple 로그인 서버 응답 성공!");
            console.log("전체 응답: ", response?.data);

            const { isNewUser, userResponse } = response.data;

            console.log("isNewUser: ", isNewUser);
            console.log("accessToken: ", userResponse?.accessToken);
            console.log("refreshToken: ", userResponse?.refreshToken);
            console.log("서버 device id: ", userResponse?.deviceId);

            // 로그인 이후 자동 로그인 위해 필요함!!
            await SecureStore.setItemAsync(
              "accessToken",
              userResponse.accessToken,
            );
            await SecureStore.setItemAsync(
              "refreshToken",
              userResponse.refreshToken,
            );

            console.log("토큰 SecureStore 저장 완료!");
            handleSocialLoginResult("APPLE", response);
          },
          onError: (error) => {
            console.log("Apple 서버 로그인 실패");
            console.log("상태 코드: ", error?.response?.status);
            console.log("에러 데이터: ", error?.response?.data);
            console.log("에러 메시지: ", error?.message);
            console.log("요청 URL:", error.config?.baseURL + error.config?.url);

            const code = error?.response?.data?.code;
            const socialProvider = error?.response?.data?.socialProvider;
            if (error?.response?.status === 409 && code === "USER006") {
              setProviderConflict(socialProvider || "APPLE");
              return;
            }

            Alert.alert("애플 로그인 실패", "잠시 후 다시 시도해 주세요.");
          },
        },
      );
    } catch (error) {
      console.log("애플 로그인 js 단계 오류");
      console.log("애플 로그인 오류:", error);
      console.log("애플 로그인 오류 메시지:", error?.message);
      console.log("애플 로그인 오류 코드:", error?.code);
      Alert.alert("애플 로그인 실패", "잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSocialLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    if (isSocialLoading) return;
    setIsSocialLoading(true);

    try {
      const { token, profile, cancelled } = await kakaoSignIn();
      if (cancelled) return;

      console.log("카카오 토큰:", token);
      console.log("카카오 프로필:", profile);

      const deviceId = await getDeviceId();
      console.log("deviceID: ", deviceId);

      socialLoginMutation.mutate(
        { provider: "KAKAO", token: token.accessToken, deviceId },
        {
          onSuccess: async (response) => {
            const userResponse = response.data.userResponse;

            // 토큰 SecureStore 저장
            await SecureStore.setItemAsync(
              "accessToken",
              userResponse.accessToken,
            );
            await SecureStore.setItemAsync(
              "refreshToken",
              userResponse.refreshToken,
            );

            await SecureStore.setItemAsync(
              "accessToken",
              response.data.userResponse.accessToken,
            );
            await SecureStore.setItemAsync(
              "refreshToken",
              response.data.userResponse.refreshToken,
            );
            handleSocialLoginResult("KAKAO", response);
          },
          onError: (error) => {
            console.log("카카오 서버 로그인 실패");
            console.log("상태 코드: ", error?.response?.status);
            console.log("에러 데이터: ", error?.response?.data);
            console.log("에러 메시지: ", error?.message);
            console.log("요청 URL:", error.config?.baseURL + error.config?.url);

            const code = error?.response?.data?.code;
            const socialProvider = error?.response?.data?.socialProvider;
            if (error?.response?.status === 409 && code === "USER006") {
              setProviderConflict(socialProvider || "KAKAO");
              return;
            }
            if (error?.response?.status === 400 && code === "SOCIAL004") {
              Alert.alert(
                "카카오 로그인 오류",
                "카카오 계정에 이메일이 등록되어 있지 않습니다.",
              );
              return;
            }
            Alert.alert("카카오 로그인 실패", "잠시 후 다시 시도해주세요.");
          },
        },
      );
    } catch (error) {
      console.log("카카오 로그인 JS 단계 오류:", error);
      Alert.alert("카카오 로그인 실패", "잠시 후 다시 시도해주세요.");
    } finally {
      setIsSocialLoading(false);
    }
  };

  const handleNaverLogin = async () => {
    if (isSocialLoading) return;
    setIsSocialLoading(true);

    try {
      const { token, profile, cancelled } = await naverSignIn();
      if (cancelled) return;

      console.log("네이버 토큰:", token);
      console.log("네이버 프로필:", profile);

      const deviceId = await getDeviceId();

      socialLoginMutation.mutate(
        { provider: "NAVER", token: token.accessToken, deviceId },
        {
          onSuccess: async (response) => {
            const userResponse = response.data.userResponse;

            await SecureStore.setItemAsync(
              "accessToken",
              userResponse.accessToken,
            );
            await SecureStore.setItemAsync(
              "refreshToken",
              userResponse.refreshToken,
            );

            handleSocialLoginResult("NAVER", response);
          },
          onError: (error) => {
            console.log("네이버 소셜 로그인 실패:", error);
            const code = error?.response?.data?.code;
            const socialProvider = error?.response?.data?.socialProvider;
            if (error?.response?.status === 409 && code === "USER006") {
              setProviderConflict(socialProvider || "NAVER");
              return;
            }
            if (error?.response?.status === 400 && code === "SOCIAL004") {
              Alert.alert(
                "네이버 로그인 오류",
                "네이버 계정에 이메일이 등록되어 있지 않습니다.",
              );
              return;
            }
            Alert.alert("네이버 로그인 실패", "잠시 후 다시 시도해주세요.");
          },
        },
      );
    } catch (error) {
      console.log(error);
      console.log("네이버 로그인 JS 단계 오류:", error);
      Alert.alert("네이버 로그인 실패", "잠시 후 다시 시도해주세요.");
    } finally {
      setIsSocialLoading(false);
    }
  };

  // const hardResetKakao = async () => {
  //   try {
  //     // 1) 먼저 로그인해서 토큰 확보 (자동 로그인으로 바로 될 수도 있음)
  //     const token = await login();
  //     console.log("현재 카카오 토큰:", token);

  //     // 2) 그 토큰을 가진 상태에서 unlink → 카카오 계정 ↔ 앱 연결 끊기
  //     await unlink();
  //     console.log("카카오 앱 연결 해제 완료 (동의 초기화)");
  //   } catch (e) {
  //     console.log("hardResetKakao 실패:", e);
  //   }
  // };

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
                {providerConflict && (
                  <>
                    <Text style={styles.modalLine}>
                      <Text
                        style={[
                          styles.modalHighlight,
                          { color: conflictColors[providerConflict] },
                        ]}
                      >
                        {conflictProviderName[providerConflict]}
                      </Text>
                      로 가입된 계정입니다.
                    </Text>
                    <Text style={styles.modalLine}>
                      <Text
                        style={[
                          styles.modalHighlight,
                          { color: conflictColors[providerConflict] },
                        ]}
                      >
                        {conflictProviderName[providerConflict]} 로그인
                      </Text>
                      을 이용해 주세요.
                    </Text>
                  </>
                )}

                <TouchableOpacity
                  style={styles.modalButton}
                  activeOpacity={0.85}
                  onPress={() => setProviderConflict(null)}
                >
                  <Text style={styles.modalButtonText}>확인</Text>
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
  },
  modalLine: {
    color: "#F9F9F9",
    fontSize: 15,
    lineHeight: 22,
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
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E1E1E",
  },
});
