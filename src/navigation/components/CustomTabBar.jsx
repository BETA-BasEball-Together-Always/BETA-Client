import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import TabBarItem from "./TabBarItem";
import { getDeepActiveRouteName } from "../../utils/navigationHelper";

const CustomTabBar = memo(function CustomTabBar({
  state,
  descriptors,
  navigation,
  colors,        // { active, inactive }
  hiddenRoutes,  // ["CameraScreen", "EditScreen"]
}) {
  const insets = useSafeAreaInsets();

  // 중첩 스택까지 고려한 현재 실제 화면 이름
  const activeTabRoute = state.routes[state.index];
  const activeNestedRouteName = getDeepActiveRouteName(activeTabRoute);

  // 특정 화면에서 탭바 숨김
  if (hiddenRoutes?.includes(activeNestedRouteName)) return null;

  return (
    <SafeAreaView
      edges={[]}
      style={[styles.safe, { paddingBottom: Math.max(insets.bottom, 6) }]}
    >
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // ✅ 아이콘 색상만 포커스 상태에 따라 바꿔서 넘김
          const color = isFocused ? colors?.active : colors?.inactive;

          const icon = options.tabBarIcon?.({
            color,
            size: 24,
            focused: isFocused,
          });

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabBarItem
              key={route.key}
              isFocused={isFocused}
              onPress={onPress}
              icon={icon}
            />
          );
        })}
      </View>
    </SafeAreaView>
  );
});

export default CustomTabBar;

const styles = StyleSheet.create({
  // 배경을 투명/다크 중 택1. 여기선 다크.
  safe: { backgroundColor: "#121212" },
  bar: {
    flexDirection: "row",
    height: 60,
    paddingHorizontal: '7%',
    justifyContent: "space-between",
    alignItems: "center",
    // borderWidth:1,
    // borderColor:'green'
  },
});
