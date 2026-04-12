// src/features/auth/screens/SignupNickname/SignupNicknameScreen.jsx
import React, {
  useMemo,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";

import AuthBackground from "../../components/AuthBackground";
import SignupCheckedInput from "../../components/SignupCheckedInput";
import SignupProgressHeader from "../../components/SignupProgressHeader";
import { useCheckedField } from "../../hooks/useCheckedField";
import { useSignupDraftPersistHydrated } from "../../hooks/useSignupDraftPersistHydrated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNicknameCheckMutation } from "../../services/nicknameCheckMutation";
import { useStepBack } from "../../hooks/useStepBack";
import { useSignupDraftStore } from "../../stores/useSignupDraftStore";

const { height } = Dimensions.get("window");

function signupNicknameCheckErrorMessage(error) {
  if (error?.message === "NO_ACCESS_TOKEN") {
    return "로그인 정보가 없습니다. 다시 로그인해 주세요.";
  }
  if (error?.message === "INVALID_NICKNAME_CHECK_RESPONSE") {
    return "서버 응답을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
  }
  const raw = error?.response?.data;
  if (typeof raw === "string") return raw;
  if (typeof raw?.message === "string") return raw.message;
  return "닉네임 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.";
}

const FROZEN_EMPTY_CHECKED_FIELD = {
  value: "",
  error: "",
  touched: false,
  isAvailable: false,
  isChecking: false,
  status: "idle",
  handleChange: () => {},
  handleBlur: () => {},
  handleCheck: async () => {},
};

/**
 * persist rehydrate 완료 후에만 mount — useCheckedField 초기값이 복원된 draft와 일치
 */
function SignupNicknameHydratedBody({ navigation, route, handleBack }) {
  const { mutateAsync: checkNicknameDuplicate } = useNicknameCheckMutation();
  const mountedRef = useRef(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const draftNickname = useSignupDraftStore((s) => s.nickname);
  const draftNicknameChecked = useSignupDraftStore((s) => s.nicknameChecked);
  const setDraftNickname = useSignupDraftStore((s) => s.setNickname);
  const setDraftNicknameChecked = useSignupDraftStore(
    (s) => s.setNicknameChecked,
  );

  const nicknameRegex = /^[가-힣a-zA-Z0-9._]+$/;

  const validateNickname = useCallback((value) => {
    if (!value) return "닉네임을 입력해주세요.";

    const trimmed = value.trim();

    if (trimmed.length < 1 || trimmed.length > 13) {
      return "닉네임은 1~13자 이내로 입력해주세요.";
    }

    if (!nicknameRegex.test(trimmed)) {
      return "한글, 영문, 숫자, _, . 만 사용할 수 있어요.";
    }

    return "";
  }, []);

  const nicknameField = useCheckedField({
    initialValue: draftNickname ?? "",
    initialTouched: !!(draftNickname ?? "").trim(),
    initialIsAvailable: !!draftNicknameChecked,
    validate: validateNickname,
    checkAvailability: async (trimmedNickname) => {
      const isDuplicate = await checkNicknameDuplicate(trimmedNickname);
      const available = !isDuplicate;
      setDraftNicknameChecked(available);
      return available;
    },
  });

  useEffect(() => {
    const next = nicknameField.value;
    if (useSignupDraftStore.getState().nickname !== next) {
      setDraftNickname(next);
    }
  }, [nicknameField.value, setDraftNickname]);

  const isNextEnabled = useMemo(() => {
    return (
      !!nicknameField.value && !nicknameField.error && nicknameField.isAvailable
    );
  }, [nicknameField.value, nicknameField.error, nicknameField.isAvailable]);

  const canPressNext =
    isNextEnabled && !isSubmitting && !nicknameField.isChecking;

  const handleNext = async () => {
    if (!canPressNext) return;

    const nickname = nicknameField.value.trim();
    const draftSnap = useSignupDraftStore.getState();
    if (
      !draftSnap.nicknameChecked ||
      String(draftSnap.nickname ?? "").trim() !== nickname
    ) {
      Alert.alert("안내", "닉네임 중복확인을 완료해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      setDraftNickname(nickname);
      setDraftNicknameChecked(true);

      const rawSignup = route?.params?.signup;
      const baseSignup =
        rawSignup != null &&
        typeof rawSignup === "object" &&
        !Array.isArray(rawSignup)
          ? { ...rawSignup }
          : {};
      const safeEmail =
        typeof baseSignup.email === "string" ? baseSignup.email.trim() : "";

      navigation.navigate("SignupFavoriteTeam", {
        signup: {
          ...baseSignup,
          email: safeEmail,
          nickname,
        },
      });
    } catch (e) {
      if (!mountedRef.current) return;
      Alert.alert("안내", signupNicknameCheckErrorMessage(e));
    } finally {
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          <SignupProgressHeader currentStep={1} onBack={handleBack} />

          <Text style={styles.title}>닉네임을 입력해주세요</Text>

          <View style={styles.formWrapper}>
            <SignupCheckedInput
              label={null}
              placeholder="닉네임을 입력해주세요."
              maxLength={13}
              field={nicknameField}
              buttonLabel="중복확인"
            />

            <Text style={styles.lengthText}>
              {nicknameField.value.length}/13
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.floatingBottomArea}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !canPressNext && styles.nextButtonDisabled,
          ]}
          activeOpacity={canPressNext ? 0.8 : 1}
          onPress={handleNext}
          disabled={!canPressNext}
        >
          <Text
            style={[
              styles.nextButtonText,
              !canPressNext && styles.nextButtonTextDisabled,
            ]}
          >
            {isSubmitting ? "처리 중..." : "다음"}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const SignupNicknameScreen = ({ navigation, route }) => {
  const draftHydrated = useSignupDraftPersistHydrated();
  const handleBack = useStepBack("Login");

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <AuthBackground />

          {!draftHydrated ? (
            <>
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.inner}>
                  <SignupProgressHeader currentStep={1} onBack={handleBack} />

                  <Text style={styles.title}>닉네임을 입력해주세요</Text>

                  <View style={styles.formWrapper}>
                    <SignupCheckedInput
                      label={null}
                      placeholder="닉네임을 입력해주세요."
                      maxLength={13}
                      field={FROZEN_EMPTY_CHECKED_FIELD}
                      buttonLabel="중복확인"
                      editable={false}
                    />
                    <Text style={styles.lengthText}>0/13</Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.floatingBottomArea}>
                <TouchableOpacity
                  style={[styles.nextButton, styles.nextButtonDisabled]}
                  activeOpacity={1}
                  disabled
                >
                  <Text
                    style={[
                      styles.nextButtonText,
                      styles.nextButtonTextDisabled,
                    ]}
                  >
                    다음
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <SignupNicknameHydratedBody
              navigation={navigation}
              route={route}
              handleBack={handleBack}
            />
          )}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default SignupNicknameScreen;

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
    paddingTop: height * 0.01,
    paddingBottom: height * 0.2,
    paddingHorizontal: 20,
  },
  inner: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 390,
    alignSelf: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 32.7,
    marginBottom: 24,
  },
  formWrapper: {
    marginTop: 4,
  },
  lengthText: {
    fontSize: 11,
    color: "#FFFFFF",
    textAlign: "right",
  },
  floatingBottomArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "transparent",
  },
  nextButton: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },
  nextButtonTextDisabled: {
    color: "rgba(255,255,255,0.45)",
  },
});
