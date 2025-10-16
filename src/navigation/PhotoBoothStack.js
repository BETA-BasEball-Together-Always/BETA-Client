import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import SelectScreen from '../screens/PhotoBooth/SelectScreen'
import CameraScreen from '../screens/PhotoBooth/CameraScreen'
import EditScreen from '../screens/PhotoBooth/EditScreen'
import ShareScreen from '../screens/PhotoBooth/ShareScreen'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator();

const PhotoBoothStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Select">
      <Stack.Screen name="Select" component={SelectScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Edit" component={EditScreen} />
      <Stack.Screen name="Share" component={ShareScreen} />
    </Stack.Navigator>
  )
}

export default PhotoBoothStack

const styles = StyleSheet.create({})