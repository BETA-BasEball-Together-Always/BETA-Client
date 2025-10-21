// EditScreen.jsx
import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import photoBoothStore from '../../../stores/photoBoothStore';
import { FRAMES } from '../../../utils/framesMap';
import ImagesIcon   from '../../../assets/images/PhotoBooth/Edit/images.svg';
import FramesIcon   from '../../../assets/images/PhotoBooth/Edit/frames.svg';
import StickersIcon from '../../../assets/images/PhotoBooth/Edit/stickers.svg';
import TextIcon     from '../../../assets/images/PhotoBooth/Edit/text.svg';

const { width, height } = Dimensions.get('window');

export default function EditScreen() {
  const insets = useSafeAreaInsets();
  const { selectedTeam, selectedFrame, capturedPhotos } = photoBoothStore();

  // ▼ 편집 탭 상태 (사진/프레임/스티커/텍스트)
  const [activeTool, setActiveTool] = useState('photo'); // 'photo' | 'frame' | 'sticker' | 'text'

  // teamKey / frameKey
  const teamKey = selectedTeam?.teamKey ?? 'base';
  const frameKey = selectedFrame?.id ?? '2x2';

  // 프레임 이미지 소스
  const frameSource = useMemo(() => {
    const theme = FRAMES[teamKey] || FRAMES.base;
    return theme?.[frameKey] || FRAMES.base?.[frameKey] || null;
  }, [teamKey, frameKey]);

  // 프레임 크기
  const frameW = width * 0.9;
  const frameH = height * 0.7;
  // 1x4 = 1:3, 2x2 = 2:3 (aspectRatio = width/height)
  const aspect = frameKey === '1x4' ? 1 / 3 : 2 / 3;
  const frameStyle = frameKey === '1x4'
    ? { height: frameH, aspectRatio: aspect }
    : { width: frameW, aspectRatio: aspect };

  // 사진 슬롯 좌표 (퍼센트 기반)
  const slots = useMemo(() => {
    if (frameKey === '1x4') {
      return [
        { top: '4.6%',  left: '7.6%',  width: '84.4%', height: '19.9%' },
        { top: '25.85%', left: '7.6%',  width: '84.4%', height: '19.9%' },
        { top: '47.1%', left: '7.6%',  width: '84.4%', height: '19.9%' },
        { top: '68.35%', left: '7.6%',  width: '84.4%', height: '19.95%' },
      ];
    }
    return [
      { top: '4.6%',  left: '5.7%',  width: '42.5%', height: '40.3%' },
      { top: '4.6%',  right: '5.7%', width: '42.5%', height: '40.3%' },
      { bottom: '12.5%', left: '5.7%',  width: '42.5%', height: '40.3%' },
      { bottom: '12.5%', right: '5.7%', width: '42.5%', height: '40.3%' },
    ];
  }, [frameKey]);

  // 저장 버튼 (TODO: 합성 후 파일 저장 로직 연결)
  const handleSave = () => {
    console.log('[EditScreen] save pressed');
    // TODO: view-shot 또는 Skia로 합성하여 저장/공유
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* 상단바 */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>야구네컷 편집</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.saveText}>저장</Text>
        </TouchableOpacity>
      </View>

      {/* 편집 캔버스 */}
      <View style={styles.canvasArea}>
        {frameSource ? (
          <ImageBackground
            source={frameSource}
            style={[styles.frameBox, frameStyle]}
            resizeMode="contain"
          >
            {capturedPhotos.slice(0, 4).map((uri, i) => (
              <Image
                key={i}
                source={{ uri }}
                style={[styles.photo, slots[i]]}
                resizeMode="cover"
              />
            ))}
          </ImageBackground>
        ) : (
          <Text style={{ color: '#aaa' }}>프레임 이미지를 찾을 수 없어요</Text>
        )}
      </View>

      {/* 하단 툴바 */}
      <View style={[styles.bottomBar]}>
        <ToolItem label="사진"   Icon={ImagesIcon}   active={activeTool === 'photo'}   onPress={() => setActiveTool('photo')} />
        <ToolItem label="프레임" Icon={FramesIcon}   active={activeTool === 'frame'}   onPress={() => setActiveTool('frame')} />
        <ToolItem label="스티커" Icon={StickersIcon} active={activeTool === 'sticker'} onPress={() => setActiveTool('sticker')} />
        <ToolItem label="텍스트" Icon={TextIcon}     active={activeTool === 'text'}    onPress={() => setActiveTool('text')} />
      </View>
    </View>
  );
}

/** ───────── 하단 툴바 아이템 ───────── */
function ToolItem({ label, active, onPress, Icon }) {
  const iconColor = active ? '#FFFFFF' : '#3E3E3E';

  return (
    <TouchableOpacity onPress={onPress} style={styles.toolItem}>
      {/* SVG: 대부분 fill 또는 color로 색 지정 가능 */}
      <Icon width={28} height={28} color={iconColor} />
      <Text style={[styles.toolLabel, active && styles.toolLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}


/** ───────── 스타일 ───────── */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },

  /* 상단바 */
  topBar: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  saveBtn: {
    position: 'absolute',
    right: 16,
    top: 10,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  /* 캔버스 영역 */
  canvasArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameBox: { position: 'relative', overflow: 'hidden' },
  photo: { position: 'absolute' },

  /* 하단 툴바 */
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#0B0B0B',
  },
  toolItem: { alignItems: 'center', justifyContent: 'center' },
  toolIcon: {
    width: 28, height: 28, borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)', marginBottom: 6,
  },
  toolIconActive: { backgroundColor: '#FFFFFF' },
  toolLabel: { color: '#121212', fontSize: 10 },
  toolLabelActive: { color: '#FFFFFF', fontWeight: '700' },
});
