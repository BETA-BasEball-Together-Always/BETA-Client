// src/features/auth/screens/SignupGenderAge/SignupGenderAgeScreen.jsx
import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import { useFocusEffect } from "@react-navigation/native";
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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AuthBackground from "../../components/AuthBackground";
import SignupProgressHeader from "../../components/SignupProgressHeader";
import { useSignupCompleteMutation } from "../../services/signupCompleteMutation";
import { useSignupStatusMutation } from "../../services/signupStatusMutation";
import { useStepBack } from "../../hooks/useStepBack";

import { AppText } from "../../../../shared/theme/components/AppText";
import { useUserStore } from "../../../../shared/store/userStore";
import api from "../../../../shared/libs/api";
import { useSignupDraftStore } from "../../stores/useSignupDraftStore";
import { useSignupDraftPersistHydrated } from "../../hooks/useSignupDraftPersistHydrated";
import { applySignupStatusToDraft } from "../../../../shared/auth/applySignupStatusToDraft";
import { navigateFromSignupStatus } from "../../../../shared/auth/navigateFromSignupStatus";

function SignupGenderAgeScreenBody({ navigation, route }) {
  const draftGender = useSignupDraftStore((s) => s.gender);
  const draftAge = useSignupDraftStore((s) => s.age);
  const setDraftGender = useSignupDraftStore((s) => s.setGender);
  const setDraftAge = useSignupDraftStore((s) => s.setAge);

  const [gender, setGender] = useState(draftGender ?? null); // "F" | "M" | null
  const [age, setAge] = useState(draftAge ?? "");
  const [signupData, setSignupData] = useState({});

  const handleBack = useStepBack("SignupFavoriteTeam");

  const restoreGenderAgeFromDraft = useCallback(() => {
    const d = useSignupDraftStore.getState();
    const draftG = d.gender ?? null;
    const draftAgeRaw =
      typeof d.age === "string" ? d.age : d.age != null ? String(d.age) : "";
    const draftAgeTrim = draftAgeRaw.trim();

    setGender((prev) => (draftG != null ? draftG : prev));
    setAge((prev) => {
      const prevStr = typeof prev === "string" ? prev : "";
      if (draftAgeTrim) return draftAgeRaw;
      return prevStr.trim() ? prevStr : "";
    });
  }, []);

  useLayoutEffect(() => {
    restoreGenderAgeFromDraft();
  }, [restoreGenderAgeFromDraft]);

  useFocusEffect(
    useCallback(() => {
      restoreGenderAgeFromDraft();
    }, [restoreGenderAgeFromDraft]),
  );

  useEffect(() => {
    restoreGenderAgeFromDraft();
  }, [draftGender, draftAge, restoreGenderAgeFromDraft]);

  const isNextEnabled = useMemo(() => {
    return !!age && Number(age) > 0;
  }, [age]);

  const signupCompleteMutation = useSignupCompleteMutation();
  const signupStatusMutation = useSignupStatusMutation();
  const isSubmitPending = signupCompleteMutation.isPending;
  const setUser = useUserStore((state) => state.setUser);
  const setTokens = useUserStore((state) => state.setTokens);
  const setDraftSignupStep = useSignupDraftStore((s) => s.setSignupStep);

  function isSignupStepMismatchError(error) {
    const raw = error?.response?.data;
    const code =
      raw?.code ?? raw?.errorCode ?? raw?.errCode ?? raw?.error?.code ?? null;
    if (code != null && String(code).trim().toUpperCase() === "USER008") {
      return true;
    }
    const message =
      typeof raw === "string"
        ? raw
        : typeof raw?.message === "string"
          ? raw.message
          : typeof error?.message === "string"
            ? error.message
            : "";
    return typeof message === "string" && message.includes("잘못된 회원가입 단계");
  }

  // 재진입 시 route.params.signup만 사용해 데이터 복구
  useEffect(() => {
    const routeSignup = route?.params?.signup ?? {};
    setSignupData(routeSignup);
  }, [route]);

  useEffect(() => {
    setDraftGender(gender);
  }, [gender, setDraftGender]);

  useEffect(() => {
    setDraftAge(age);
  }, [age, setDraftAge]);

  // 호출 시 signupData 포함하도록 수정
  const submitSignup = ({ genderValue, ageValue }) => {
    if (signupCompleteMutation.isPending) return;
    signupCompleteMutation.mutate(
      {
        ...(signupData || {}),
        gender: genderValue ?? undefined,
        age: typeof ageValue === "number" ? ageValue : undefined,
      },
      {
        onSuccess: async (data) => {
          const userDto = data?.user ?? data;
          navigation.navigate("SignupComplete", {
            signup: {
              ...(signupData || {}),
              favoriteTeamLabel:
                userDto?.favoriteTeamName ?? route?.params?.favoriteTeamLabel,
            },
          });

          if (data?.accessToken) {
            setTokens({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            });
            api.defaults.headers.Authorization = `Bearer ${data.accessToken}`;
          }

          // 백엔드에서 최종 UserDto를 내려준다고 가정하고 전역 상태에 저장
          if (userDto) {
            setUser(userDto);
          }
          setDraftSignupStep("COMPLETED");
        },
        onError: async (err) => {
          console.log("회원가입 완료 mutation 에러: ", err);
          if (!isSignupStepMismatchError(err)) {
            return;
          }
          try {
            const status = await signupStatusMutation.mutateAsync();
            applySignupStatusToDraft(status);
            navigateFromSignupStatus(status, navigation);
          } catch (e2) {
            console.warn("[signup/status] recovery failed", e2);
          }
        },
      },
    );
  };

  const handleNext = async () => {
    if (isSubmitPending) return;
    // 다음 버튼(나이 입력 완료) 눌렀을 때
    submitSignup({
      genderValue: gender, // 선택
      ageValue: age ? Number(age) : null, // 선택
    });
  };

  const handleSkip = async () => {
    if (isSubmitPending) return;
    // 건너뛰기 눌렀을 때 (성별/나이 둘 다 null로 처리)
    submitSignup({
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
                <SignupProgressHeader currentStep={3} onBack={handleBack} />

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
                  style={[
                    styles.nextButton,
                    isSubmitPending && styles.nextButtonDisabled,
                  ]}
                  activeOpacity={isSubmitPending ? 1 : 0.85}
                  disabled={isSubmitPending}
                  onPress={handleNext}
                >
                  <AppText variant="heading" className="text-[#111111]">
                    {isSubmitPending ? "처리 중..." : "다음"}
                  </AppText>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.skipButton,
                  isSubmitPending && styles.skipButtonDisabled,
                ]}
                activeOpacity={isSubmitPending ? 1 : 0.8}
                disabled={isSubmitPending}
                onPress={handleSkip}
              >
                <AppText variant="heading" className="text-[#FFFFFF]">
                  {isSubmitPending ? "처리 중..." : "건너뛰기"}
                </AppText>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </View>
  );
}

export default function SignupGenderAgeScreen(props) {
  const draftHydrated = useSignupDraftPersistHydrated();
  if (!draftHydrated) {
    return (
      <View style={styles.root}>
        <AuthBackground />
        <SafeAreaView
          style={[styles.safeArea, styles.loadingFill]}
          edges={["top", "left", "right"]}
        >
          <ActivityIndicator color="#FFFFFF" size="large" />
        </SafeAreaView>
      </View>
    );
  }
  return <SignupGenderAgeScreenBody {...props} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000000" },
  safeArea: { flex: 1, backgroundColor: "transparent" },
  loadingFill: {
    justifyContent: "center",
    alignItems: "center",
  },
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
  // header styles moved to SignupProgressHeader

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
    lineHeight: 32.7,
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
  nextButtonDisabled: {
    opacity: 0.65,
  },
  skipButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#232323",
    justifyContent: "center",
    alignItems: "center",
  },
  skipButtonDisabled: {
    opacity: 0.65,
  },
});
