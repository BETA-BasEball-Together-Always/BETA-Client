import React, { memo } from "react";
import { Pressable, View, StyleSheet } from "react-native";

const TOUCH_W = 48;
const TOUCH_H = 48;

const TabBarItem = memo(function TabBarItem({ isFocused, onPress, icon }) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.item}
      android_ripple={{
        color: "rgba(255,255,255,0.08)",
        borderless: true,
        radius: 28,
      }}
    >
      {/* ✅ 하이라이트 pill/glass 제거 → 아이콘만 */}
      <View style={styles.iconWrap}>{icon}</View>
    </Pressable>
  );
});

export default TabBarItem;

const styles = StyleSheet.create({
  item: {
    width: TOUCH_W,
    height: TOUCH_H,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: { zIndex: 1 },
});
