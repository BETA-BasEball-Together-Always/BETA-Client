import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { editStyles } from "../editStyles";

/**
 * 편집 화면 하단 패널 뒤쪽 블러/딤 레이어
 * 패널 세로 길이: editConstants.getOverlayHeight / TEXT_STYLE_PANEL_HEIGHT (EditScreen)
 *
 * - textStyleGlass: 텍스트 선택 후 폰트·색 패널 — Blur 아래 intensity, 틴트는 editStyles.overlayTextStyleGlassTint
 *
 * @param {'glass' | 'sticker' | 'text' | 'textStyleGlass'} mode
 */
export default function EditOverlayBackdrop({ mode }) {
  if (mode === "glass") {
    return (
      <>
        <BlurView
          intensity={Platform.select({ ios: 2, android: 2, default: 6 })}
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
  if (mode === "textStyleGlass") {
    return (
      <>
        <BlurView
          intensity={Platform.select({ ios: 6, android: 5, default: 6 })}
          tint="light"
          style={StyleSheet.absoluteFillObject}
        />
        <View pointerEvents="none" style={editStyles.overlayTextStyleGlassTint} />
      </>
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
