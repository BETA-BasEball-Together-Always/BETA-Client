// src/features/auth/screens/TermsDetail/TermsDetailScreen.jsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthBackground from "../../components/AuthBackground";
import TermsAgreementCard from "../../components/TermsAgreementCard";
import { AppText } from "../../../../shared/theme/components/AppText";
import { useSignupConsentMutation } from "../../services/signupConsentMutation";

import BackIcon from "../../../../shared/assets/svg/chevrons/back.svg";

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

  return (
    <View style={styles.root}>
      <AuthBackground />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>

      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.replace("PrevStep")}
          activeOpacity={0.85}
        >
          <BackIcon />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>이용약관 동의</Text>

        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleBlock}>
          <AppText variant="displayTitle2" style={styles.mainText}>
            BETA 서비스 이용을 위해
          </AppText>
          <AppText variant="displayTitle2" style={styles.mainText}>
            약관에 동의해 주세요.
          </AppText>
        </View>

        <TermsAgreementCard
          value={terms}
          onChange={setTerms}
          onPressDetail={() => {
            // 필요 시 상세 약관 화면/웹뷰로 연결
          }}
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
          onPress={() => {
            if (!isRequiredAgreed) return;

            signupConsentMutation.mutate(
              {
                personalInfoRequired: true,
                agreeMarketing: terms.privacyMarketing,
              },
              {
                onSuccess: (data) => {
                  // data: { signupStep: 'CONSENT_AGREED', email }
                  navigation.replace("SocialSignup", {
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
      </SafeAreaView>
    </View>
  );
};

export default TermsDetailScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  safeArea: { flex: 1, backgroundColor: "transparent" },
  headerRow: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: { width: 32, alignItems: "center" },
  backButtonText: { fontSize: 28, lineHeight: 20, color: "#fff" },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
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
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  nextButtonText: {
    color: "#111111",
  },
  nextButtonTextDisabled: {
    color: "rgba(255,255,255,0.45)",
  },
});
