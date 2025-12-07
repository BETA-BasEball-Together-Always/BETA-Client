// src/features/auth/screens/SignupCredentials/NativeSignupScreen.jsx
import React, {useMemo, useState} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  StyleSheet,
} from "react-native";

import BetaLogo from "@shared/assets/svg/logos/BetaLogo.svg";
import AuthBackground from "../../components/AuthBackground";
import {SafeAreaView} from "react-native-safe-area-context";

const NativeSignupScreen = ({navigation}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [terms, setTerms] = useState({
    all: false,
    over14: false,
    tos: false,
    privacyRequired: false,
    privacyMarketing: false,
  });

  const toggleAll = () => {
    const nextValue = !terms.all;
    setTerms({
      all: nextValue,
      over14: nextValue,
      tos: nextValue,
      privacyRequired: nextValue,
      privacyMarketing: nextValue,
    });
  };

  const toggleOne = (key) => {
    const next = {...terms, [key]: !terms[key]};
    const {over14, tos, privacyRequired, privacyMarketing} = next;
    next.all = over14 && tos && privacyRequired && privacyMarketing;
    setTerms(next);
  };

  const isFormValid = useMemo(() => {
    const requiredChecked = terms.over14 && terms.tos && terms.privacyRequired; // (선택) 마케팅 동의는 제외
    const hasEmail = email.trim().length > 0;
    const hasPw = password.length > 0 && password === passwordConfirm;

    return requiredChecked && hasEmail && hasPw;
  }, [email, password, passwordConfirm, terms]);

  const handleNext = () => {
    if (!isFormValid) return;

    navigation.navigate("SignupFavoriteTeam", {
      signupType: "NATIVE",
      email,
      password,
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

          {/* 로고 */}
          <View style={styles.logoWrapper}>
            <BetaLogo width={120} />
          </View>

          {/* 폼 영역 */}
          <View style={styles.formWrapper}>
            {/* 이메일 */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>이메일</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputWithButton]}
                  placeholder="이메일을 입력해주세요."
                  placeholderTextColor="#B8B8C4"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                <TouchableOpacity style={styles.dupButton}>
                  <Text style={styles.dupButtonText}>중복확인</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 비밀번호 */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.passwordInput}
                placeholder="비밀번호를 입력하세요."
                placeholderTextColor="#B8B8C4"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* 비밀번호 확인 */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <TextInput
                style={styles.passwordInput}
                placeholder="비밀번호를 다시 입력하세요."
                placeholderTextColor="#B8B8C4"
                secureTextEntry
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
              />
            </View>

            {/* 이용약관 */}
            <View style={styles.termsCard}>
              {/* 전체 동의 */}
              <TouchableOpacity
                style={[styles.termRow, styles.termRowHeader]}
                onPress={toggleAll}
                activeOpacity={0.8}
              >
                <View style={styles.termLeft}>
                  <Checkbox checked={terms.all} />
                  <Text style={[styles.termText, styles.termAllText]}>
                    이용약관 전체 동의
                  </Text>
                </View>
              </TouchableOpacity>

              {/* 구분선 */}
              <View style={styles.termDivider} />

              {/* 개별 항목 */}
              <TermItem
                checked={terms.over14}
                onPress={() => toggleOne("over14")}
                label="(필수) 만 14세 이상 확인"
              />
              <TermItem
                checked={terms.tos}
                onPress={() => toggleOne("tos")}
                label="(필수) 이용약관 동의"
              />
              <TermItem
                checked={terms.privacyRequired}
                onPress={() => toggleOne("privacyRequired")}
                label="(필수) 개인정보 수집 및 이용 동의"
              />
              <TermItem
                checked={terms.privacyMarketing}
                onPress={() => toggleOne("privacyMarketing")}
                label="(선택) 개인정보 마케팅 활용 동의"
              />
            </View>
          </View>

          {/* 다음 버튼 */}
          <View style={styles.bottomArea}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                !isFormValid && styles.nextButtonDisabled,
              ]}
              activeOpacity={isFormValid ? 0.8 : 1}
              onPress={handleNext}
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
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const Checkbox = ({checked}) => (
  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
    {checked && <View style={styles.checkboxInner} />}
  </View>
);

const TermItem = ({checked, onPress, label}) => (
  <TouchableOpacity
    style={styles.termRow}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.termLeft}>
      <Checkbox checked={checked} />
      <Text style={styles.termText}>{label}</Text>
    </View>
    {/* 오른쪽 꺽쇠 아이콘 대신 텍스트로 대체 (아이콘 파일 있으면 교체) */}
    <Text style={styles.chevron}>{">"}</Text>
  </TouchableOpacity>
);

export default NativeSignupScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
    paddingHorizontal: "6%",
    paddingTop: "20%",
    paddingBottom: "8%",
    justifyContent: "space-between",
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 32,
  },
  formWrapper: {
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: "#FFFFFF",
    marginBottom: 6,
    fontWeight: "500",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    // height: 48,
    // paddingVertical: 20,
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(0,0,0,0.25)",
    color: "#FFFFFF",
    fontSize: 14,
  },
  passwordInput: {
    // flex: 1,
    // height: 48,
    // paddingVertical: 20,
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(0,0,0,0.25)",
    color: "#FFFFFF",
    fontSize: 14,
  },
  inputWithButton: {
    marginRight: 8,
  },
  dupButton: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  dupButtonText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  termsCard: {
    marginTop: 28,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  termRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  termRowHeader: {
    paddingBottom: 10,
  },
  termLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  termText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  termAllText: {
    fontSize: 13,
    fontWeight: "600",
  },
  termDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginVertical: 6,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: "#111111",
  },
  chevron: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.7,
  },
  bottomArea: {
    marginTop: 24,
  },
  nextButton: {
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
