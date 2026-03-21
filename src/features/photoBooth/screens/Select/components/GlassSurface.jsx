import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";

const SELECTED_BG = "#EFF1F5";

/**
 * 배경 위에 얹는 글래스(블러 + 반투명) 레이어.
 * 선택 시: 테두리 없음, 배경 #EFF1F5 (블러 없음)
 */
export default function GlassSurface({
  children,
  style,
  contentStyle,
  selected,
  borderRadius = 16,
}) {
  return (
    <View
      style={[
        styles.shell,
        { borderRadius },
        selected ? styles.shellSelected : styles.shellDefault,
        style,
      ]}
    >
      {!selected && (
        <>
          <BlurView
            intensity={Platform.select({ ios: 52, android: 38, default: 45 })}
            tint="light"
            style={StyleSheet.absoluteFillObject}
          />
          <View pointerEvents="none" style={[styles.frost, { borderRadius }]} />
        </>
      )}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: "hidden",
  },
  shellDefault: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.42)",
    backgroundColor: "transparent",
  },
  shellSelected: {
    borderWidth: 0,
    backgroundColor: SELECTED_BG,
  },
  frost: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
});
