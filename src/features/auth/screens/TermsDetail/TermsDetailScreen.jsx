// src/features/auth/screens/TermsDetail/TermsDetailScreen.jsx
import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AuthBackground from "../../components/AuthBackground";
import TermsAgreementCard from "../../components/TermsAgreementCard";
import { AppText } from "../../../../shared/theme/components/AppText";
import { useSignupConsentMutation } from "../../services/signupConsentMutation";
import { useSignupStatusMutation } from "../../services/signupStatusMutation";
import { useStepBack } from "../../hooks/useStepBack";
import { navigateFromSignupStatus } from "../../../../shared/auth/navigateFromSignupStatus";

const TermsDetailScreen = ({ navigation }) => {
  const [terms, setTerms] = useState({
    all: false,
    over14: false,
    tos: false,
    privacyRequired: false,
    privacyMarketing: false,
  });

  const isRequiredAgreed = useMemo(
    () => terms.over14 && terms.tos && terms.privacyRequired,
    [terms],
  );

  const signupConsentMutation = useSignupConsentMutation();
  const signupStatusMutation = useSignupStatusMutation();

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
          onChange={setTerms}
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
              if (
                status?.signupStep &&
                status.signupStep !== "SOCIAL_AUTHENTICATED"
              ) {
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
