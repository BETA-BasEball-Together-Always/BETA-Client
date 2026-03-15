// GradientBlob.jsx
import React from "react";
import { View, StyleSheet } from "react-native";

const GradientBlob = ({ colors, style }) => {
  // colors는 항상 2개씩 나란히 전달됨
  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        {colors.map((color, idx) => (
          <View
            key={idx}
            style={[
              styles.colorBlock,
              { backgroundColor: color, width: `${100 / colors.length}%` },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default GradientBlob;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    overflow: "hidden",
    // borderRadius: 200, // blob 모양
  },
  row: {
    flexDirection: "row",
    width: "100%",
    height: "100%",
  },
  colorBlock: {
    height: "100%",
    opacity: 0.6, // 블러 적용 전 임시
  },
});
