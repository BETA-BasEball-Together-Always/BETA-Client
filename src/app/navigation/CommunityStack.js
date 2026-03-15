import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CommunityScreen from "@features/community/screens/CommunityScreen";
// import PostDetailScreen from "@features/community/screens/PostDetail/PostDetailScreen";
import CreatePostScreen from "../../features/community/screens/CreatePost/CreatePostScreen";
import UploadSuccessScreen from "../../features/community/screens/CreatePost/UploadSuccessScreen";
const Stack = createNativeStackNavigator();

const CommunityStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="CommunityMain"
    >
      <Stack.Screen name="CommunityMain" component={CommunityScreen} />
      {/* <Stack.Screen name="PostDetail" component={PostDetailScreen} /> */}
      {/* <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="UploadSuccess" component={UploadSuccessScreen} /> */}
    </Stack.Navigator>
  );
};

export default CommunityStack;
