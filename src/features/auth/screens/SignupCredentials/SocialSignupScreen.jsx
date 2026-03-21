// src/features/auth/screens/SignupCredentials/SocialSignupScreen.jsx
import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../../../../shared/theme/components/AppText";

import AuthBackground from "../../components/AuthBackground";
import SignupCheckedInput from "../../components/SignupCheckedInput";
import SignupStepIndicator from "../../components/SignupStepIndicator";
import { useCheckedField } from "../../hooks/useCheckedField";
import { useNicknameCheckMutation } from "../../services/nicknameCheckMutation";
import { useSignupProfileMutation } from "../../services/signupProfileMutation";
import { useSignupStatusMutation } from "../../services/signupStatusMutation";
import { useStepBack } from "../../hooks/useStepBack";
import { navigateFromSignupStatus } from "../../../../shared/auth/navigateFromSignupStatus";

import BackIcon from "../../../../shared/assets/svg/chevrons/back.svg";

const { height } = Dimensions.get("window");

const SocialSignupScreen = ({ navigation, route }) => {
  const signup = route?.params?.signup ?? {};
  const readonlyEmail = signup.email ?? "";

  const { mutateAsync: checkNicknameDuplicate } = useNicknameCheckMutation();
  const signupProfileMutation = useSignupProfileMutation();
  const signupStatusMutation = useSignupStatusMutation();
  const handleBack = useStepBack("TermsDetail");

  const nicknameRegex = /^[가-힣a-zA-Z0-9]+$/;

  const validateNickname = (value) => {
    if (!value) return "닉네임을 입력해주세요.";

    const trimmed = value.trim();

    if (trimmed.length < 2 || trimmed.length > 13) {
      return "닉네임은 2~13자 이내로 입력해주세요.";
    }

    if (!nicknameRegex.test(trimmed)) {
      return "한글, 영문, 숫자만 사용할 수 있어요.";
    }

    return "";
  };

  const nicknameField = useCheckedField({
    validate: validateNickname,
    checkAvailability: async (trimmedNickname) => {
      const isDuplicate = await checkNicknameDuplicate(trimmedNickname);
      return !isDuplicate;
    },
  });

  const isFormValid = useMemo(() => {
    return (
      !!nicknameField.value && !nicknameField.error && nicknameField.isAvailable
    );
  }, [nicknameField.value, nicknameField.error, nicknameField.isAvailable]);

  const handleNext = async () => {
    if (!isFormValid) return;

    try {
      const status = await signupStatusMutation.mutateAsync();
      if (status?.signupStep && status.signupStep !== "CONSENT_AGREED") {
        navigateFromSignupStatus(status, navigation);
        return;
      }
    } catch (e) {
      console.warn("[signup/status]", e);
    }

    const nickname = nicknameField.value.trim();

    signupProfileMutation.mutate(
      { nickname },
      {
        onSuccess: (data) => {
          const teamList = data?.teamList ?? [];
          navigation.replace("SignupFavoriteTeam", {
            signup: {
              ...signup,
              email: readonlyEmail,
              nickname,
            },
            teamList,
          });
        },
      },
    );
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
                {/* 헤더 (뒤로가기 + 스텝 인디케이터) */}
                <View style={styles.headerRow}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                    activeOpacity={0.8}
                  >
                    <BackIcon />
                  </TouchableOpacity>

                  <View style={styles.stepWrapper}>
                    <SignupStepIndicator currentStep={1} />
                  </View>

                  <View style={styles.rightPlaceholder} />
                </View>

                {/* 이메일 (읽기 전용) */}
                <View style={styles.section}>
                  <AppText variant="displayTitle" style={styles.sectionTitle}>
                    회원가입 이메일
                  </AppText>
                  <AppText
                    variant="smallRegular"
                    style={styles.sectionDescription}
                  >
                    * 계정 안내 및 개인정보 처리방침 변경 시 안내를 위해
                    사용됩니다.
                  </AppText>

                  <View style={styles.readonlyEmailBox}>
                    <AppText variant="middle" style={styles.readonlyEmailText}>
                      {readonlyEmail || "-"}
                    </AppText>
                  </View>
                </View>

                {/* 닉네임 입력 */}
                <View style={[styles.section, { marginTop: 32 }]}>
                  <AppText variant="displayTitle" style={styles.sectionTitle}>
                    닉네임을 입력해주세요
                  </AppText>

                  <View style={styles.nicknameInputWrapper}>
                    <SignupCheckedInput
                      label={null}
                      placeholder="닉네임을 입력해주세요."
                      maxLength={13}
                      field={nicknameField}
                      buttonLabel="중복확인"
                    />
                    <AppText variant="labelSmall" style={styles.lengthText}>
                      {nicknameField.value.length}/13
                    </AppText>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
        {/* 하단 버튼 */}
        <View style={styles.bottomButtonArea}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              !isFormValid && styles.nextButtonDisabled,
            ]}
            activeOpacity={isFormValid ? 0.8 : 1}
            onPress={handleNext}
            disabled={!isFormValid}
          >
            <AppText variant="heading" style={styles.nextButtonText}>
              다음
            </AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default SocialSignupScreen;

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
    flexGrow: 1,
    width: "100%",
    maxWidth: 390,
    alignSelf: "center",
  },
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
  stepWrapper: {
    alignItems: "center",
    width: 180,
  },
  rightPlaceholder: {
    width: 32,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#FFFFFF",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 12,
  },
  readonlyEmailBox: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(206, 206, 206, 0.34)",
    paddingHorizontal: 14,
    paddingVertical: 18,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  readonlyEmailText: {
    color: "rgba(255,255,255,0.6)",
  },
  nicknameInputWrapper: {
    marginTop: 8,
  },
  lengthText: {
    color: "#FFFFFF",
    textAlign: "right",
    marginTop: -9,
  },
  bottomButtonArea: {
    position: "absolute",
    bottom: 60,
    right: 0,
    left: 0,
  },
  nextButton: {
    borderRadius: 10,
    backgroundColor: "#F9F9F9",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    marginHorizontal: 20.8,
  },
  nextButtonDisabled: {
    backgroundColor: "#232323",
  },
  nextButtonText: {
    color: "#3E3E3E",
  },
});
