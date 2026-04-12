// src/features/auth/screens/SignupCredentials/SocialSignupScreen.jsx
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../../../../shared/theme/components/AppText";

import AuthBackground from "../../components/AuthBackground";
import SignupCheckedInput from "../../components/SignupCheckedInput";
import SignupProgressHeader from "../../components/SignupProgressHeader";
import { useCheckedField } from "../../hooks/useCheckedField";
import { useNicknameCheckMutation } from "../../services/nicknameCheckMutation";
import { useSignupProfileMutation } from "../../services/signupProfileMutation";
import { useSignupStatusMutation } from "../../services/signupStatusMutation";
import { useStepBack } from "../../hooks/useStepBack";
import { navigateFromSignupStatus } from "../../../../shared/auth/navigateFromSignupStatus";
import { applySignupStatusToDraft } from "../../../../shared/auth/applySignupStatusToDraft";
import { useSignupDraftStore } from "../../stores/useSignupDraftStore";

const { height } = Dimensions.get("window");

const SocialSignupScreen = ({ navigation, route }) => {
  const signup = route?.params?.signup ?? {};
  const draftEmail = useSignupDraftStore((s) => s.email);
  const readonlyEmail = signup.email ?? draftEmail ?? "";

  const draftNickname = useSignupDraftStore((s) => s.nickname);
  const draftNicknameChecked = useSignupDraftStore((s) => s.nicknameChecked);
  const setDraftEmail = useSignupDraftStore((s) => s.setEmail);
  const setDraftNickname = useSignupDraftStore((s) => s.setNickname);
  const setDraftNicknameChecked = useSignupDraftStore(
    (s) => s.setNicknameChecked,
  );

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
    initialValue: draftNickname ?? "",
    initialTouched: !!(draftNickname ?? ""),
    initialIsAvailable: !!draftNicknameChecked,
    validate: validateNickname,
    checkAvailability: async (trimmedNickname) => {
      const isDuplicate = await checkNicknameDuplicate(trimmedNickname);
      const available = !isDuplicate;
      setDraftNicknameChecked(available);
      return available;
    },
  });

  const nicknameFieldRef = useRef(nicknameField);
  nicknameFieldRef.current = nicknameField;

  /** 뒤로가기/재진입: 이메일/닉네임 draft + 서버 signup/status 동기화 */
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const status = await signupStatusMutation.mutateAsync();
          if (cancelled) return;
          applySignupStatusToDraft(status);
          const d = useSignupDraftStore.getState();
          const f = nicknameFieldRef.current;
          const beforeTrim = String(f.value ?? "").trim();
          const beforeAvailable = f.isAvailable;
          f.setValue(d.nickname ?? "");
          f.setTouched(!!(d.nickname ?? "").trim());
          const draftNick = String(d.nickname ?? "").trim();
          const nickAligned =
            draftNick !== "" &&
            draftNick === beforeTrim &&
            beforeAvailable &&
            !d.nicknameChecked;
          if (nickAligned) {
            setDraftNicknameChecked(true);
          } else {
            f.setIsAvailable(!!d.nicknameChecked);
          }
        } catch {
          /* 오프라인 등 */
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [signupStatusMutation, setDraftNicknameChecked]),
  );

  useEffect(() => {
    if (readonlyEmail) setDraftEmail(readonlyEmail);
  }, [readonlyEmail, setDraftEmail]);

  useEffect(() => {
    // 입력 변경 시 draft에 저장 (닉네임 문자열이 바뀔 때만 setNickname이 중복확인 플래그 초기화)
    setDraftNickname(nicknameField.value);
  }, [nicknameField.value, setDraftNickname]);

  const isFormValid = useMemo(() => {
    return (
      !!nicknameField.value && !nicknameField.error && nicknameField.isAvailable
    );
  }, [nicknameField.value, nicknameField.error, nicknameField.isAvailable]);

  const isNextBusy = signupProfileMutation.isPending;

  const handleNext = async () => {
    if (!isFormValid) return;
    if (signupProfileMutation.isPending) return;

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
          setDraftNickname(nickname);
          setDraftNicknameChecked(true);
          navigation.navigate("SignupFavoriteTeam", {
            signup: {
              ...signup,
              email: readonlyEmail,
              nickname,
            },
            teamList,
          });
        },
        onError: (e) => {
          const raw = e?.response?.data;
          let msg =
            typeof raw === "string"
              ? raw
              : typeof raw?.message === "string"
                ? raw.message
                : null;
          if (!msg && e?.message === "NO_ACCESS_TOKEN") {
            msg = "로그인 정보가 없습니다. 다시 로그인해 주세요.";
          }
          if (!msg) {
            msg = "프로필 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.";
          }
          Alert.alert("안내", msg);
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
                <SignupProgressHeader currentStep={1} onBack={handleBack} />

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
                      placeholderTextColor="#E4E4E4"
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
            activeOpacity={
              isFormValid && !isNextBusy ? 0.8 : 1
            }
            onPress={handleNext}
            disabled={!isFormValid || isNextBusy}
          >
            <AppText variant="heading" style={styles.nextButtonText}>
              {isNextBusy ? "처리 중..." : "다음"}
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
  // header styles moved to SignupProgressHeader
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#FFFFFF",
    lineHeight: 32.7,
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
