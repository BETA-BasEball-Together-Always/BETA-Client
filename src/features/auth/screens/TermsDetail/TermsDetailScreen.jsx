// src/features/auth/screens/TermsDetail/TermsDetailScreen.jsx
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import AuthBackground from "../../components/AuthBackground";
import TermsAgreementCard from "../../components/TermsAgreementCard";
import { AppText } from "../../../../shared/theme/components/AppText";
import { useSignupConsentMutation } from "../../services/signupConsentMutation";
import { useSignupStatusMutation } from "../../services/signupStatusMutation";
import { useStepBack } from "../../hooks/useStepBack";
import { navigateFromSignupStatus } from "../../../../shared/auth/navigateFromSignupStatus";
import { applySignupStatusToDraft } from "../../../../shared/auth/applySignupStatusToDraft";
import { normalizeSignupStep } from "../../../../shared/services/sessionBootstrap";
import { useSignupDraftStore } from "../../stores/useSignupDraftStore";

const TermsDetailScreen = ({ navigation }) => {
  const draftTerms = useSignupDraftStore((s) => s.terms);
  const setDraftTerms = useSignupDraftStore((s) => s.setTerms);
  const setDraftEmail = useSignupDraftStore((s) => s.setEmail);

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

  /** 뒤로가기/재진입 시 서버 단계 기준으로 약관 체크 + 이메일 draft 복원 */
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const status = await signupStatusMutation.mutateAsync();
          if (cancelled) return;
          applySignupStatusToDraft(status);
          const next = useSignupDraftStore.getState().terms;
          if (next) setTerms(next);
        } catch {
          /* 오프라인 등 — 로컬 draft만 유지 */
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [signupStatusMutation]),
  );

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
            !isRequiredAgreed && styles.nextButtonDisabled,
          ]}
          activeOpacity={isRequiredAgreed ? 0.85 : 1}
          disabled={!isRequiredAgreed}
          onPress={async () => {
            if (!isRequiredAgreed) return;

            try {
              const status = await signupStatusMutation.mutateAsync();
              const step = normalizeSignupStep(
                status?.signupStep ?? status?.signup_step ?? null,
              );
              if (step === "CONSENT_AGREED") {
                navigateFromSignupStatus(status, navigation);
                return;
              }
            } catch (e) {
              console.warn("[signup/status]", e);
            }

            signupConsentMutation.mutate(
              {
                personalInfoRequired: true,
                agreeMarketing: terms.privacyMarketing,
              },
              {
                onSuccess: (data) => {
                  setDraftEmail(data?.email ?? "");
                  navigation.navigate("SocialSignup", {
                    signup: { email: data?.email ?? "" },
                  });
                },
              },
            );
          }}
        >
          <AppText
            variant="heading"
            style={[
              styles.nextButtonText,
              !isRequiredAgreed && styles.nextButtonTextDisabled,
            ]}
          >
            다음
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
