import React from 'react'
import SelectScreen from '@features/photoBooth/screens/Select/SelectScreen';
import CameraScreen from '@features/photoBooth/screens/Camera/CameraScreen';
import EditScreen from '@features/photoBooth/screens/Edit/EditScreen';
import ShareScreen from '@features/photoBooth/screens/Share/ShareScreen';
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