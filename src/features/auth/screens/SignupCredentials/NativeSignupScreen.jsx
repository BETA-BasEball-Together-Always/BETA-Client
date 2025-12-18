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
  ScrollView,
  Dimensions,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import AuthBackground from "../../components/AuthBackground";
import BetaLogo from "@shared/assets/svg/logos/BetaLogo.svg";
import EmailCheckSuccessIcon from "../../assets/common/svg/CheckSuccessIcon.svg";
import EmailCheckFailIcon from "../../assets/common/svg/CheckFailIcon.svg";
import TermsAllOffIcon from "../../assets/NativeSignup/svg/TermsAllOff.svg"; // 전체 동의 기본 아이콘
import TermsItemOffIcon from "../../assets/NativeSignup/svg/TermsItemOff.svg"; // 개별 항목 기본 아이콘
import TermsCheckedIcon from "../../assets/NativeSignup/svg/TermsChecked.svg"; // 체크됐을 때 공통 아이콘
import PasswordHiddenIcon from "../../assets/NativeSignup/svg/PasswordHidden.svg"; // 눈 감김 아이콘
import PasswordVisibleIcon from "../../assets/NativeSignup/svg/PasswordVisible.svg"; // 눈 뜸 아이콘
import {useCheckedField} from "../../hooks/useCheckedField";
import SignupCheckedInput from "../../components/SignupCheckedInput";
import {useEmailCheckMutation} from "../../services/emailCheckMutation";
import TermsAgreementCard from "../../components/TermsAgreementCard";

const {height} = Dimensions.get("window");

