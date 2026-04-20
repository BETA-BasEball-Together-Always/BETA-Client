// src/features/auth/screens/SignupCredentials/SocialSignupScreen.jsx
import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../../../../shared/theme/components/AppText";

import AuthBackground from "../../components/AuthBackground";
import SignupCheckedInput from "../../components/SignupCheckedInput";
import SignupProgressHeader from "../../components/SignupProgressHeader";
import { useCheckedField } from "../../hooks/useCheckedField";
import { useSignupDraftPersistHydrated } from "../../hooks/useSignupDraftPersistHydrated";
import { checkNicknameDuplicateRequest } from "../../services/nicknameCheckMutation";
import { useSignupProfileMutation } from "../../services/signupProfileMutation";
import {
  fetchSignupStatus,
  SIGNUP_STATUS_QUERY_KEY,
  useSignupStatusMutation,
} from "../../services/signupStatusMutation";
import { useStepBack } from "../../hooks/useStepBack";
import { navigateFromSignupStatus } from "../../../../shared/auth/navigateFromSignupStatus";
import { applySignupStatusToDraft } from "../../../../shared/auth/applySignupStatusToDraft";
import { useSignupDraftStore } from "../../stores/useSignupDraftStore";

function normalizeSignupParams(signup) {
  if (signup == null || typeof signup !== "object" || Array.isArray(signup)) {
    return {};
  }
  return signup;
}

/** route.params.signup.email 이 비어 있으면 draft /서버 status로 채움 */
function emailStringFromSignup(signup) {
  const s = normalizeSignupParams(signup);
  const e = s?.email;
  return typeof e === "string" && e.trim().length > 0 ? e.trim() : "";
}

function normalizeSignupStepFromStatus(status) {
  const raw = status?.signupStep ?? status?.signup_step;
  return typeof raw === "string" ? raw.trim() : "";
}

/**
 * 포커스 직후 / 서버 동기화 전: 닉네임 필드 복원 규칙
 * 1 복원할 draft 닉네임이 있으면: setValue / setTouched 등으로 덮어쓰기
 * 2 복원할 값 없고, 현재 필드 입력도 없으면: 빈 값으로 초기화
 * 3 복원할 값 없고, 현재 필드에 입력만 있는 경우: 아무 것도 하지 않음(인메모리 입력 유지)
 */
function syncSignupDraftToNicknameFieldRespectingLocalInput(fieldRef) {
  const f = fieldRef.current;
  if (!f) return;
  const d = useSignupDraftStore.getState();
  const beforeTrim = String(f.value ?? "").trim();
  const draftNick = String(d.nickname ?? "").trim();
  if (draftNick) {
    f.setValue(d.nickname ?? "");
    f.setTouched(!!(d.nickname ?? "").trim());
    f.setError("");
    f.setIsAvailable(!!d.nicknameChecked);
  } else if (!beforeTrim) {
    f.setValue("");
    f.setTouched(false);
    f.setError("");
    f.setIsAvailable(false);
  }
}

function signupFlowErrorMessage(e, fallback) {
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
  return msg ?? fallback;
}

