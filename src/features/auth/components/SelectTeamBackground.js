// SelectTeamBackground.jsx
import React from "react";
import { View, StyleSheet } from "react-native";
import GradientBlob from "./GradientBlob";

const SelectTeamBackground = () => {
  // 총 7개 색상 (나중에 GradientBlob에서 그라데이션 적용 가능)
  const colors = [
    "#C00C3F",
    "#FF8000",
    "#CF0022",
    "#0066B3",
    "#284579",
    "#221E1F",
    "#032345",
    "#4F0A1A",
    "#01003A",
    "#EB0029",
  ];

  return (
    <View style={styles.container}>
      <GradientBlob
        colors={[colors[0], colors[1]]}
        style={{ top: 140, left: 0, width: 390, height: 198 }}
      />

      <GradientBlob
        colors={[colors[2], colors[3]]}
        style={{ top: 338, left: 0, width: 390, height: 198 }}
      />

      <GradientBlob
        colors={[colors[4], colors[5]]}
        style={{ bottom: 313, left: 0, width: 390, height: 198 }}
      />
      <GradientBlob
        colors={[colors[6], colors[7]]}
        style={{ top: 700, left: 0, width: 390, height: 198 }}
      />
      <GradientBlob
        colors={[colors[8], colors[9]]}
        style={{ bottom: 0, left: 0, width: 390, height: 198 }}
      />
    </View>
  );
};

export default SelectTeamBackground;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});
