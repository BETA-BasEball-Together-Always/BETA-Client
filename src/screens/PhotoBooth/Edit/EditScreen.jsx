// EditScreen.jsx
import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Image, ImageBackground, StyleSheet,
  Dimensions, FlatList, Animated, Easing, PanResponder
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import photoBoothStore from '../../../stores/photoBoothStore';
import { FRAMES } from '../../../utils/framesMap';
import ImagesIcon   from '../../../assets/images/PhotoBooth/Edit/images.svg';
import FramesIcon   from '../../../assets/images/PhotoBooth/Edit/frames.svg';
import StickersIcon from '../../../assets/images/PhotoBooth/Edit/stickers.svg';
import TextIcon     from '../../../assets/images/PhotoBooth/Edit/text.svg';

const { width, height } = Dimensions.get('window');
const OVERLAY_HEIGHT = 150;
const HIDDEN_Y = OVERLAY_HEIGHT + 24;
const SNAP_THRESHOLD = 48;

export default function EditScreen() {
  const insets = useSafeAreaInsets();
  const { selectedTeam, selectedFrame, capturedPhotos } = photoBoothStore();

  const [activeTool, setActiveTool] = useState('photo');
  const [bottomBarH, setBottomBarH] = useState(86);

  // ✅ 편집용 로컬 배열 (4장)
  const [photosLocal, setPhotosLocal] = useState(() => capturedPhotos.slice(0,4));
  useEffect(() => { setPhotosLocal(capturedPhotos.slice(0,4)); }, [capturedPhotos]);

  // ✅ 현재 프레임에서 교체할 슬롯 인덱스
  const [selectedSlot, setSelectedSlot] = useState(null);

  const teamKey = selectedTeam?.teamKey ?? 'base';
  const frameKey = selectedFrame?.id ?? '2x2';

  const frameSource = useMemo(() => {
    const theme = FRAMES[teamKey] || FRAMES.base;
    return theme?.[frameKey] || FRAMES.base?.[frameKey] || null;
  }, [teamKey, frameKey]);

  const frameW = width * 0.9;
  const frameH = height * 0.7;
  const aspect = frameKey === '1x4' ? 1 / 3 : 2 / 3;
  const frameStyle = frameKey === '1x4'
    ? { height: frameH, aspectRatio: aspect }
    : { width: frameW, aspectRatio: aspect };

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

  const handleSave = () => {
    console.log('[EditScreen] save pressed');
    // 필요 시 store에 덮어쓰기: photoBoothStore.getState().setCapturedPhotos(photosLocal);
  };

  // ── 오버레이 애니메이션 + 드래그 핸들 ──
  const overlayY = useRef(new Animated.Value(HIDDEN_Y)).current;
  const currentY = useRef(0);
  useEffect(() => {
    const toValue = activeTool === 'photo' ? 0 : HIDDEN_Y;
    Animated.timing(overlayY, {
      toValue, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();
  }, [activeTool, overlayY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 2,
      onPanResponderGrant: () => overlayY.stopAnimation(v => { currentY.current = v; }),
      onPanResponderMove: (_, g) => {
        const next = Math.min(HIDDEN_Y, Math.max(0, currentY.current + g.dy));
        overlayY.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const shouldClose = g.dy > SNAP_THRESHOLD || currentY.current + g.dy > HIDDEN_Y * 0.5;
        Animated.timing(overlayY, {
          toValue: shouldClose ? HIDDEN_Y : 0,
          duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }).start(() => { if (shouldClose) setActiveTool('none'); });
      },
      onPanResponderTerminate: () => {
        Animated.timing(overlayY, { toValue: 0, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
      },
    })
  ).current;

  // ✅ 프레임 사진 탭 → 슬롯 선택 + 회색 오버레이 표시 + 사진 탭 자동 활성화
  const onPressFramePhoto = (idx: number) => {
    setSelectedSlot(idx);
    setActiveTool('photo'); // 사진 오버레이 띄우기
  };

  // ✅ 오버레이 썸네일 탭 → 선택 슬롯 치환 후 오버레이(회색) 해제
  const onPressThumb = (uri: string) => {
    if (selectedSlot === null) return;
    setPhotosLocal(prev => {
      const next = [...prev];
      next[selectedSlot] = uri;
      return next;
    });
    setSelectedSlot(null); // 회색 오버레이 제거
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
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
          <ImageBackground source={frameSource} style={[styles.frameBox, frameStyle]} resizeMode="contain">
            {photosLocal.map((uri, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.9}
                style={[styles.photo, slots[i]]}
                onPress={() => onPressFramePhoto(i)}
              >
                <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                {/* 선택된 슬롯에만 회색 오버레이 */}
                {selectedSlot === i && <View style={styles.selectedOverlay} pointerEvents="none" />}
              </TouchableOpacity>
            ))}
          </ImageBackground>
        ) : (
          <Text style={{ color: '#aaa' }}>프레임 이미지를 찾을 수 없어요</Text>
        )}
      </View>

      {/* 사진 오버레이 */}
      <Animated.View
        pointerEvents={activeTool === 'photo' ? 'auto' : 'none'}
        style={[
          styles.overlayWrap,
          { transform: [{ translateY: overlayY }], bottom: bottomBarH },
        ]}
      >
        <View style={styles.overlayHandle} {...panResponder.panHandlers} />
        <FlatList
          horizontal
          data={capturedPhotos.slice(0,4)} // 교체 후보(현재는 촬영된 4장)
          keyExtractor={(u, idx) => `${u}-${idx}`}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onPressThumb(item)} activeOpacity={0.8}>
              <View style={styles.thumb}>
                <Image source={{ uri: item }} style={styles.thumbImg} resizeMode="cover" />
              </View>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </Animated.View>

      {/* 하단 툴바 */}
      <View
        style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}
        onLayout={e => setBottomBarH(e.nativeEvent.layout.height)}
      >
        <ToolItem label="사진"   Icon={ImagesIcon}   active={activeTool === 'photo'}   onPress={() => setActiveTool('photo')} />
        <ToolItem label="프레임" Icon={FramesIcon}   active={activeTool === 'frame'}   onPress={() => setActiveTool('frame')} />
        <ToolItem label="스티커" Icon={StickersIcon} active={activeTool === 'sticker'} onPress={() => setActiveTool('sticker')} />
        <ToolItem label="텍스트" Icon={TextIcon}     active={activeTool === 'text'}    onPress={() => setActiveTool('text')} />
      </View>
    </View>
  );
}

