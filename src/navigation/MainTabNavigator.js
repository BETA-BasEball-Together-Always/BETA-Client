import React from "react";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {Ionicons} from "@expo/vector-icons";

import HomeScreen from "../screens/Home/HomeScreen";
import CommunityScreen from "../screens/Community/CommunityScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import PhotoBoothStack from "./PhotoBoothStack";

import CustomTabBar from "./components/CustomTabBar";

const Tab = createBottomTabNavigator();

// — Keep COLORS co-located here per your preference
const COLORS = {
  icon: "#F1F1F1",
  pillBg: "rgba(255,255,255,0.07)",
  pillBorder: "rgba(255,255,255,0.18)",
  shadow: "#000",
};

// — Also keep route visibility here and pass down
const HIDDEN_ROUTES = ["Camera", "Edit"];

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="PhotoBooth"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {display: "none"}, // hide default bar
      }}
      tabBar={(props) => (
        <CustomTabBar {...props} colors={COLORS} hiddenRoutes={HIDDEN_ROUTES} />
      )}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Ionicons
              name="home-outline"
              size={size ?? 24}
              color={color ?? COLORS.icon}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Ionicons
              name="people-outline"
              size={size ?? 24}
              color={color ?? COLORS.icon}
            />
          ),
        }}
      />
      <Tab.Screen
        name="PhotoBooth"
        component={PhotoBoothStack}
        options={{
          tabBarIcon: ({color, size}) => (
            <Ionicons
              name="camera-outline"
              size={size ?? 24}
              color={color ?? COLORS.icon}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Ionicons
              name="person-outline"
              size={size ?? 24}
              color={color ?? COLORS.icon}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
