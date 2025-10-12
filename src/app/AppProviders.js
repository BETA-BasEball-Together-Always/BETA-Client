import React, { useEffect } from 'react'
import { AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import NetInfo from '@react-native-community/netinfo';
import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
  focusManager,
} from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 데이터 신선도/수명 관련 기본값
      staleTime: 30 * 1000,     // 30초 동안은 fresh
      gcTime: 10 * 60 * 1000,    // 5분 지나면 캐시 가비지 컬렉션
      retry: 1,                 // 실패 시 1회 재시도
      refetchOnReconnect: true, // 네트워크 복구 시 자동 리패치
      refetchOnWindowFocus: true, // RN에선 focusManager로 동작
    },
  },
});

const AppProviders = ({children}) => {
  /* 네트워크 연결 상태를 TanStack Query에 알려줌(동기화용) */
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected && !!state.isInternetReachable;
      onlineManager.setOnline(online);
    });
    return () => unsub();
  }, []);

  /* 앱 전후면(포커스) 상태를 TanStack Query에 알려줌(동기화용) */
  useEffect(() => {
    const sub = AppState.addEventListener('change', (status) => {
      focusManager.setFocused(status === 'active');
    });
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          {children}
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}

export default AppProviders