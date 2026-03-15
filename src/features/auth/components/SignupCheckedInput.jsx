// src/features/auth/components/SignupCheckedInput.jsx
import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import EmailCheckSuccessIcon from "../assets/common/svg/CheckSuccessIcon.svg";
import EmailCheckFailIcon from "../assets/common/svg/CheckFailIcon.svg";

import { AppText } from "../../../shared/theme/components/AppText";

const SignupCheckedInput = ({
  label,
  placeholder,
  keyboardType = "default",
  maxLength,
  field, // useCheckedField에서 받은 객체 {value, error, ...}
  buttonLabel = "중복확인",
}) => {
  const {
    value,
    error,
    touched,
    status,
    handleChange,
    handleBlur,
    handleCheck,
    isChecking,
  } = field;

  return (
    <View style={styles.fieldGroup}>
      {label && <AppText style={styles.label}>{label}</AppText>}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#F9F9F9"
          value={value}
          onChangeText={handleChange}
          onBlur={handleBlur}
          keyboardType={keyboardType}
          autoCapitalize="none"
          maxLength={maxLength}
        />

        {status === "success" && (
          <View style={styles.rightAddon}>
            <EmailCheckSuccessIcon width={20} height={20} />
          </View>
        )}

        {status === "error" && (
          <View style={styles.rightAddon}>
            <EmailCheckFailIcon width={20} height={20} />
          </View>
        )}

        {(status === "idle" || status === "checking") && (
          <TouchableOpacity
            style={[
              styles.checkButton,
              (!value || !!error || isChecking) && styles.checkButtonDisabled,
            ]}
            activeOpacity={!value || !!error || isChecking ? 1 : 0.8}
            disabled={!value || !!error || isChecking}
            onPress={handleCheck}
          >
            <AppText variant="labelSmall" style={styles.checkButtonText}>
              {isChecking ? "확인중..." : buttonLabel}
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      {touched && !!error && (
        <AppText variant="semi13" style={styles.errorText}>
          {error}
        </AppText>
      )}
      {touched && !error && status === "success" && (
        <AppText variant="semi13" style={styles.successText}>
          사용 가능한 값이에요.
        </AppText>
      )}
    </View>
  );
};

export default SignupCheckedInput;

// 스타일은 NativeSignupScreen에서 쓰던 것 그대로 옮겨오고, 필요하면 props로 override
const styles = StyleSheet.create({
  fieldGroup: { marginBottom: 16 },
  label: {
    color: "#FFFFFF",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(206, 206, 206, 0.34)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    overflow: "hidden",
    height: 55,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    color: "#FFFFFF",
  },
  rightAddon: {
    height: "100%",
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkButton: {
    paddingHorizontal: 11,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#252823",
    borderRadius: 5,
    right: 10,
  },
  checkButtonDisabled: {
    backgroundColor: "#252823",
  },
  checkButtonText: {
    color: "#6F9D48",
  },
  errorText: {
    marginTop: 3,
    color: "#F34E4E",
    paddingHorizontal: 4,
  },
  successText: {
    color: "#6F9D48",
    paddingHorizontal: 4,
    marginTop: 3,
    marginBottom: -20,
  },
});
