import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProfileScreen from "../../features/profile/screens/Profile/ProfileScreen";
import ProfileSettingScreen from "../../features/profile/screens/Setting/ProfileSettingScreen";
import EditBioScreen from "../../features/profile/screens/Profile/EditBioScreen";

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditBio" component={EditBioScreen} />
      <Stack.Screen name="ProfileSetting" component={ProfileSettingScreen} />
    </Stack.Navigator>
  );
}
