import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import LoginScreen from '../screens/Auth/Login/LoginScreen'
import SignupScreen from '../screens/Auth/Signup/SignupScreen'
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

const styles = StyleSheet.create({})