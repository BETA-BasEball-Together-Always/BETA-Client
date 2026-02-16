import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CommunityScreen from "@features/community/screens/CommunityScreen";
import PostDetailScreen from "@features/community/screens/PostDetail/PostDetailScreen";
const Stack = createNativeStackNavigator();

const CommunityStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="CommunityMain"
    >
      <Stack.Screen name="CommunityMain" component={CommunityScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
    </Stack.Navigator>
  );
};

export default CommunityStack;
