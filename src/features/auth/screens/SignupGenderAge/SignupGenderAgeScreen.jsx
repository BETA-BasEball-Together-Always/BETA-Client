// src/features/auth/screens/SignupGenderAge/SignupGenderAgeScreen.jsx
import React, {useState, useMemo, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

import AuthBackground from "../../components/AuthBackground";
import SignupStepIndicator from "../../components/SignupStepIndicator";
import {useSignupSecretStore} from "../../stores/useSignupSecretStore";

const {height} = Dimensions.get("window");

const SignupGenderAgeScreen = ({navigation, route}) => {
  const [gender, setGender] = useState(null); // 'FEMALE' | 'MALE' | null
  const [age, setAge] = useState("");

  // ✅ 누적된 회원가입 정보
  const signup = route?.params?.signup ?? {};

  // ✅ password는 params가 아니라 zustand 메모리에서
  const {password, clearSecrets} = useSignupSecretStore();

  const isNextEnabled = useMemo(() => {
    return !!age && Number(age) > 0;
  }, [age]);

  useEffect(() => {
    console.log("gender", gender);
  }, [gender]);

  // ✅ 마지막 제출 로직
  const submitSignup = async ({genderValue, ageValue}) => {
    // password가 없으면(새로고침/앱종료 등) 안전하게 되돌리기
    if (signup.signupType === "NATIVE" && !password) {
      // UX는 프로젝트 스타일에 맞게 토스트/알럿 처리 추천
      navigation.replace("Login");
      return;
    }

    // ✅ 최종 payload 조립 (필요 필드만 백엔드 명세대로 맞춰)
    const payload = {
      social: signup.signupType ?? null,
      email: signup.email,
      password, // ✅ 여기서만 사용
      agreeMarketing: signup.agreeMarketing,
      personalInfoRequired: signup.personalInfoRequired,
      nickName: signup.nickname,
      favoriteTeam: signup.favoriteTeam,
      gender: genderValue ?? null, // 선택사항
      age: ageValue ?? null, // 선택사항
    };
    console.log("최종 회원가입 payload:", payload);

    // ✅ API 호출 (엔드포인트는 너희 명세로 수정)
    // await api.post("/api/auth/signup", payload);

    // ✅ 성공 시 비밀번호 즉시 제거
    // clearSecrets();

    // ✅ 완료 후 이동 (완료 화면/로그인/메인 등 너희 플로우로)
    // navigation.replace("Login"); // 예시
  };

  const handleNext = async () => {
    // 다음 버튼(나이 입력 완료) 눌렀을 때
    await submitSignup({
      genderValue: gender, // 선택
      ageValue: age ? Number(age) : null, // 선택
    });
  };

  const handleSkip = async () => {
    // 건너뛰기 눌렀을 때 (성별/나이 둘 다 null로 처리)
    await submitSignup({
      genderValue: null,
      ageValue: null,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <AuthBackground />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.inner}>
              {/* 헤더 */}
              <View style={styles.headerRow}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backButtonText}>{"<"}</Text>
                </TouchableOpacity>

                <View style={styles.stepWrapper}>
                  <SignupStepIndicator currentStep={3} />
                </View>

                <View style={styles.rightPlaceholder} />
              </View>

              {/* 성별 */}
              <Text style={styles.title}>
                성별을 선택해주세요
                <Text style={styles.optional}> * 선택사항</Text>
              </Text>

              <View style={styles.genderRow}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === "F" && styles.genderFemaleSelected,
                  ]}
                  onPress={() => setGender("F")}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.genderText,
                      gender === "F" && styles.genderFemaleTextSelected,
                    ]}
                  >
                    여성
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === "M" && styles.genderMaleSelected,
                  ]}
                  onPress={() => setGender("M")}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.genderText,
                      gender === "M" && styles.genderMaleTextSelected,
                    ]}
                  >
                    남성
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 나이 */}
              <Text style={[styles.title, {marginTop: 48, marginBottom: 8}]}>
                나이를 입력해주세요
                <Text style={styles.optional}> * 선택사항</Text>
              </Text>

              <View style={styles.ageInputWrapper}>
                <TextInput
                  style={styles.ageInput}
                  value={age}
                  onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ""))}
                  keyboardType="number-pad"
                  placeholder=""
                  placeholderTextColor="#B8B8C4"
                  maxLength={3}
                />
              </View>
            </View>
          </ScrollView>

          {/* 하단 버튼 */}
          <View style={styles.floatingBottomArea}>
            {isNextEnabled && (
              <TouchableOpacity
                style={styles.nextButton}
                activeOpacity={0.85}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>다음</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.skipButton}
              activeOpacity={0.8}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>건너뛰기</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default SignupGenderAgeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.25,
    paddingHorizontal: 20,
  },
  inner: {
    maxWidth: 390,
    width: "100%",
    alignSelf: "center",
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: height * 0.1,
    marginBottom: 20,
  },
  backButton: {
    width: 32,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 30,
    lineHeight: 15,
    color: "#FFFFFF",
  },
  stepWrapper: {
    width: 150,
    alignItems: "center",
  },
  rightPlaceholder: {
    width: 32,
  },

  /* Title */
  title: {
    fontSize: 22,
    // fontWeight: "700",
    fontFamily: "NotoSansKR_SemiBold",
    lineHeight: 33,
    color: "#FFFFFF",
    marginBottom: 16,
    // borderWidth: 1,
  },
  optional: {
    fontSize: 13,
    fontWeight: "400",
    color: "rgba(255,255,255,0.6)",
  },

  /* Gender */
  genderRow: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    height: 48,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  genderText: {
    fontSize: 18,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
  },

  genderFemaleSelected: {
    borderWidth: 1,
    borderColor: "#FF4D8D",
    backgroundColor: "rgba(255,116,176,0.15)",
  },
  genderFemaleTextSelected: {
    color: "#FF4D8D",
  },

  genderMaleSelected: {
    borderWidth: 1,
    borderColor: "#4D7CFF",
    backgroundColor: "rgba(116,141,255,0.15)",
  },
  genderMaleTextSelected: {
    color: "#4D7CFF",
  },

  /* Age */
  ageInputWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.5)",
    // paddingVertical: 6,
    // borderWidth: 1,
  },
  ageInput: {
    fontSize: 18,
    color: "#FFFFFF",
  },

  /* Bottom */
  floatingBottomArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nextButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },
  skipButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#232323",
    justifyContent: "center",
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
