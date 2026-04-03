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
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: height * 0.1,
    marginBottom: 20,
    paddingHorizontal: 20,

  },
  backButton: {
    width: 32,
    position: "absolute",
    left: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  stepWrapper: {
    alignItems: "center",
  },
  rightPlaceholder: {
    width: 32,
    position: "absolute",
    right: 20,
  },
});
