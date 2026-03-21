import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import CommunityLoadingIcon from "../../features/community/assets/svg/CommunityPost/communityLoading.svg";

/**
 * CreatePostScreen과 동일한 회전 애니메이션 + CommunityLoadingIcon
 */
export default function CommunityLoadingSpinner({
  size = 44,
  style,
  iconStyle,
}) {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
      spinAnim.setValue(0);
    };
  }, [spinAnim]);

  const spinStyle = {
    transform: [
      {
        rotate: spinAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        }),
      },
    ],
  };

  return (
    <View style={[styles.wrap, style]} accessibilityLabel="로딩 중">
      <Animated.View style={[spinStyle, iconStyle]}>
        <CommunityLoadingIcon width={size} height={size} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: "center",
    alignItems: "center",
  },
});
