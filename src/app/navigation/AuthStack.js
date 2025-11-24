import React from 'react'
import LoginScreen from '@features/auth/screens/Login/LoginScreen'
import SignupScreen from '@features/auth/screens/Signup/SignupScreen'
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName='Login'>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  )
}

export default AuthStack