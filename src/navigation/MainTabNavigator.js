import React, { memo } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/Home/HomeScreen';
import CommunityScreen from '../screens/Community/CommunityScreen';
import PhotoBoothScreen from '../screens/PhotoBooth/PhotoBoothScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

// 각 화면 import (실제 경로에 맞게 변경)

const Tab = createBottomTabNavigator();

const COLORS = {
  icon: '#F1F1F1',
  pillBg: 'rgba(255,255,255,0.07)',
  pillBorder: 'rgba(255,255,255,0.18)',
  shadow: '#000',
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { display: 'none' }, // 기본 탭 바 숨김
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size ?? 24} color={color ?? COLORS.icon} />
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size ?? 24} color={color ?? COLORS.icon} />
          ),
        }}
      />
      <Tab.Screen
        name="PhotoBooth"
        component={PhotoBoothScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera-outline" size={size ?? 24} color={color ?? COLORS.icon} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size ?? 24} color={color ?? COLORS.icon} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const CustomTabBar = memo(function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      edges={[]}
      style={[styles.safe, { paddingBottom: Math.max(insets.bottom, 6) }]}
    >
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const icon = options.tabBarIcon?.({
            color: COLORS.icon,
            size: 24,
            focused: isFocused,
          });

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.item}
              android_ripple={{ color: 'rgba(255,255,255,0.08)', borderless: true, radius: 28 }}
            >
              {/* ✅ 선택된 탭에만 pill 표시 */}
              {isFocused && <View style={styles.pill} />}
              <View style={styles.iconWrap}>{icon}</View>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
});

const PILL_W = 66;
const PILL_H = 44;

const styles = StyleSheet.create({
  safe: { backgroundColor: 'black' },
  bar: {
    height: 60,
    paddingHorizontal: 24,
    // backgroundColor: 'black',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  item: {
    width: PILL_W,
    height: PILL_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    zIndex: 2,
  },
  pill: {
    position: 'absolute',
    zIndex: 1,
    width: PILL_W,
    height: PILL_H,
    borderRadius: 16,
    backgroundColor: COLORS.pillBg,
    borderWidth: 1,
    borderColor: COLORS.pillBorder,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOpacity: 0.35,
        shadowRadius: 9,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 10,
      },
    }),
  },
});
