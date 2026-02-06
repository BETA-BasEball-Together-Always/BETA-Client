// src/features/auth/screens/LoginScreen.jsx
import React, {useState} from "react";
import {View, Text, StyleSheet, TouchableOpacity, Alert} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {login, unlink} from "@react-native-seoul/kakao-login";

import AuthBackground from "../../components/AuthBackground";
import {kakaoSignIn} from "../../libs/Login/kakaoSignIn";
import {naverSignIn} from "../../libs/Login/naverSignIn";
import {useSocialLoginMutation} from "../../services/socialLoginMutation";

// 아이콘(svg) - 프로젝트 경로에 맞게 유지
import BetaLogo from "@shared/assets/svg/logos/BetaLogo.svg";
import KakaoIcon from "../../assets/Login/kakao.svg";
import NaverIcon from "../../assets/Login/naver.svg";
import AppleIcon from "../../assets/Login/apple.svg";

const LoginScreen = ({navigation}) => {
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const socialLoginMutation = useSocialLoginMutation();

  const handleAppleLogin = () => {
    // TODO: 애플 로그인 붙일 때 여기 구현
    Alert.alert("준비 중", "애플 로그인은 아직 연결되지 않았어요.");
  };

  const handleKakaoLogin = async () => {
    if (isSocialLoading) return;
    setIsSocialLoading(true);

    try {
      const {token, profile, cancelled} = await kakaoSignIn();
      if (cancelled) return;

      console.log("카카오 토큰:", token);
      console.log("카카오 프로필:", profile);

      // ✅ 카카오 버튼 눌렀을 때 기존 로직 그대로 동작
      socialLoginMutation.mutate(
        {provider: "KAKAO", token: token.accessToken},
        {
          onSuccess: (response) => {
            console.log("소셜 로그인 성공! newUser?:", response?.data?.newUser);

            // 필요하면 여기서 이동 처리
            // navigation.replace("Main");
          },
          onError: (error) => {
            console.log("소셜 로그인 실패:", error);
            Alert.alert("카카오 로그인 실패", "잠시 후 다시 시도해주세요.");
          },
        },
      );
    } catch (error) {
      Alert.alert("카카오 로그인 실패", "잠시 후 다시 시도해주세요.");
    } finally {
      setIsSocialLoading(false);
    }
  };

  const handleNaverLogin = async () => {
    if (isSocialLoading) return;
    setIsSocialLoading(true);

    try {
      const {token, profile, cancelled} = await naverSignIn();
      if (cancelled) return;

      console.log("네이버 토큰:", token);
      console.log("네이버 프로필:", profile);

      // ✅ 필요하면 카카오처럼 백엔드 소셜 로그인 붙일 수 있음
      // socialLoginMutation.mutate(
      //   {provider: "NAVER", token: token.accessToken},
      //   {
      //     onSuccess: (response) => navigation.replace("Main"),
      //     onError: () => Alert.alert("네이버 로그인 실패", "잠시 후 다시 시도해주세요."),
      //   }
      // );

      // 지금은 기존 로직(로그/확인)만 유지
    } catch (error) {
      console.log(error);
      Alert.alert("네이버 로그인 실패", "잠시 후 다시 시도해주세요.");
    } finally {
      setIsSocialLoading(false);
    }
  };

  const hardResetKakao = async () => {
    try {
      // 1) 먼저 로그인해서 토큰 확보 (자동 로그인으로 바로 될 수도 있음)
      const token = await login();
      console.log("현재 카카오 토큰:", token);

      // 2) 그 토큰을 가진 상태에서 unlink → 카카오 계정 ↔ 앱 연결 끊기
      await unlink();
      console.log("카카오 앱 연결 해제 완료 (동의 초기화)");
    } catch (e) {
      console.log("hardResetKakao 실패:", e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AuthBackground />

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
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
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
