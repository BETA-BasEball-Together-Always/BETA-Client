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
    justifyContent: "center",
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  circleActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  number: {
    fontSize: 14,
    lineHeight: 16,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "700",
  },
  numberActive: {
    color: "#000000",
  },
  line: {
    height: 2,
    width: 24,
    marginHorizontal: 6,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
});