/** draft persist rehydrate 이후에만 mount — 닉네임 필드 초기값이 스토어와 일치 */
function SocialSignupHydratedBody({ navigation, route, handleBack }) {
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const signup = normalizeSignupParams(route?.params?.signup);
  const draftEmail = useSignupDraftStore((s) => s.email);
  const draftEmailTrim =
    typeof draftEmail === "string" ? draftEmail.trim() : "";
  const paramEmailTrim = emailStringFromSignup(signup);
  /** 빈 문자열("") params.email 은 nullish가 아니라서 ?? 만 쓰면 draft를 덮어쓰지 못함! || 사용 */
  const readonlyEmail = paramEmailTrim || draftEmailTrim;

  const draftNickname = useSignupDraftStore((s) => s.nickname);
  const draftNicknameChecked = useSignupDraftStore((s) => s.nicknameChecked);
  const setDraftEmail = useSignupDraftStore((s) => s.setEmail);
  const setDraftNickname = useSignupDraftStore((s) => s.setNickname);
  const setDraftNicknameChecked = useSignupDraftStore(
    (s) => s.setNicknameChecked,
  );

  const queryClient = useQueryClient();
  const signupProfileMutation = useSignupProfileMutation();
  const signupStatusMutation = useSignupStatusMutation();

  const nicknameRegex = /^[가-힣a-zA-Z0-9]+$/;

  const validateNickname = useCallback((value) => {
    if (!value) return "닉네임을 입력해주세요.";

    const trimmed = value.trim();

    if (trimmed.length < 2 || trimmed.length > 13) {
      return "닉네임은 2~13자 이내로 입력해주세요.";
    }

    if (!nicknameRegex.test(trimmed)) {
      return "한글, 영문, 숫자만 사용할 수 있어요.";
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

  useEffect(() => {
    const f = nicknameFieldRef.current;
    if (!f) return;
    const draftNick = String(draftNickname ?? "").trim();
    if (!draftNick) return;
    if (String(f.value ?? "").trim() === draftNick) return;
    f.setValue(draftNickname ?? "");
    f.setTouched(true);
    f.setError("");
    f.setIsAvailable(!!draftNicknameChecked);
  }, [draftNickname, draftNicknameChecked]);

  /** 뒤로가기/재진입: draft 즉시 복원 후 서버 signup/status 동기화 */
  useFocusEffect(
    useCallback(() => {
      syncSignupDraftToNicknameFieldRespectingLocalInput(nicknameFieldRef);
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
          const draftNick = String(d.nickname ?? "").trim();
          /* 서버 반영 후에도 1/2/3 동일: draft 있을 때만 덮어쓰기, 둘 다 비었을 때만 클리어, draft 없고 입력만 있으면 유지 */
          if (draftNick) {
            f.setValue(d.nickname ?? "");
            f.setTouched(!!(d.nickname ?? "").trim());
          } else if (!beforeTrim) {
            f.setValue("");
            f.setTouched(false);
          }
          const nickAligned =
            draftNick !== "" &&
            draftNick === beforeTrim &&
            beforeAvailable &&
            !d.nicknameChecked;
          if (nickAligned) {
            setDraftNicknameChecked(true);
          } else if (draftNick || !beforeTrim) {
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
    const next = nicknameField.value;
    if (useSignupDraftStore.getState().nickname !== next) {
      setDraftNickname(next);
    }
  }, [nicknameField.value, setDraftNickname]);

  const isFormValid = useMemo(() => {
    return (
      !!nicknameField.value && !nicknameField.error && nicknameField.isAvailable
    );
  }, [nicknameField.value, nicknameField.error, nicknameField.isAvailable]);

  const [nextActionBusy, setNextActionBusy] = useState(false);
  const isNextBusy = nextActionBusy;

  const handleNext = async () => {
    if (!isFormValid) return;
    if (nextActionBusy) return;

    const nickname = nicknameField.value.trim();
    setNextActionBusy(true);

    try {
      const snap = useSignupDraftStore.getState();
      const skipStatusPrecheck =
        snap.nicknameChecked && String(snap.nickname ?? "").trim() === nickname;

      let status;
      if (skipStatusPrecheck) {
        status = {
          signupStep: "CONSENT_AGREED",
          email: readonlyEmail || snap.email || undefined,
        };
      } else {
        try {
          status = await signupStatusMutation.mutateAsync();
        } catch (e) {
          console.warn("[signup/status]", e);
          Alert.alert(
            "안내",
            signupFlowErrorMessage(
              e,
              "회원가입 상태를 확인하지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.",
            ),
          );
          return;
        }
      }

      const step = normalizeSignupStepFromStatus(status);

      if (!step) {
        Alert.alert(
          "안내",
          "회원가입 단계 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
        );
        return;
      }

      if (step !== "CONSENT_AGREED") {
        navigateFromSignupStatus(status, navigation);
        return;
      }

      const emailFromStatus =
        typeof status?.email === "string" ? status.email.trim() : "";
      const emailForNav = emailFromStatus || readonlyEmail;

      await signupProfileMutation.mutateAsync({ nickname });
      setDraftNickname(nickname);
      setDraftNicknameChecked(true);
      navigation.navigate("SignupFavoriteTeam", {
        signup: {
          ...signup,
          email: emailForNav,
          nickname,
        },
      });
      queryClient
        .prefetchQuery({
          queryKey: SIGNUP_STATUS_QUERY_KEY,
          queryFn: fetchSignupStatus,
          staleTime: 10 * 60 * 1000,
        })
        .catch((e) => {
          console.warn("[signup] prefetch signup status for team screen", e);
        });
    } catch (e) {
      console.warn("[signup/profile]", e);
      let msg = signupFlowErrorMessage(
        e,
        "프로필 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
      const combined = String(msg);
      if (/CONSENT_AGREED|PROFILE_COMPLETED|회원가입 단계/i.test(combined)) {
        try {
          const s = await signupStatusMutation.mutateAsync();
          const st = normalizeSignupStepFromStatus(s);
          if (st && st !== "CONSENT_AGREED") {
            navigateFromSignupStatus(s, navigation);
            return;
          }
        } catch {
          /* ignore */
        }
      }
      Alert.alert("안내", msg);
    } finally {
      if (mountedRef.current) {
        setNextActionBusy(false);
      }
    }
  };

  return (
    <>
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

      <View style={styles.bottomButtonArea}>
        <TouchableOpacity
          style={[styles.nextButton, !isFormValid && styles.nextButtonDisabled]}
          activeOpacity={isFormValid && !isNextBusy ? 0.8 : 1}
          onPress={handleNext}
          disabled={!isFormValid || isNextBusy}
        >
          <AppText variant="heading" style={styles.nextButtonText}>
            {isNextBusy ? "처리 중..." : "다음"}
          </AppText>
        </TouchableOpacity>
      </View>
    </>
  );
}

const SocialSignupScreen = ({ navigation, route }) => {
  const draftHydrated = useSignupDraftPersistHydrated();
  const handleBack = useStepBack("TermsDetail");

  if (!draftHydrated) {
    return (
      <View style={styles.root}>
        <AuthBackground />
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          <ActivityIndicator
            color="#FFFFFF"
            size="large"
            style={{ flex: 1, justifyContent: "center", alignSelf: "center" }}
          />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <AuthBackground />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <SocialSignupHydratedBody
          navigation={navigation}
          route={route}
          handleBack={handleBack}
        />
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
