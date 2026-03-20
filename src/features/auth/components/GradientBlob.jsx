import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const GradientBlob = ({ colors, style }) => {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { opacity: 1 }]}
      />
      <BlurView
        intensity={60}
        tint="dark"
        style={StyleSheet.absoluteFillObject}
      />

      <BlurView
        intensity={40}
        tint="light"
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
};

export default GradientBlob;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    overflow: "hidden",
  },
});
