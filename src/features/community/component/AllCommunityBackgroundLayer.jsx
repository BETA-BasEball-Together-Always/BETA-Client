import React, { useCallback, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import AllCommunityBackground from "../assets/svg/AllCommunityBackground/all_background.svg";

/**
 * 전체 화면을 덮는 커뮤니티 배경 SVG.
 * RN에서 SVG width/height %는 높이가 누락되는 경우가 있어 실제 픽셀 크기를 사용합니다.
 * onLayout으로 부모(스크린 콘텐츠 영역)에 맞추고, 첫 프레임은 window 크기로 폴백합니다.
 */
export default function AllCommunityBackgroundLayer({
  overlayColor = "rgba(2, 4, 8, 0.25)",
}) {
  const { width: winW, height: winH } = useWindowDimensions();
  const [size, setSize] = useState(null);

  const onLayout = useCallback((e) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setSize((prev) =>
        prev?.width === width && prev?.height === height ? prev : { width, height },
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
        style={[StyleSheet.absoluteFillObject, { backgroundColor: overlayColor }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
});