function ToolItem({ label, active, onPress, Icon }) {
  const iconColor = active ? '#FFFFFF' : '#3E3E3E';
  return (
    <TouchableOpacity onPress={onPress} style={styles.toolItem}>
      <Icon width={28} height={28} color={iconColor} />
      <Text style={[styles.toolLabel, active && styles.toolLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'black' },
  topBar: {
    height: 56, justifyContent: 'center', alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.08)', borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  saveBtn: {
    position: 'absolute', right: 16, top: 10, paddingHorizontal: 12, height: 32,
    borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center',
  },
  saveText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  canvasArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frameBox: { position: 'relative', overflow: 'hidden' },
  photo: { position: 'absolute' },

  // 선택된 슬롯 회색 오버레이
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(128, 128, 128, 0.5)',
    // borderRadius: 6,
  },

  bottomBar: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-around',
    paddingHorizontal: 16, paddingVertical: 8, gap: 10,
    borderTopColor: 'rgba(255,255,255,0.08)', borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'black',
  },
  toolItem: { alignItems: 'center', justifyContent: 'center' },
  toolLabel: { color: '#121212', fontSize: 10 },
  toolLabelActive: { color: '#FFFFFF', fontWeight: '700' },

  overlayWrap: {
    position: 'absolute', left: 0, right: 0, height: OVERLAY_HEIGHT,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderTopLeftRadius: 14, borderTopRightRadius: 14,
    paddingTop: 8, paddingBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 16,
  },
  overlayHandle: {
    alignSelf: 'center', width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)', marginBottom: 10,
  },
  thumb: {
    width: 78, height: 108, borderRadius: 10, overflow: 'hidden', backgroundColor: '#222',
  },
  thumbImg: { width: '100%', height: '100%', opacity: 1 },
});
