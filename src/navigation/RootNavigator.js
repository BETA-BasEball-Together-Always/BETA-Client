import React from 'react'
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  // secure storage 등에서 로그인 상태 가져오기
//   const accessToken = useAuthStore((state) => state.accessToken);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* {accessToken ? ( */}
        <Stack.Screen name="Main" component={MainTabNavigator} />
      {/* ) : ( */}
        <Stack.Screen name="Auth" component={AuthStack} />
      {/* )} */}
    </Stack.Navigator>
  );
}

export default RootNavigator;