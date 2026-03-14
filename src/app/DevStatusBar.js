// src/app/DevStatusBar.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, AppState, StyleSheet } from 'react-native';
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';

function useAppState() {
  const [appState, setAppState] = useState(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', setAppState);
    return () => sub.remove();
  }, []);
  return appState;
}

// 단순 테스트용 API: 현재 시간을 받아와 표시 (원하는 엔드포인트로 바꿔도 됨)
async function fetchServerTime() {
  // 네트워크 변화를 보기만 하면 되니 성공/실패만 확인해도 OK
  const res = await fetch('https://worldtimeapi.org/api/ip', { method: 'GET' });
  if (!res.ok) throw new Error('fetch failed');
  return res.json();
}

export default function DevStatusBar() {
  const appState = useAppState();
  const netInfo = useNetInfo(); // {isConnected, isInternetReachable, type ...}
  const mountedAt = useRef(Date.now());

  const { data, isFetching, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['server-time'],
    queryFn: fetchServerTime,
    // 포커스/온라인 복구 시 자동 refetch 확인을 위해 아래 옵션 유지
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    retry: 0,
  });

  return (
    <View style={styles.wrap}>
      <Text style={styles.row}>
        <Text style={styles.label}>AppState: </Text>
        {appState}
      </Text>
      <Text style={styles.row}>
        <Text style={styles.label}>Online: </Text>
        {String(!!netInfo.isConnected && !!netInfo.isInternetReachable)}
        {`  (type=${netInfo.type})`}
      </Text>
      <Text style={styles.row}>
        <Text style={styles.label}>Fetching: </Text>
        {String(isFetching)}
      </Text>
      <Text style={styles.row}>
        <Text style={styles.label}>Last fetch: </Text>
        {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : '-'}
      </Text>
      <Text style={styles.row}>
        <Text style={styles.label}>Mounted: </Text>
        {new Date(mountedAt.current).toLocaleTimeString()}
      </Text>
      {error ? <Text style={styles.err}>Error: {String(error)}</Text> : null}
      <Text style={styles.row}>
        <Text style={styles.label}>Now: </Text>
        {data?.datetime ?? '(call refetch)'}
      </Text>
      <Text style={styles.hint}>
        • 앱을 백그라운드로 보냈다가 돌아오면 자동 refetch됨{'\n'}
        • 네트워크 끊고 다시 연결해도 자동 refetch됨{'\n'}
        • 필요하면 개발 중 수동으로 refetch(콘솔에서 호출)도 가능
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 12, backgroundColor: '#111', gap: 4 },
  label: { color: '#9acdff', fontWeight: '600' },
  row: { color: 'white' },
  err: { color: '#ff8a8a' },
  hint: { color: '#bbb', marginTop: 8 }
});
