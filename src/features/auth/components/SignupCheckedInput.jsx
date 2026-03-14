// src/features/auth/components/SignupCheckedInput.jsx
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import EmailCheckSuccessIcon from "../assets/common/svg/CheckSuccessIcon.svg";
import EmailCheckFailIcon from "../assets/common/svg/CheckFailIcon.svg";

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
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#B8B8C4"
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
            <Text style={styles.checkButtonText}>
              {isChecking ? "확인중..." : buttonLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {touched && !!error && <Text style={styles.errorText}>{error}</Text>}
      {touched && !error && status === "success" && (
        <Text style={styles.successText}>사용 가능한 값이에요.</Text>
      )}
    </View>
  );
};

export default SignupCheckedInput;

// 스타일은 NativeSignupScreen에서 쓰던 것 그대로 옮겨오고, 필요하면 props로 override
const styles = StyleSheet.create({
  fieldGroup: {marginBottom: 16},
  label: {
    fontSize: 13,
    color: "#FFFFFF",
    marginBottom: 6,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(0,0,0,0.25)",
    overflow: "hidden",
    height: 48,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    color: "#FFFFFF",
    fontSize: 14,
  },
  rightAddon: {
    height: "100%",
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkButton: {
    height: "100%",
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EFEFEF",
  },
  checkButtonDisabled: {
    backgroundColor: "#3E3E3E",
  },
  checkButtonText: {
    fontSize: 12,
    color: "#3E3E3E",
    fontWeight: "500",
  },
  errorText: {
    marginTop: 4,
    fontSize: 11,
    color: "#FF6B6B",
  },
  successText: {
    marginTop: 4,
    fontSize: 11,
    color: "#7BE495",
  },
});
