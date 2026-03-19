// src/features/auth/screens/SignupGenderAge/SignupGenderAgeScreen.jsx
import React, { useState, useMemo, useEffect } from "react";
import {
  View,
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
import { SafeAreaView } from "react-native-safe-area-context";

import AuthBackground from "../../components/AuthBackground";
import SignupStepIndicator from "../../components/SignupStepIndicator";
import { useSignupCompleteMutation } from "../../services/signupCompleteMutation";
import { useStepBack } from "../../hooks/useStepBack";

import BackIcon from "../../../../shared/assets/svg/chevrons/back.svg";
import { AppText } from "../../../../shared/theme/components/AppText";

const { height } = Dimensions.get("window");

const SignupGenderAgeScreen = ({ navigation, route }) => {
  const [gender, setGender] = useState(null); // 'FEMALE' | 'MALE' | null
  const [age, setAge] = useState("");
  const [signupData, setSignupData] = useState({});

  const handleBack = useStepBack("SignupFavoriteTeam");

  const isNextEnabled = useMemo(() => {
    return !!age && Number(age) > 0;
  }, [age]);

  useEffect(() => {
    console.log("gender", gender);
  }, [gender]);

  const signupCompleteMutation = useSignupCompleteMutation();

  // 재진입 시 route.params.signup + AsyncStorage에서 데이터 복구!!
  useEffect(() => {
    const restoreSignupData = async () => {
      const routeSignup = route?.params?.signup ?? {};
      let storedSignup = {};

      try {
        const stored = await AsyncStorage.getItem("@signupData");
        if (stored) storedSignup = JSON.parse(stored);
      } catch (e) {
        console.log("async storage 불러오기 실패: ", e);
        console.log("async storage 불러오기 실패 에러 데이터: ", e.data);
        console.log("async storage 불러오기 실패 에러 리스폰스: ", e.response);
      }

      setSignupData({
        ...storedSignup,
        ...routeSignup,
      });
    };
    restoreSignupData();
  }, [route]);

  // 호출 시 signupData 포함하도록 수정
  const submitSignup = ({ genderValue, ageValue }) => {
    signupCompleteMutation.mutate(
      {
        ...(signupData || {}),
        gender: genderValue ?? undefined,
        age: typeof ageValue === "number" ? ageValue : undefined,
      },
      {
        onSuccess: () => {
          navigation.replace("SignupComplete", {
            signup: {
              ...(signupData || {}),
              // favoriteTeamCode: genderValue ?? undefined,
              favoriteTeamCode: route?.params?.favoriteTeamLabel,
            },
          });
        },
        onError: (err) => {
          console.log("회원가입 완료 mutation 에러: ", err);
        },
      },
    );
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
    <View style={styles.root}>
      <AuthBackground />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.inner}>
                {/* 헤더 */}
                <View style={styles.headerRow}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                    activeOpacity={0.8}
                  >
                    <BackIcon />
                  </TouchableOpacity>

                  <View style={styles.stepWrapper}>
                    <SignupStepIndicator currentStep={3} />
                  </View>

                  <View style={styles.rightPlaceholder} />
                </View>

                {/* 성별 */}
                <View style={styles.textWrap}>
                  <AppText variant="displayTitle" style={styles.title}>
                    성별을 선택해주세요
                  </AppText>
                  <AppText variant="labelSmall" style={styles.optional}>
                    * 선택사항
                  </AppText>
                </View>

                <View style={styles.genderRow}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      gender === "F" && styles.genderSelected,
                    ]}
                    onPress={() => setGender("F")}
                    activeOpacity={0.85}
                  >
                    <AppText
                      variant="semi18"
                      style={[
                        styles.genderText,
                        gender === "F" && styles.genderTextSelected,
                      ]}
                    >
                      여성
                    </AppText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      gender === "M" && styles.genderSelected,
                    ]}
                    onPress={() => setGender("M")}
                    activeOpacity={0.85}
                  >
                    <AppText
                      variant="semi18"
                      style={[
                        styles.genderText,
                        gender === "M" && styles.genderTextSelected,
                      ]}
                    >
                      남성
                    </AppText>
                  </TouchableOpacity>
                </View>

                {/* 나이 */}
                <View style={styles.textWrap}>
                  <AppText variant="displayTitle" style={styles.title}>
                    나이를 입력해주세요
                  </AppText>
                  <AppText variant="labelSmall" style={styles.optional}>
                    * 선택사항
                  </AppText>
                </View>

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
                  <AppText variant="heading" className="text-[#111111]">
                    다음
                  </AppText>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.skipButton}
                activeOpacity={0.8}
                onPress={handleSkip}
              >
                <AppText variant="heading" className="text-[#FFFFFF]">
                  건너뛰기
                </AppText>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </View>
  );
};

export default SignupGenderAgeScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000000" },
  safeArea: { flex: 1, backgroundColor: "transparent" },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  textWrap: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  title: {
    fontFamily: "NotoSansKR_SemiBold",
    color: "#FFFFFF",
  },
  optional: {
    color: "rgba(255,255,255,0.6)",
    alignSelf: "flex-end",
    paddingBlock: 7,
  },

  /* Gender */
  genderRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    paddingHorizontal: 5,
    marginBottom: 50,
  },
  genderButton: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  genderText: {
    color: "rgba(255,255,255,0.6)",
  },

  genderSelected: {
    borderWidth: 1,
    borderColor: "#8BC45A",
    backgroundColor: "rgba(139, 196, 90, 0.15)",
  },
  genderTextSelected: {
    color: "#8BC45A",
  },

  /* Age */
  ageInputWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.5)",
    marginTop: 10,
    paddingHorizontal: 5,
  },
  ageInput: {
    color: "#FFFFFF",
    marginVertical: 12,
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
  skipButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#232323",
    justifyContent: "center",
    alignItems: "center",
  },
});
