import React, {memo} from "react";
import {View, StyleSheet, Platform} from "react-native";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import TabBarItem from "./TabBarItem";
import { getDeepActiveRouteName } from "../../utils/navigationHelper";

const PILL_W = 66;
const PILL_H = 44;

const CustomTabBar = memo(function CustomTabBar({
  state,
  descriptors,
  navigation,
  colors,
  hiddenRoutes,
}) {
  const insets = useSafeAreaInsets();

  // 현재 활성 탭의 "최심부 라우트" 이름 확인 (중첩 Stack 대응)  
  const activeTabRoute = state.routes[state.index];
  const activeNestedRouteName = getDeepActiveRouteName(activeTabRoute);

  // 특정 화면에서 탭바 숨김
  if (hiddenRoutes?.includes(activeNestedRouteName)) return null;

  return (
    <SafeAreaView
      edges={[]}
      style={[styles.safe, {paddingBottom: Math.max(insets.bottom, 6)}]}
    >
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const isFocused = state.index === index;

          const icon = options.tabBarIcon?.({
            color: colors?.icon,
            size: 24,
            focused: isFocused,
          });

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented)
              navigation.navigate(route.name);
          };

          return (
            <TabBarItem
              key={route.key}
              isFocused={isFocused}
              onPress={onPress}
              icon={icon}
              colors={colors}
            />
          );
        })}
      </View>
    </SafeAreaView>
  );
});

export default CustomTabBar;

const styles = StyleSheet.create({
  safe: {backgroundColor: "black"},
  bar: {
    height: 60,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
