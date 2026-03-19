import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TeamCommunityScreen from "../../features/community/screens/TeamCommunityScreen";
import AllCommunityScreen from "../../features/community/screens/AllCommunityScreen";
import CreatePostCameraScreen from "../../features/community/screens/CreatePost/CreatePostCameraScreen";
import UploadSuccessScreen from "../../features/community/screens/CreatePost/UploadSuccessScreen";
import CreatePostScreen from "../../features/community/screens/CreatePost/CreatePostScreen";
import PostDetailScreen from "../../features/community/screens/PostDetail/PostDetailScreen";

const Stack = createNativeStackNavigator();

const CommunityStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="AllCommunity"
    >
      <Stack.Screen name="TeamCommunity" component={TeamCommunityScreen} />
      <Stack.Screen name="AllCommunity" component={AllCommunityScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen
        name="CreatePostCamera"
        component={CreatePostCameraScreen}
      />
      <Stack.Screen name="UploadSuccess" component={UploadSuccessScreen} />
    </Stack.Navigator>
  );
};

export default CommunityStack;
