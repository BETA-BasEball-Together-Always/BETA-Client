import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import GradientBlob from "./GradientBlob";

const { height } = Dimensions.get("window");

//1차 배경!!
const baseBackgroundColors = [
  "#121212",
  "rgba(124, 41, 21, 0.60)",
  "rgba(72, 22, 52, 0.40)",
];

//5개 박스 그라데이션
const gradientBoxes = [
  ["#C00C3F", "#FF8000"],
  ["#CF0022", "#0066B3"],
  ["#284579", "#221E1F"],
  ["#032345", "#4F0A1A"],
  ["#01003A", "#EB0029"],
];

const SelectTeamBackground = () => {
  const BOX_HEIGHT = 198;
  const START_OFFSET = 215;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={baseBackgroundColors}
        start={{ x: 0, y: 0.25 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* {gradientBoxes.map((colors, index) => (
        <GradientBlob
          key={index}
          colors={colors}
          style={{
            top: START_OFFSET + index * BOX_HEIGHT,
            height: BOX_HEIGHT,
            width: "100%",
            position: "absolute",
            opacity: 0.6,
          }}
        />
      ))} */}
    </View>
  );
};

export default SelectTeamBackground;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // overflow: "hidden",
  },
});
