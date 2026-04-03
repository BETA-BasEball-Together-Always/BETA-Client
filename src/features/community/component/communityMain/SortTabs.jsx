import React, { useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const SortTabs = ({ sort, onChange, compact = false }) => {
  const progress = useSharedValue(compact ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(compact ? 1 : 0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [compact, progress]);

  const buttonStyle = useAnimatedStyle(() => ({
    paddingHorizontal: interpolate(progress.value, [0, 1], [20, 12]),
    paddingVertical: interpolate(progress.value, [0, 1], [8, 4]),
    marginRight: interpolate(progress.value, [0, 1], [10, 8]),
    borderRadius: interpolate(progress.value, [0, 1], [20, 16]),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(progress.value, [0, 1], [16, 13]),
    lineHeight: interpolate(progress.value, [0, 1], [22, 18]),
  }));

  return (
    <View style={styles.outer}>
      <View style={styles.row}>
        <AnimatedTouchable
          onPress={() => onChange("latest")}
          style={[
            buttonStyle,
            sort === "latest" ? styles.activeBtn : styles.disabledBtn,
          ]}
        >
          <Animated.Text style={[styles.label, labelStyle]}>
            최신글
          </Animated.Text>
        </AnimatedTouchable>

        <AnimatedTouchable
          onPress={() => onChange("popular")}
          style={[
            buttonStyle,
            sort === "popular" ? styles.activeBtn : styles.disabledBtn,
          ]}
        >
          <Animated.Text style={[styles.label, labelStyle]}>
            인기글
          </Animated.Text>
        </AnimatedTouchable>
      </View>
    </View>
  );
};

export default SortTabs;

const styles = StyleSheet.create({
  /** 높이·세로 여백 고정 — 축소/복원 시 리스트가 위아래로 덜컹이지 않음 */
  outer: {
    height: 56,
    justifyContent: "center",
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  disabledBtn: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },
  activeBtn: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "rgba(228, 228, 228, 0.50)",
  },
  label: {
    color: "#4A4A4A",
    fontFamily: "NotoSansKR_Medium",
    fontWeight: "500",
  },
});
