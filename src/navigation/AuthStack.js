import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import LoginScreen from '../screens/Auth/Login/LoginScreen'
import SignupScreen from '../screens/Auth/Signup/SignupScreen'

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  )
}

export default AuthStack

const styles = StyleSheet.create({})