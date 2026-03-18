import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { height } = Dimensions.get("window");

const SelectTeamBackground = () => {
  return (
    <View style={styles.container}>
      {/* 컬러 blob */}
      <View style={[styles.blob, styles.red]} />
      <View style={[styles.blob, styles.orange]} />
      <View style={[styles.blob, styles.blue]} />
      <View style={[styles.blob, styles.purple]} />
      <View style={[styles.blob, styles.darkblue]} />

      {/* 오른쪽 dark gradient */}
      <LinearGradient
        colors={["#1C1C1C", "#10101073", "#1C1C1C00"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
        style={styles.overlay}
      />
    </View>
  );
};

export default SelectTeamBackground;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0A0A0A",
    overflow: "hidden",
    height: height * 2,
  },

  blob: {
    position: "absolute",
    width: 300,
    height: "100%",
    // borderRadius: 250,
    opacity: 0.6,
  },

  red: {
    backgroundColor: "#C00C3F",
    top: 100,
    left: 0,
  },

  orange: {
    backgroundColor: "#FF8000",
    top: 100,
    right: 0,
  },

  blue: {
    backgroundColor: "#0066B3",
    top: 220,
    left: 80,
  },

  purple: {
    backgroundColor: "#4F0A1A",
    bottom: 160,
    left: -100,
  },

  darkblue: {
    backgroundColor: "#01003A",
    bottom: -120,
    left: 60,
  },

  overlay: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "40%",
  },
});
