import React from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";

import SignupStepIndicator from "./SignupStepIndicator";
import BackIcon from "../../../shared/assets/svg/chevrons/back.svg";

const { height } = Dimensions.get("window");

export default function SignupProgressHeader({ currentStep, onBack }) {
  return (
    <View style={styles.headerRow}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="뒤로가기"
      >
        <BackIcon />
      </TouchableOpacity>

      <View style={styles.stepWrapper}>
        <SignupStepIndicator currentStep={currentStep} />
      </View>

      <View style={styles.rightPlaceholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: height * 0.1,
    marginBottom: 20,
  },
  backButton: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  stepWrapper: {
    alignItems: "center",
    width: 150,
  },
  rightPlaceholder: {
    width: 32,
  },
});

