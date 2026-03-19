import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// 각 화면
import HomeScreen from "@features/home/screens/Home/HomeScreen";
import TeamCommunityScreen from "@features/community/screens/TeamCommunityScreen";
import AllCommunityScreen from "@features/community/screens/AllCommunityScreen";
import ProfileScreen from "@features/profile/screens/Profile/ProfileScreen";
import PhotoBoothStack from "./PhotoBoothStack";

// 커스텀 탭바
import CustomTabBar from "./components/CustomTabBar";

// ✅ 로컬 SVG 아이콘 (metro.config.js + react-native-svg-transformer 설정 필요)
import AllIcon from "./assets/all.svg";
import TeamIcon from "./assets/team.svg";
import PhotoBoothIcon from "./assets/photobooth.svg";
import ProfileIcon from "./assets/mypage.svg";
import HomeIcon from "./assets/home.svg";

const Tab = createBottomTabNavigator();

// ✅ 색상 토큰: 활성/비활성만 사용
const COLORS = {
  active: "#FFFFFF",
  inactive: "#3E3E3E",
  // (필요 시 다른 토큰 추가 가능)
};

const ICON_SIZE = 40;

// ✅ 실제 라우트명에 맞게 지정
const HIDDEN_ROUTES = ["Camera", "Edit"];

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="TeamCommunity"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { display: "none" }, // 기본 탭바 숨기고 커스텀 탭바 사용
        tabBarStyle: { display: "none" }, // 기본 탭바 숨기고 커스텀 탭바 사용
      }}
      tabBar={(props) => (
        <CustomTabBar {...props} colors={COLORS} hiddenRoutes={HIDDEN_ROUTES} />
      )}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color = COLORS.inactive }) => (
            <HomeIcon
              width={ICON_SIZE}
              height={ICON_SIZE}
              color={color}
              stroke={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="AllCommunity"
        component={AllCommunityScreen}
        options={{
          tabBarIcon: ({ color = COLORS.inactive }) => (
            <AllIcon
              width={ICON_SIZE}
              height={ICON_SIZE}
              color={color}
              stroke={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="TeamCommunity"
        component={TeamCommunityScreen}
        options={{
          tabBarIcon: ({ color = COLORS.inactive }) => (
            <TeamIcon
              width={ICON_SIZE}
              height={ICON_SIZE}
              color={color}
              stroke={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="PhotoBooth"
        component={PhotoBoothStack}
        options={{
          tabBarIcon: ({ color = COLORS.inactive }) => (
            <PhotoBoothIcon
              width={ICON_SIZE}
              height={ICON_SIZE}
              color={color}
              stroke={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color = COLORS.inactive }) => (
            <ProfileIcon
              width={ICON_SIZE}
              height={ICON_SIZE}
              color={color}
              stroke={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
