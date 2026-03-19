import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// import PostDetailScreen from "@features/community/screens/PostDetail/PostDetailScreen";
import CreatePostScreen from "../../features/community/screens/CreatePost/CreatePostScreen";
import UploadSuccessScreen from "../../features/community/screens/CreatePost/UploadSuccessScreen";
import TeamCommunityScreen from "../../features/community/screens/TeamCommunityScreen";
import AllCommunityScreen from "../../features/community/screens/AllCommunityScreen";
const Stack = createNativeStackNavigator();

const CommunityStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="TeamCommunity"
    >
      <Stack.Screen name="TeamCommunity" component={TeamCommunityScreen} />
      <Stack.Screen name="AllCommunity" component={AllCommunityScreen} />
      {/* <Stack.Screen name="PostDetail" component={PostDetailScreen} /> */}
      {/* <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="UploadSuccess" component={UploadSuccessScreen} /> */}
    </Stack.Navigator>
  );
};

export default CommunityStack;
