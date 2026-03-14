// src/features/auth/screens/SignupCredentials/SocialSignupScreen.jsx
import React, {useMemo, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

import AuthBackground from "../../components/AuthBackground";
import BetaLogo from "@shared/assets/svg/logos/BetaLogo.svg";

import SignupCheckedInput from "../../components/SignupCheckedInput";
import TermsAgreementCard from "../../components/TermsAgreementCard";
import {useCheckedField} from "../../hooks/useCheckedField";
import {useEmailCheckMutation} from "../../services/emailCheckMutation";

const {height} = Dimensions.get("window");

const SocialSignupScreen = ({navigation, route}) => {
  const [terms, setTerms] = useState({
    all: false,
    over14: false,
    tos: false,
    privacyRequired: false,
    privacyMarketing: false,
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailCheckMutation = useEmailCheckMutation();

  const validateEmail = (value) => {
    if (!value) return "이메일을 입력해 주세요.";
    if (!emailRegex.test(value)) return "올바른 이메일 형식을 입력해 주세요.";
    return "";
  };

  const emailField = useCheckedField({
    validate: validateEmail,
    checkAvailability: async (trimmedEmail) => {
      const isDuplicate = await emailCheckMutation.mutateAsync(trimmedEmail);
      return !isDuplicate; // useCheckedField는 available(boolean)만 기대
    },
  });

  const isFormValid = useMemo(() => {
    const requiredChecked = terms.over14 && terms.tos && terms.privacyRequired;
    const emailValid = !emailField.error && emailField.isAvailable;
    return requiredChecked && emailValid;
  }, [terms, emailField.error, emailField.isAvailable]);

  const handleNext = () => {
    if (!isFormValid) return;

    navigation.navigate("SignupNickname", {
      signup: {
        email: emailField.value,
        personalInfoRequired: terms.privacyRequired,
        agreeMarketing: terms.privacyMarketing,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <AuthBackground />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.inner}>
              <View>
                {/* 로고 */}
                <View style={styles.logoWrapper}>
                  <BetaLogo width={120} />
                </View>

                {/* 이메일 */}
                <View style={styles.formWrapper}>
                  <SignupCheckedInput
                    label="이메일"
                    placeholder="이메일을 입력해주세요."
                    keyboardType="email-address"
                    field={emailField}
                    buttonLabel="중복확인"
                  />

                  {/* 이용약관 */}
                  <TermsAgreementCard
                    value={terms}
                    onChange={setTerms}
                    onPressDetail={(type) => {
                      navigation.navigate("TermsDetail", {type});
                    }}
                  />
                  <TouchableOpacity
                    style={[
                      styles.nextButton,
                      !isFormValid && styles.nextButtonDisabled,
                    ]}
                    activeOpacity={isFormValid ? 0.8 : 1}
                    onPress={handleNext}
                    disabled={!isFormValid}
                  >
                    <Text
                      style={[
                        styles.nextButtonText,
                        !isFormValid && styles.nextButtonTextDisabled,
                      ]}
                    >
                      다음
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default SocialSignupScreen;

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
    paddingTop: height * 0.15,
    paddingBottom: height * 0.2,
    paddingHorizontal: 20,
  },
  inner: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 390,
    alignSelf: "center",
    justifyContent: "space-between",
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 32,
  },
  formWrapper: {
    flex: 1,
  },
  nextButton: {
    marginTop: 24, // 약관 카드와 간격
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
