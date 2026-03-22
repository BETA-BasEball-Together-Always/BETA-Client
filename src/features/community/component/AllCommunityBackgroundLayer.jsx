import React, { useCallback, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import AllCommunityBackground from "../assets/svg/AllCommunityBackground/all_background.svg";

export default function AllCommunityBackgroundLayer({
  overlayColor = "rgba(2, 4, 8, 0)",
}) {
  const { width: winW, height: winH } = useWindowDimensions();
  const [size, setSize] = useState(null);

  const onLayout = useCallback((e) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setSize((prev) =>
        prev?.width === width && prev?.height === height
          ? prev
          : { width, height },
      );
    }
  }, []);

  const width = size?.width ?? winW;
  const height = size?.height ?? winH;

  return (
    <View style={styles.fill} onLayout={onLayout}>
      <AllCommunityBackground
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFillObject}
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: overlayColor },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
});
