// EditScreen.jsx
import React, { useEffect, useMemo } from 'react';
import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import photoBoothStore from '../../../stores/photoBoothStore';

export default function EditScreen() {
  const insets = useSafeAreaInsets();
  const { selectedFrame, capturedPhotos } = photoBoothStore(); // ✅ Zustand에서 바로 읽기
  const { width: screenW } = Dimensions.get('window');

  // 프레임 비율 계산 (CameraScreen과 동일)
  const previewAspect = useMemo(() => {
    if (!selectedFrame?.name) return 7 / 10;
    if (selectedFrame.name === '2x2') return 7 / 10;
    if (selectedFrame.name === '1x4') return 10 / 7;
    return 7 / 10;
  }, [selectedFrame]);

  const previewHeight = useMemo(() => screenW / previewAspect, [screenW, previewAspect]);

  const isGrid = selectedFrame?.name === '2x2';
  const isStrip = selectedFrame?.name === '1x4';

  if (!capturedPhotos?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={{ color: '#fff' }}>촬영된 사진이 없습니다.</Text>
      </View>
    );
  }

useEffect(() => {
  console.log('capturedPhotos:', capturedPhotos);
}, [capturedPhotos]);

return (
  <View style={{ flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }}>
    <Image
      source={{ uri: capturedPhotos[0] }}
      style={{ width: 200, height: 200, backgroundColor: 'gray' }}
    />
    <Text style={{ color: '#fff' }}>{capturedPhotos[0]}</Text>
  </View>
);

}

const GAP = 8;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0B' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0B0B' },
  frameWrap: { width: '100%', backgroundColor: '#000', overflow: 'hidden' },

  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    width: '50%',
    height: '50%',
  },

  col1x4: {
    flex: 1,
    justifyContent: 'space-between',
  },
  stripCell: {
    width: '100%',
    height: '24%',
  },

  bottomBar: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  infoText: { color: '#fff', fontSize: 14, opacity: 0.8 },
});
