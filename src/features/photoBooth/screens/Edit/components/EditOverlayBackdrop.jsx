import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { editStyles } from "../editStyles";

/**
 * @param {'glass' | 'sticker' | 'text'} mode
 */
export default function EditOverlayBackdrop({ mode }) {
  if (mode === "glass") {
    return (
      <>
        <BlurView
          intensity={Platform.select({ ios: 6, android: 5, default: 6 })}
          tint="light"
          style={StyleSheet.absoluteFillObject}
        />
        <View pointerEvents="none" style={editStyles.overlayGlassTint} />
      </>
    );
  }
  if (mode === "sticker") {
    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: "rgba(18, 18, 18, 0.80)" },
        ]}
      />
    );
  }
  if (mode === "text") {
    return (
      <>
        <BlurView
          intensity={Platform.select({ ios: 10, android: 7, default: 20 })}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: "rgba(18, 18, 18, 0.20)" },
          ]}
        />
      </>
    );
  }
  return null;
}
