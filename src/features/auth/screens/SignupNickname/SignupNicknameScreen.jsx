// src/features/auth/screens/SignupNickname/SignupNicknameScreen.jsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";

import AuthBackground from "../../components/AuthBackground";
import SignupCheckedInput from "../../components/SignupCheckedInput";
import SignupStepIndicator from "../../components/SignupStepIndicator";
import { useCheckedField } from "../../hooks/useCheckedField";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNicknameCheckMutation } from "../../services/nicknameCheckMutation";
import { useStepBack } from "../../hooks/useStepBack";

import BackIcon from "../../../../shared/assets/svg/chevrons/back.svg";

const { height } = Dimensions.get("window");

const SignupNicknameScreen = ({ navigation, route }) => {
  const signup = route?.params?.signup ?? {}; // ? { signupType, email, terms ... }
  const { mutateAsync: checkNicknameDuplicate } = useNicknameCheckMutation();
  const handleBack = useStepBack("Login");

  const nicknameRegex = /^[가-힣a-zA-Z0-9._]+$/;

  const validateNickname = (value) => {
    if (!value) return "닉네임을 입력해주세요.";

    const trimmed = value.trim();

    // 길이: 1~13
    if (trimmed.length < 1 || trimmed.length > 13) {
      return "닉네임은 1~13자 이내로 입력해주세요.";
    }

    // 허용 문자
    if (!nicknameRegex.test(trimmed)) {
      return "한글, 영문, 숫자, _, . 만 사용할 수 있어요.";
    }

    return "";
  };

  const nicknameField = useCheckedField({
    validate: validateNickname,
    checkAvailability: async (trimmedNickname) => {
      // const isDuplicate = await checkNicknameDuplicate(trimmedNickname);
      // const available = !isDuplicate;
      // return available; // useCheckedField 쪽에서는 boolean만 쓰면 됨
      return true;
    },
  });

  const isNextEnabled = useMemo(() => {
    return (
      !!nicknameField.value && !nicknameField.error && nicknameField.isAvailable
    );
  }, [nicknameField.value, nicknameField.error, nicknameField.isAvailable]);

  const handleNext = () => {
    if (!isNextEnabled) return;

    const nickname = nicknameField.value.trim();

    // 다음 단계로 이동 (즐겨찾는 팀 화면으로 이동 예시)
    navigation.navigate("SignupFavoriteTeam", {
      signup: {
        ...signup,
        nickname,
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
              {/* 헤더 (뒤로가기 + 스텝 인디케이터) */}
              <View style={styles.headerRow}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                  activeOpacity={0.8}
                >
                  <BackIcon />
                </TouchableOpacity>

                <View style={styles.stepWrapper}>
                  <SignupStepIndicator currentStep={1} />
                </View>

                {/* 오른쪽 정렬용 더미 뷰 */}
                <View style={styles.rightPlaceholder} />
              </View>

              {/* 타이틀 */}
              <Text style={styles.title}>닉네임을 입력해주세요</Text>

              {/* 닉네임 입력 */}
              <View style={styles.formWrapper}>
                <SignupCheckedInput
                  label={null}
                  placeholder="닉네임을 입력해주세요."
                  maxLength={13}
                  field={nicknameField}
                  buttonLabel="중복확인"
                />

                {/* 글자 수 표시 */}
                <Text style={styles.lengthText}>
                  {nicknameField.value.length}/13
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* 하단 플로팅 버튼 */}
          <View style={styles.floatingBottomArea}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                !isNextEnabled && styles.nextButtonDisabled,
              ]}
              activeOpacity={isNextEnabled ? 0.8 : 1}
              onPress={handleNext}
              disabled={!isNextEnabled}
            >
              <Text
                style={[
                  styles.nextButtonText,
                  !isNextEnabled && styles.nextButtonTextDisabled,
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: height * 0.1,
    marginBottom: 20,
    // borderWidth: 1,
  },
  backButton: {
    width: 32,
    // height: 32,
    alignItems: "center",
    // borderWidth: 1,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 15,
    // borderWidth: 1,
  },
  stepWrapper: {
    // flex: 1,
    alignItems: "center",
    width: 150,
    // borderWidth: 1,
  },
  rightPlaceholder: {
    width: 32,
    // borderWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 24,
  },
  formWrapper: {
    marginTop: 4,
  },
  lengthText: {
    // marginTop: 4,
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
