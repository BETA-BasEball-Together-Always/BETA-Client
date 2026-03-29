import React, { useCallback, useState } from "react";
import { View, Image, StyleSheet, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const BLOB_W = 250;
const BLOB_H = 228;

const BLOB_LAYERS = [
  {
    source: require("../../../shared/assets/images/favoriteTeam/blob-1.png"),
    opacity: 1,
  },
  {
    source: require("../../../shared/assets/images/favoriteTeam/blob-2.png"),
    opacity: 0.98,
  },
  {
    source: require("../../../shared/assets/images/favoriteTeam/blob-3.png"),
    opacity: 0.95,
  },
  {
    source: require("../../../shared/assets/images/favoriteTeam/blob-4.png"),
    opacity: 0.92,
  },
  {
    source: require("../../../shared/assets/images/favoriteTeam/blob-5.png"),
    opacity: 0.96,
  },
];

const SelectTeamBackground = () => {
  const { width: windowWidth } = useWindowDimensions();
  const [bandWidth, setBandWidth] = useState(() => Math.round(windowWidth));

  const onContainerLayout = useCallback((e) => {
    const next = Math.round(e.nativeEvent.layout.width);
    if (next > 0) {
      setBandWidth((prev) => (prev === next ? prev : next));
    }
  }, []);

  const rowHeight = Math.max(1, Math.round((bandWidth * BLOB_H) / BLOB_W));

  return (
    <View
      pointerEvents="none"
      style={styles.container}
      onLayout={onContainerLayout}
    >
      <LinearGradient
        colors={["#060508", "#121015", "#1C1218", "#241418"]}
        locations={[0, 0.35, 0.72, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.blobStack}>
        {BLOB_LAYERS.map((blob, index) => (
          <View
            key={index}
            style={[
              styles.blobRow,
              {
                width: bandWidth,
                height: rowHeight,
                marginTop: index > 0 ? -1 : 0,
              },
            ]}
          >
            <Image
              source={blob.source}
              resizeMode="cover"
              style={{
                width: bandWidth,
                height: rowHeight,
                opacity: blob.opacity,
              }}
            />
          </View>
        ))}
      </View>

      <LinearGradient
        colors={["#0A0A0A", "#0A0A0A00"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.topFade}
        pointerEvents="none"
      />

      <LinearGradient
        colors={["#0A0A0A66", "transparent", "#0A0A0A66"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
    </View>
  );
};

export default SelectTeamBackground;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "visible",
  },
  blobStack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "column",
    alignItems: "center",
  },
  blobRow: {
    overflow: "hidden",
    margin: 0,
    padding: 0,
    backgroundColor: "transparent",
  },
  topFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "7%",
    minHeight: 48,
  },
});
