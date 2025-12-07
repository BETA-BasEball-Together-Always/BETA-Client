import React from "react";
import LoginScreen from "@features/auth/screens/Login/LoginScreen";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import SignupFavoriteTeamScreen from "../../features/auth/screens/SignupFavoriteTeam/SignupFavoriteTeamScreen";
import SignupGenderAgeScreen from "../../features/auth/screens/SignupGenderAge/SignupGenderAgeScreen";
import SignupNicknameScreen from "../../features/auth/screens/SignupNickname/SignupNicknameScreen";
import NativeSignupScreen from "../../features/auth/screens/SignupCredentials/NativeSignupScreen";
import SocialSignupScreen from "../../features/auth/screens/SignupCredentials/SocialSignupScreen";

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="NativeSignup"
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="NativeSignup" component={NativeSignupScreen} />
      <Stack.Screen name="SocialSignup" component={SocialSignupScreen} />
      <Stack.Screen
        name="SignupFavoriteTeam"
        component={SignupFavoriteTeamScreen}
      />
      <Stack.Screen name="SignupGenderAge" component={SignupGenderAgeScreen} />
      <Stack.Screen name="SignupNickname" component={SignupNicknameScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