const NativeSignupScreen = ({navigation}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] =
    useState(false);

  // 👇 이메일 검증 관련 state 추가
  // const [emailError, setEmailError] = useState("");
  // const [emailTouched, setEmailTouched] = useState(false);
  // const [isEmailAvailable, setIsEmailAvailable] = useState(false);
  // const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // 🔐 비밀번호 검증 state
  const [passwordError, setPasswordError] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordConfirmError, setPasswordConfirmError] = useState("");
  const [passwordConfirmTouched, setPasswordConfirmTouched] = useState(false);

  // 비밀번호 규칙:
  // - 8~20자
  // - 영문 / 숫자 / 특수문자 중 2가지 이상
  // - 이메일 아이디(골뱅이 앞부분)와 동일하지 않게
  const passwordRegexes = {
    lower: /[a-z]/,
    upper: /[A-Z]/,
    digit: /[0-9]/,
    special: /[!@#$%^&*()\-_=+\[\]{};:'",.<>/?`~]/,
  };

  const [terms, setTerms] = useState({
    all: false,
    over14: false,
    tos: false,
    privacyRequired: false,
    privacyMarketing: false,
  });

  const emailCheckMutation = useEmailCheckMutation();

  const validateEmail = (value) => {
    if (!value) return "이메일을 입력해 주세요.";
    if (!emailRegex.test(value)) return "올바른 이메일 형식을 입력해 주세요.";
    return "";
  };

  const emailField = useCheckedField({
    validate: validateEmail,
    checkAvailability: async (trimmedEmail) => {
      // React Query mutation을 단순 async 함수처럼 사용
      // 👉 react-query mutation 사용
      console.log("before api call");
      const isDuplicate = await emailCheckMutation.mutateAsync(trimmedEmail);
      const available = !isDuplicate;
      return available; // useCheckedField 쪽에서는 boolean만 쓰면 됨
      // return true; // 임시(mock)
    },
  });

  // const handleChangeEmail = (text) => {
  //   const value = text.trimStart();
  //   setEmail(value);
  //   setIsEmailAvailable(false);

  //   // 👉 인풋을 한 번이라도 빠져나간 이후에만 실시간 에러 업데이트
  //   if (emailTouched) {
  //     setEmailError(validateEmail(value));
  //   } else {
  //     // 아직 터치 전이면 에러 문구 안 보여줌
  //     setEmailError("");
  //   }
  // };

  // const handleBlurEmail = () => {
  //   setEmailTouched(true);
  //   const value = email.trim();
  //   setEmail(value); // 뒤 공백 정리
  //   setEmailError(validateEmail(value));
  // };

  // 중복 확인 버튼
  // const handleCheckEmail = async () => {
  //   const trimmed = email.trim();
  //   const error = validateEmail(trimmed);

  //   if (error) {
  //     setEmailTouched(true);
  //     setEmailError(error);
  //     return;
  //   }

  //   try {
  //     setIsCheckingEmail(true);
  //     setEmailError("");

  //     // TODO: 여기서 실제 API 호출
  //     // const { data } = await api.post("/auth/email/check", { email: trimmed });
  //     // const available = data.available;

  //     const available = true; // 임시(mock)

  //     if (available) {
  //       setIsEmailAvailable(true);
  //     } else {
  //       setIsEmailAvailable(false);
  //       setEmailError("이미 가입된 이메일이에요.");
  //     }
  //   } catch (e) {
  //     setIsEmailAvailable(false);
  //     setEmailError(
  //       "이메일 중복 확인에 실패했어요. 잠시 후 다시 시도해 주세요."
  //     );
  //   } finally {
  //     setIsCheckingEmail(false);
  //   }
  // };

  // const emailStatus = useMemo(() => {
  //   if (isCheckingEmail) return "checking";

  //   // 중복확인 성공
  //   if (emailTouched && !emailError && isEmailAvailable) {
  //     return "success";
  //   }

  //   // 형식 오류 or 중복 실패 등 에러가 있는 상태
  //   if (emailTouched && !!emailError) {
  //     return "error";
  //   }

  //   return "idle";
  // }, [isCheckingEmail, emailTouched, emailError, isEmailAvailable]);

  const getEmailLocalPart = (value) => {
    if (!value) return "";
    return value.split("@")[0] || "";
  };

  const validatePassword = (value, emailValue) => {
    if (!value) return "비밀번호를 입력해주세요.";

    if (value.length < 8 || value.length > 20) {
      return "8~20자 사이로 입력해주세요.";
    }

    let typeCount = 0;
    if (
      passwordRegexes.lower.test(value) ||
      passwordRegexes.upper.test(value)
    ) {
      typeCount += 1;
    }
    if (passwordRegexes.digit.test(value)) {
      typeCount += 1;
    }
    if (passwordRegexes.special.test(value)) {
      typeCount += 1;
    }
    if (typeCount < 2) {
      return "영문, 숫자, 특수문자 중 2가지 이상을 포함해주세요.";
    }

    const emailLocal = getEmailLocalPart(emailValue).toLowerCase();
    if (emailLocal && value.toLowerCase().includes(emailLocal)) {
      return "이메일과 유사한 비밀번호는 사용할 수 없어요.";
    }

    return "";
  };

  // 비밀번호 입력/블러 핸들러
  const handleChangePassword = (text) => {
    const value = text;
    setPassword(value);

    if (passwordTouched) {
      setPasswordError(validatePassword(value, email));
    }

    // 비밀번호가 바뀌면, 확인란과도 다시 비교
    if (passwordConfirmTouched) {
      setPasswordConfirmError(
        value === passwordConfirm ? "" : "비밀번호와 일치하지 않아요."
      );
    }
  };

  const handleBlurPassword = () => {
    setPasswordTouched(true);
    setPasswordError(validatePassword(password, email));
  };

  // 비밀번호 확인 입력/블러 핸들러
  const handleChangePasswordConfirm = (text) => {
    const value = text;
    setPasswordConfirm(value);

    if (passwordConfirmTouched) {
      setPasswordConfirmError(
        value === password ? "" : "비밀번호와 일치하지 않아요."
      );
    }
  };

  const handleBlurPasswordConfirm = () => {
    setPasswordConfirmTouched(true);
    setPasswordConfirmError(
      passwordConfirm === password ? "" : "비밀번호와 일치하지 않아요."
    );
  };

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
    const requiredChecked = terms.over14 && terms.tos && terms.privacyRequired;
    const emailValid = !emailField.error && emailField.isAvailable;

    const pwError = validatePassword(password, email);
    const isPasswordValid = !pwError;

    const isPasswordConfirmValid =
      !!passwordConfirm && passwordConfirm === password;

    console.log("isFormValid:", {
      requiredChecked,
      emailValid,
      isPasswordValid,
      isPasswordConfirmValid,
    });

    return (
      requiredChecked && emailValid && isPasswordValid && isPasswordConfirmValid
    );
  }, [
    terms,
    emailField.error,
    emailField.isAvailable,
    password,
    passwordConfirm,
  ]);

  const handleNext = () => {
    if (!isFormValid) return;

    navigation.navigate("SignupNickname", {
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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.inner}>
              {/* 위쪽(로고 + 폼) */}
              <View>
                {/* 로고 */}
                <View style={styles.logoWrapper}>
                  <BetaLogo width={120} />
                </View>

                {/* 폼 영역 */}
                <View style={styles.formWrapper}>
                  {/* 이메일 */}
                  <SignupCheckedInput
                    label="이메일"
                    placeholder="이메일을 입력해주세요."
                    keyboardType="email-address"
                    field={emailField}
                  />

                  {/* 비밀번호 */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>비밀번호</Text>

                    <View style={styles.passwordInputContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="비밀번호를 입력하세요."
                        placeholderTextColor="#B8B8C4"
                        secureTextEntry={!isPasswordVisible}
                        value={password}
                        onChangeText={handleChangePassword}
                        onBlur={handleBlurPassword}
                      />
                      <TouchableOpacity
                        style={styles.passwordIconWrapper}
                        onPress={() =>
                          setIsPasswordVisible((prevVisible) => !prevVisible)
                        }
                        activeOpacity={0.8}
                      >
                        {isPasswordVisible ? (
                          <PasswordVisibleIcon width={20} height={20} />
                        ) : (
                          <PasswordHiddenIcon width={20} height={20} />
                        )}
                      </TouchableOpacity>
                    </View>

                    {passwordTouched && !!passwordError && (
                      <Text style={styles.errorText}>{passwordError}</Text>
                    )}
                  </View>

                  {/* 비밀번호 확인 */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>비밀번호 확인</Text>

                    <View style={styles.passwordInputContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="비밀번호를 다시 입력하세요."
                        placeholderTextColor="#B8B8C4"
                        secureTextEntry={!isPasswordConfirmVisible}
                        value={passwordConfirm}
                        onChangeText={handleChangePasswordConfirm}
                        onBlur={handleBlurPasswordConfirm}
                      />
                      <TouchableOpacity
                        style={styles.passwordIconWrapper}
                        onPress={() =>
                          setIsPasswordConfirmVisible(
                            (prevVisible) => !prevVisible
                          )
                        }
                        activeOpacity={0.8}
                      >
                        {isPasswordConfirmVisible ? (
                          <PasswordVisibleIcon width={20} height={20} />
                        ) : (
                          <PasswordHiddenIcon width={20} height={20} />
                        )}
                      </TouchableOpacity>
                    </View>

                    {passwordConfirmTouched && !!passwordConfirmError && (
                      <Text style={styles.errorText}>
                        {passwordConfirmError}
                      </Text>
                    )}
                  </View>

                  {/* 이용약관 */}
                  <TermsAgreementCard
                    value={terms}
                    onChange={setTerms}
                    onPressDetail={(type) => {
                      navigation.navigate("TermsDetail", {type});
                    }}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
          {/* 🔥 float 하단 버튼 - ScrollView 밖으로 따로 배치 */}
          <View style={styles.floatingBottomArea}>
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

const Checkbox = ({checked, variant}) => {
  // checked === true면 공통 체크 아이콘
  if (checked) {
    return (
      <View style={styles.termIconWrapper}>
        <TermsCheckedIcon width={20} height={20} />
      </View>
    );
  }

  // 체크 안 된 상태: 전체 동의 / 개별 항목에 따라 아이콘 분기
  return (
    <View style={styles.termIconWrapper}>
      {variant === "all" ? (
        <TermsAllOffIcon width={20} height={20} />
      ) : (
        <TermsItemOffIcon width={20} height={20} />
      )}
    </View>
  );
};

const TermItem = ({
  checked,
  onToggle,
  label,
  showChevron = true,
  onPressChevron,
}) => (
  <View style={styles.termRow}>
    {/* ✅ 왼쪽(체크+라벨)만 눌러도 토글 */}
    <TouchableOpacity
      style={styles.termLeft}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <Checkbox checked={checked} variant="item" />
      <Text style={styles.termText}>{label}</Text>
    </TouchableOpacity>

    {/* ✅ chevron은 별도 버튼: 상세 화면 이동 */}
    {showChevron && (
      <TouchableOpacity
        onPress={onPressChevron}
        activeOpacity={0.8}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
      >
        <Text style={styles.chevron}>{">"}</Text>
      </TouchableOpacity>
    )}
  </View>
);

export default NativeSignupScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  // container: {
  //   flex: 1,
  //   paddingHorizontal: "6%",
  //   paddingTop: "20%",
  //   paddingBottom: "8%",
  //   justifyContent: "space-between",
  // },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: height * 0.13, // 화면 높이의 12% 정도 위 여백
    paddingBottom: height * 0.2, // 아래 여백
    paddingHorizontal: 20, // 양 옆 여백 (고정 px)
  },
  inner: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 390, // 큰 폰에서 너무 넓어지지 않게
    alignSelf: "center",
    justifyContent: "space-between", // 위쪽(로고+폼)과 아래 버튼 사이에 공간 분배
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
  // 바깥 테두리(전체 input처럼 보이는 박스)
  emailInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(0,0,0,0.25)",
    overflow: "hidden", // 버튼 모서리도 둥글게
    height: 48,
  },
  emailInput: {
    flex: 1,
    paddingHorizontal: 14,
    color: "#FFFFFF",
    fontSize: 14,
  },
  inputWithButton: {
    marginRight: 8,
  },
  // 우측 중복확인 버튼
  emailCheckButton: {
    height: "100%",
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "rgba(255,255,255,0.12)",
    backgroundColor: "#EFEFEF",
  },
  emailCheckButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.05)",
    backgroundColor: "#3E3E3E",
  },
  emailCheckButtonText: {
    fontSize: 12,
    // color: "#FFFFFF",
    color: "#3E3E3E",
    fontWeight: "500",
  },
  emailCheckButtonTextDisabled: {
    color: "#3E3E3E",
  },
  emailStatusIconWrapper: {
    height: "100%",
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    marginTop: 4,
    fontSize: 11,
    color: "#FF6B6B",
  },
  emailSuccessText: {
    marginTop: 4,
    fontSize: 11,
    color: "#7BE495",
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(0,0,0,0.25)",
    height: 48,
    overflow: "hidden",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    color: "#FFFFFF",
    fontSize: 14,
  },
  passwordIconWrapper: {
    height: "100%",
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  termsCard: {
    marginTop: 10,
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
  termIconWrapper: {
    width: 18,
    height: 18,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
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
  floatingBottomArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 20, // iOS 홈 인디케이터 고려
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
