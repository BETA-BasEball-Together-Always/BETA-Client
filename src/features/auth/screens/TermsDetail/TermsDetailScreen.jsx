// src/features/auth/screens/TermsDetail/TermsDetailScreen.jsx
import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import AuthBackground from "../../components/AuthBackground";
import TermsAgreementCard from "../../components/TermsAgreementCard";
import { AppText } from "../../../../shared/theme/components/AppText";
import { useSignupConsentMutation } from "../../services/signupConsentMutation";
import { useSignupStatusMutation } from "../../services/signupStatusMutation";
import { useStepBack } from "../../hooks/useStepBack";
import { useSignupDraftStore } from "../../stores/useSignupDraftStore";
import { applySignupStatusToDraft } from "../../../../shared/auth/applySignupStatusToDraft";
import { navigateFromSignupStatus } from "../../../../shared/auth/navigateFromSignupStatus";

const TermsDetailScreen = ({ navigation }) => {
  const draftTerms = useSignupDraftStore((s) => s.terms);
  const setDraftTerms = useSignupDraftStore((s) => s.setTerms);
  const setDraftEmail = useSignupDraftStore((s) => s.setEmail);
  const setDraftSignupStep = useSignupDraftStore((s) => s.setSignupStep);

  const [nextActionBusy, setNextActionBusy] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const [terms, setTerms] = useState({
    all: false,
    over14: false,
    tos: false,
    privacyRequired: false,
    privacyMarketing: false,
  });

  useEffect(() => {
    if (draftTerms) {
      setTerms(draftTerms);
    }
  }, [draftTerms]);

  const signupConsentMutation = useSignupConsentMutation();
  const signupStatusMutation = useSignupStatusMutation();

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

  const handleChangeTerms = useCallback(
    (next) => {
      setTerms(next);
      setDraftTerms(next);
    },
    [setDraftTerms],
  );

  const isRequiredAgreed = useMemo(
    () => terms.over14 && terms.tos && terms.privacyRequired,
    [terms],
  );

  const canPressNext = isRequiredAgreed && !nextActionBusy;

  const handlePressDetail = useCallback(
    (key) => {
      if (!key) return;

      switch (key) {
        case "tos":
          navigation.navigate("TermsTosDetail");
          return;
        case "privacyRequired":
          navigation.navigate("TermsPrivacyRequiredDetail");
          return;
        case "privacyMarketing":
          navigation.navigate("TermsPrivacyMarketingDetail");
          return;
        default:
          return;
      }
    },
    [navigation],
  );

  const handlePressNext = useCallback(async () => {
    if (!canPressNext) return;

    setNextActionBusy(true);
    try {
      const data = await signupConsentMutation.mutateAsync({
        personalInfoRequired: true,
        agreeMarketing: terms.privacyMarketing,
      });
      const email = data?.email ?? "";
      setDraftEmail(email);
      if (data?.signupStep) {
        setDraftSignupStep(data.signupStep);
      }
      navigation.navigate("SocialSignup", {
        signup: { email },
      });
    } catch (e) {
      if (isSignupStepMismatchError(e)) {
        try {
          const status = await signupStatusMutation.mutateAsync();
          applySignupStatusToDraft(status);
          navigateFromSignupStatus(status, navigation);
          return;
        } catch (e2) {
          console.warn("[signup/status] recovery failed", e2);
          Alert.alert(
            "안내",
            "회원가입 상태를 확인하지 못했습니다. 다시 시도하거나 앱을 재실행해 주세요.",
          );
          return;
        }
      }
      Alert.alert("안내", "처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      if (mountedRef.current) {
        setNextActionBusy(false);
      }
    }
  }, [
    canPressNext,
    navigation,
    setDraftEmail,
    signupConsentMutation,
    terms.privacyMarketing,
  ]);

  return (
    <View style={styles.root}>
      <AuthBackground />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleBlock}>
          <AppText variant="displayTitle2" style={styles.mainText}>
            서비스 이용을 위해
          </AppText>
          <AppText variant="displayTitle2" style={styles.mainText}>
            약관 동의가 필요합니다
          </AppText>
        </View>

        <TermsAgreementCard
          value={terms}
          onChange={handleChangeTerms}
          onPressDetail={handlePressDetail}
        />
      </ScrollView>

      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !canPressNext && styles.nextButtonDisabled,
          ]}
          activeOpacity={canPressNext ? 0.85 : 1}
          disabled={!canPressNext}
          onPress={handlePressNext}
        >
          <AppText
            variant="heading"
            style={[
              styles.nextButtonText,
              !canPressNext && styles.nextButtonTextDisabled,
            ]}
          >
            {nextActionBusy ? "처리 중..." : "다음"}
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TermsDetailScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
    paddingVertical: 35,
  },
  content: {
    paddingHorizontal: 20,

    paddingVertical: 80,
  },
  titleBlock: {
    marginBottom: 24,
  },
  mainText: {
    color: "#FFFFFF",
  },
  bottomArea: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nextButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "#232323",
  },
  nextButtonText: {
    color: "#111111",
  },
  nextButtonTextDisabled: {
    color: "#3E3E3E",
  },
});
