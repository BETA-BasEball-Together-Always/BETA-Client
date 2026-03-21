import React from "react";
import * as SplashScreen from "expo-splash-screen";
import RootNavigator from "./navigation/RootNavigator";
import AppProviders from "./AppProviders";
import "../../global.css";

// 스플래시가 폰트 로드 전 자동으로 사라지지 않도록 고정
// SplashScreen.preventAutoHideAsync().catch(() => {
//   // 이미 호출된 경우 등의 에러는 무시해도 됨
// });

export default function App() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
