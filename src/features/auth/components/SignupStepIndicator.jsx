// src/features/auth/components/SignupStepIndicator.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const TOTAL_STEPS = 3;

const SignupStepIndicator = ({ currentStep }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
        const step = index + 1;
        const isActive = step === currentStep;

        return (
          <React.Fragment key={step}>
            <View style={[styles.circle, isActive && styles.circleActive]}>
              <Text style={[styles.number, isActive && styles.numberActive]}>
                {step}
              </Text>
            </View>

            {/* 마지막 원 뒤에는 선을 그리지 않음 */}
            {step !== TOTAL_STEPS && <View style={styles.line} />}
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default SignupStepIndicator;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#555", // 비활성 테두리 색
    backgroundColor: "#333", // 비활성 배경 (어두운 회색)
    justifyContent: "center",
    alignItems: "center",
  },
  circleActive: {
    backgroundColor: "#FFFFFF", // 활성 단계는 흰색
    borderColor: "#FFFFFF",
  },
  number: {
    fontSize: 12,
    lineHeight: 32.7,
    color: "#AAAAAA", // 비활성 숫자색
    fontWeight: "700",
  },
  numberActive: {
    color: "#000000", // 활성 숫자색 (검정)
  },
  line: {
    height: 2,
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "#555", // 중간 선 색
  },
});
