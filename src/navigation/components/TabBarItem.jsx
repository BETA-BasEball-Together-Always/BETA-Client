import React, {memo} from "react";
import {Pressable, View, StyleSheet, Platform} from "react-native";

const PILL_W = 66;
const PILL_H = 44;

const TabBarItem = memo(function TabBarItem({
  isFocused,
  onPress,
  icon,
  colors,
}) {
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
      {isFocused && (
        <View
          style={[
            styles.pill,
            {backgroundColor: colors?.pillBg, borderColor: colors?.pillBorder},
          ]}
        />
      )}
      <View style={styles.iconWrap}>{icon}</View>
    </Pressable>
  );
});

export default TabBarItem;

const styles = StyleSheet.create({
  item: {
    width: PILL_W,
    height: PILL_H,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {zIndex: 2},
  pill: {
    position: "absolute",
    zIndex: 1,
    width: PILL_W,
    height: PILL_H,
    borderRadius: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.35,
        shadowRadius: 9,
        shadowOffset: {width: 0, height: 6},
      },
      android: {
        elevation: 10,
      },
    }),
  },
});
