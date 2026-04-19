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
import { useFocusEffect } from "@react-navigation/native";
import { checkNicknameDuplicateRequest } from "../../services/nicknameCheckMutation";
import { AppText } from "../../../../shared/theme/components/AppText";
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

function normalizeSignupParams(signup) {
  if (signup == null || typeof signup !== "object" || Array.isArray(signup)) {
    return {};
  }
  return signup;
}

function emailStringFromSignup(signup) {
  const s = normalizeSignupParams(signup);
  const e = s?.email;
  return typeof e === "string" && e.trim().length > 0 ? e.trim() : "";
}

/**
 * persist rehydrate 완료 후에만 mount — useCheckedField 초기값이 복원된 draft와 일치
 */
function SignupNicknameHydratedBody({ navigation, route, handleBack }) {
  const routeParams = route?.params ?? {};

  const mountedRef = useRef(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const signup = normalizeSignupParams(routeParams?.signup);
  const draftEmail = useSignupDraftStore((s) => s.email);
  const draftEmailTrim =
    typeof draftEmail === "string" ? draftEmail.trim() : "";
  const paramEmailTrim = emailStringFromSignup(signup);
  const readonlyEmail = paramEmailTrim || draftEmailTrim;

  const draftNickname = useSignupDraftStore((s) => s.nickname);
  const draftNicknameChecked = useSignupDraftStore((s) => s.nicknameChecked);
  const setDraftNickname = useSignupDraftStore((s) => s.setNickname);
  const setDraftNicknameChecked = useSignupDraftStore(
    (s) => s.setNicknameChecked,
  );
  const hydrateDraftNickname = useSignupDraftStore((s) => s.hydrateNickname);
  const setDraftEmail = useSignupDraftStore((s) => s.setEmail);

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
      const isDuplicate = await checkNicknameDuplicateRequest(trimmedNickname);
      const available = !isDuplicate;
      setDraftNicknameChecked(available);
      return available;
    },
  });

  const nicknameFieldRef = useRef(nicknameField);
  nicknameFieldRef.current = nicknameField;

  useFocusEffect(
    useCallback(() => {
      const d = useSignupDraftStore.getState();
      const rawSignup = routeParams?.signup;
      const signupObj =
        rawSignup != null && typeof rawSignup === "object" && !Array.isArray(rawSignup)
          ? rawSignup
          : {};

      const paramEmail =
        typeof signupObj.email === "string" ? signupObj.email.trim() : "";
      if (paramEmail) {
        d.setEmail(paramEmail);
      }

      const paramNick =
        typeof signupObj.nickname === "string" ? signupObj.nickname.trim() : "";
      const draftNick = String(d.nickname ?? "").trim();
      const restored = draftNick || paramNick;

      const verified =
        !!restored &&
        ((draftNick === restored && !!d.nicknameChecked) ||
          (!!paramNick && restored === paramNick && !draftNick));

      const f = nicknameFieldRef.current;
      if (!restored) {
        const current = String(f.value ?? "").trim();
        if (current) {
          return;
        }
        f.setValue("");
        f.setTouched(false);
        f.setError("");
        f.setIsAvailable(false);
        return;
      }

      hydrateDraftNickname(restored, !!verified);

      const dAfter = useSignupDraftStore.getState();
      f.setValue(restored);
      f.setTouched(!!restored);
      f.setError("");
      f.setIsAvailable(!!restored && !!dAfter.nicknameChecked);
    }, [routeParams, hydrateDraftNickname]),
  );

  useEffect(() => {
    if (readonlyEmail) setDraftEmail(readonlyEmail);
  }, [readonlyEmail, setDraftEmail]);

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

      const rawSignup = routeParams?.signup;
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

          <View style={styles.section}>
            <AppText variant="displayTitle" style={styles.sectionTitle}>
              회원가입 이메일
            </AppText>
            <AppText variant="smallRegular" style={styles.sectionDescription}>
              * 계정 안내 및 개인정보 처리방침 변경 시 안내를 위해 사용됩니다.
            </AppText>
            <View style={styles.readonlyEmailBox}>
              <AppText variant="middle" style={styles.readonlyEmailText}>
                {readonlyEmail || "-"}
              </AppText>
            </View>
          </View>

          <View style={[styles.section, { marginTop: 24 }]}>
            <Text style={styles.title}>닉네임을 입력해주세요</Text>
          </View>

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
  const draftEmailShell = useSignupDraftStore((s) => s.email);
  const signupFromRoute = normalizeSignupParams(route?.params?.signup);
  const paramShell = emailStringFromSignup(signupFromRoute);
  const draftShellTrim =
    typeof draftEmailShell === "string" ? draftEmailShell.trim() : "";
  const shellEmail = paramShell || draftShellTrim;

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
                        {shellEmail || "-"}
                      </AppText>
                    </View>
                  </View>

                  <View style={[styles.section, { marginTop: 24 }]}>
                    <Text style={styles.title}>닉네임을 입력해주세요</Text>
                  </View>

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
  section: {
    marginBottom: 8,
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
