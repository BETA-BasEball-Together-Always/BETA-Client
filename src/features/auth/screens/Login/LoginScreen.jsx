// src/features/auth/screens/LoginScreen.jsx
import React, {useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {
  login,
  getProfile,
  logout,
  unlink,
} from "@react-native-seoul/kakao-login";

// 🔽 SVG 아이콘 import (경로는 프로젝트에 맞게 수정)
import BetaLogo from "@shared/assets/svg/logos/BetaLogo.svg";
import KakaoIcon from "./assets/kakao.svg";
import NaverIcon from "./assets/naver.svg";
import {SafeAreaView} from "react-native-safe-area-context";
import {kakaoSignIn} from "./libs/kakaoSignIn";
import {naverSignIn} from "./libs/naverSignIn";
import {useSocialLoginMutation} from "../../services/socialLoginMutation";
import AuthBackground from "../../components/AuthBackground";
import {useSignupSecretStore} from "../../stores/useSignupSecretStore";

const LoginScreen = ({navigation}) => {
  const {setSocialAuth, clearSecrets} = useSignupSecretStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  const socialLoginMutation = useSocialLoginMutation();

  const handleLogin = () => {
    console.log("login", {email, password});
    navigation.navigate("Main");
  };

  const handleKakaoLogin = async () => {
    if (isSocialLoading) return;
    setIsSocialLoading(true);

    try {
      const {token, profile, cancelled} = await kakaoSignIn();

      if (cancelled) return;

      // 여기서부터는 너의 앱 로직 👇
      console.log("카카오 토큰:", token);
      console.log("카카오 프로필:", profile);

      // 1) 백엔드에 토큰 보내서 우리 앱용 accessToken 발급
      // const { appToken } = await kakaoSignInAndIssueAppToken();
      socialLoginMutation.mutate(
        {provider: "KAKAO", token: token.accessToken},
        {
          onSuccess: (response) => {
            console.log("소셜 로그인 성공! newUser?:", response.data.newUser);
          },
        },

        {
          onError: (error) => {
            console.log("소셜 로그인 실패:", error);
          },
        }
      );
      // 2) Zustand / AsyncStorage / MMKV 등에 appToken 저장
      // clearSecrets(); // 혹시 이전 가입 시도 흔적 제거
      // setSocialAuth({provider: "KAKAO", token: token.accessToken});
      // 3) 홈 화면으로 이동 (navigation.navigate("Home") 같은 것)
    } catch (error) {
      Alert.alert("카카오 로그인 실패", "잠시 후 다시 시도해주세요.");
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

  const handleNaverLogin = async () => {
    if (isSocialLoading) return;
    setIsSocialLoading(true);

    try {
      const {token, profile, cancelled} = await naverSignIn();

      if (cancelled) return;

      console.log("네이버 토큰:", token); // accessToken, refreshToken, 만료시간 등
      console.log("네이버 프로필:", profile); // email, name, nickname, gender, age 등

      // 3) 홈 화면으로 이동 (navigation.navigate("Home") 같은 것)

      // 1) 백엔드에 네이버 토큰 보내서 우리 앱용 accessToken 발급
      socialLoginMutation.mutate(
        {provider: "KAKAO", token: token.accessToken},
        {
          onSuccess: (response) => {
            console.log("소셜 로그인 성공! newUser?:", response.data.newUser);
          },
        },

        {
          onError: (error) => {
            console.log("소셜 로그인 실패:", error);
          },
        }
      );
      // clearSecrets(); // 혹시 이전 가입 시도 흔적 제거
      // setSocialAuth({provider: "NAVER", token: token.accessToken});
      // 2) MMKV / AsyncStorage / Zustand 등에 appToken 저장
      // 3) 메인 화면 이동

      // navigation.replace("Main");
    } catch (error) {
      console.log(error);
      Alert.alert("네이버 로그인 실패", "잠시 후 다시 시도해주세요.");
    } finally {
      setIsSocialLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.inner}
          // behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <AuthBackground />

          {/* BETA 로고 텍스트 */}
          <View style={styles.logoWrapper}>
            <BetaLogo width={120} />
            {/* <Text style={styles.logoText}>BETA</Text> */}
          </View>

          {/* 이메일 / 비밀번호 입력 */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="이메일을 입력하세요"
              placeholderTextColor="#B8B8C4"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, styles.inputSpacing]}
              placeholder="비밀번호를 입력하세요"
              placeholderTextColor="#B8B8C4"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* 로그인 버튼 */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>로그인</Text>
            </TouchableOpacity>

            {/* 하단 링크 */}
            <View style={styles.linkRow}>
              <Text style={styles.linkText}>비밀번호 찾기</Text>

              <View style={{flex: 1}} />
              <TouchableOpacity
                onPress={() => navigation.navigate("NativeSignup")}
                activeOpacity={0.7}
              >
                <Text style={styles.linkText}>회원가입</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View>
            {/* SNS 간편 로그인 구분선 */}
            <View style={styles.snsSection}>
              <View style={styles.line} />
              <Text style={styles.snsLabel}>SNS 간편 로그인</Text>
              <View style={styles.line} />
            </View>

            {/* SNS 버튼들 */}
            <View style={styles.snsButtonsRow}>
              <TouchableOpacity
                style={[styles.snsButton, styles.kakaoButton]}
                onPress={handleKakaoLogin}
                activeOpacity={0.8}
              >
                <KakaoIcon width={50} aspectRatio={1} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.snsButton, styles.naverButton]}
                onPress={handleNaverLogin}
                activeOpacity={0.8}
              >
                <NaverIcon width={50} aspectRatio={1} />
              </TouchableOpacity>

              <TouchableOpacity onPress={hardResetKakao}>
                <Text style={{color: "white"}}>카카오 세션 초기화</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  inner: {
    flex: 1,
    paddingHorizontal: "4%",
    paddingTop: "32%",
    paddingBottom: 40,
    paddingBottom: "32%",
    justifyContent: "space-between",
  },
  logoWrapper: {
    marginTop: 40,
    alignItems: "center",
  },
  form: {
    marginTop: 40,
  },
  input: {
    height: 52,
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(0,0,0,0.15)",
    color: "#FFFFFF",
    fontSize: 14,
  },
  inputSpacing: {
    marginTop: 12,
  },
  loginButton: {
    marginTop: 16,
    height: 45,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  linkText: {
    fontSize: 14,
    color: "#E0E0EA",
  },
  dividerDot: {
    fontSize: 12,
    color: "#E0E0EA",
  },
  snsSection: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 40,
    marginBottom: 16,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  snsLabel: {
    marginHorizontal: 12,
    fontSize: 12,
    color: "#E0E0EA",
    fontFamily: "NotoSansKR_SemiBold",
  },
  snsButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: "7%",
  },
  snsButton: {
    // width: 56,
    // height: 56,
    // borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    // borderWidth:1,
    // borderColor:'white'
  },
  kakaoButton: {
    // backgroundColor: "#FEE500",
  },
  naverButton: {
    // backgroundColor: "#03C75A",
  },
});
