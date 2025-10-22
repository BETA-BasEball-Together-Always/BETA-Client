// EditScreen.jsx
import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Image, ImageBackground, StyleSheet,
  Dimensions, FlatList, Animated, Easing, PanResponder,
  ScrollView
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

const FRAME_OPTIONS = [
  { id: '2x2', label: '2×2' },
  { id: '1x4', label: '1×4' },
];

export default function EditScreen() {
  const insets = useSafeAreaInsets();
  const store = photoBoothStore();
  const { selectedTeam, selectedFrame, capturedPhotos } = store;

  const [activeTool, setActiveTool] = useState('photo'); // 'photo' | 'frame' | 'sticker' | 'text' | 'none'
  const [bottomBarH, setBottomBarH] = useState(86);

  // 편집용 로컬 사진(교체 반영)
  const [photosLocal, setPhotosLocal] = useState(() => capturedPhotos.slice(0, 4));
  useEffect(() => { setPhotosLocal(capturedPhotos.slice(0, 4)); }, [capturedPhotos]);

  // 현재 프레임 슬롯 중 교체 대상
  const [selectedSlot, setSelectedSlot] = useState(null);

  const teamKey = selectedTeam?.teamKey ?? 'base';
  const frameKey = selectedFrame?.id ?? '2x2';

  // 프레임 이미지
  const frameSource = useMemo(() => {
    const theme = FRAMES[teamKey] || FRAMES.base;
    return theme?.[frameKey] || FRAMES.base?.[frameKey] || null;
  }, [teamKey, frameKey]);

  // 프레임 크기/비율
  const frameW = width * 0.9;
  const frameH = height * 0.7;
  const aspect = frameKey === '1x4' ? 1 / 3 : 2 / 3; // 1x4=1:3, 2x2=2:3
  const frameStyle = frameKey === '1x4'
    ? { height: frameH, aspectRatio: aspect }
    : { width: frameW, aspectRatio: aspect };

  // 슬롯 좌표
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
    // 필요시 store 반영: photoBoothStore.getState().setCapturedPhotos(photosLocal);
  };

  // ── 오버레이 애니메이션/드래그 ──
  const overlayY = useRef(new Animated.Value(HIDDEN_Y)).current;
  const currentY = useRef(0);
  const isOverlayOpen = activeTool === 'photo' || activeTool === 'frame' || activeTool === 'sticker';

  useEffect(() => {
    Animated.timing(overlayY, {
      toValue: isOverlayOpen ? 0 : HIDDEN_Y,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isOverlayOpen, overlayY]);

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

  // 프레임 슬롯 탭 → 교체 대상 선택 + 사진 탭 표시
  const onPressFramePhoto = (idx) => {
    setSelectedSlot(idx);
    setActiveTool('photo');
  };

  // 사진 썸네일 탭 → 선택 슬롯 교체 후 선택 해제
  const onPressThumb = (uri) => {
    if (selectedSlot === null) return;
    setPhotosLocal(prev => {
      const next = [...prev];
      next[selectedSlot] = uri;
      return next;
    });
    setSelectedSlot(null);
  };

  // 프레임 옵션 카드
  const FrameOptionCard = ({ id, label }) => {
    const src = (FRAMES[teamKey] || FRAMES.base)?.[id] || FRAMES.base[id];
    const active = frameKey === id;
    return (
      <TouchableOpacity
        onPress={() => store.setSelectedFrame({ id, name: id })}
        activeOpacity={0.9}
        style={[styles.frameCard, active && styles.frameCardActive]}
      >
        <Image source={src} style={styles.frameCardImg} resizeMode="contain" />
        <Text style={[styles.frameCardLabel, active && styles.frameCardLabelActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  // 오버레이 콘텐츠 스위치
const renderOverlayContent = () => {
  // 1️⃣ 프레임
  if (activeTool === 'frame') {
    return (
      <View style={styles.frameOptionsRow}>
        {FRAME_OPTIONS.map(opt => (
          <FrameOptionCard key={opt.id} id={opt.id} label={opt.label} />
        ))}
      </View>
    );
  }

  // 2️⃣ 스티커
  if (activeTool === 'sticker') {
    const stickers = [
      require('../../../assets/images/PhotoBooth/Stickers/icon1.png'),
      require('../../../assets/images/PhotoBooth/Stickers/icon2.png'),
      require('../../../assets/images/PhotoBooth/Stickers/icon3.png'),
      require('../../../assets/images/PhotoBooth/Stickers/icon4.png'),
      require('../../../assets/images/PhotoBooth/Stickers/icon5.png'),
      require('../../../assets/images/PhotoBooth/Stickers/icon6.png'),
      require('../../../assets/images/PhotoBooth/Stickers/icon7.png'),
      require('../../../assets/images/PhotoBooth/Stickers/icon8.png'),
      require('../../../assets/images/PhotoBooth/Stickers/textbubble1.png'),
      require('../../../assets/images/PhotoBooth/Stickers/textbubble2.png'),
      require('../../../assets/images/PhotoBooth/Stickers/textbubble3.png'),
      require('../../../assets/images/PhotoBooth/Stickers/textbubble4.png'),
      require('../../../assets/images/PhotoBooth/Stickers/textbubble5.png'),
      require('../../../assets/images/PhotoBooth/Stickers/textbubble6.png'),
    ];

    const onPressSticker = (src) => {
      console.log('스티커 선택:', src);
      // TODO: 선택 시 프레임 위에 스티커 추가 로직 연결
    };

    return (
      <ScrollView
        style={styles.stickerScroll}
        contentContainerStyle={styles.stickerContainer}
        showsVerticalScrollIndicator={false}
      >
        {stickers.map((src, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.stickerItem}
            onPress={() => onPressSticker(src)}
            activeOpacity={0.8}
          >
            <Image source={src} style={styles.stickerImg} resizeMode="contain" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  // 3️⃣ 기본: 사진
  return (
    <FlatList
      horizontal
      data={capturedPhotos.slice(0, 4)}
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
  );
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

      {/* 캔버스 */}
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
                {selectedSlot === i && <View style={styles.selectedOverlay} pointerEvents="none" />}
              </TouchableOpacity>
            ))}
          </ImageBackground>
        ) : (
          <Text style={{ color: '#aaa' }}>프레임 이미지를 찾을 수 없어요</Text>
        )}
      </View>

      {/* 오버레이 (사진/프레임 공용) */}
      <Animated.View
        pointerEvents={isOverlayOpen ? 'auto' : 'none'}
        style={[
          styles.overlayWrap,
          { transform: [{ translateY: overlayY }], bottom: bottomBarH },
        ]}
      >
        <View style={styles.overlayHandle} {...panResponder.panHandlers} />
        {renderOverlayContent()}
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

  canvasArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frameBox: { position: 'relative', overflow: 'hidden' },
  photo: { position: 'absolute' },

  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(128,128,128,0.45)',
    borderRadius: 6,
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'black',
  },
  toolItem: { alignItems: 'center', justifyContent: 'center' },
  toolLabel: { color: '#121212', fontSize: 10 },
  toolLabelActive: { color: '#FFFFFF', fontWeight: '700' },

  overlayWrap: {
    position: 'absolute',
    left: 0, right: 0,
    height: OVERLAY_HEIGHT,
    backgroundColor: 'rgba(0,0,0,0.6)',   // 60% 투명
    borderTopLeftRadius: 14, borderTopRightRadius: 14,
    paddingTop: 8, paddingBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: -4 },
    elevation: 16,
  },
  overlayHandle: {
    alignSelf: 'center',
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)', marginBottom: 10,
  },

  // 사진 썸네일
  thumb: { width: 78, height: 108, borderRadius: 10, overflow: 'hidden', backgroundColor: '#222' },
  thumbImg: { width: '100%', height: '100%', opacity: 1 },

  // 프레임 옵션
  // frameOptionsRow: {
  //   flexDirection: 'row',
  //   paddingHorizontal: 16,
  //   gap: 12,
  // },
  frameOptionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly', // ← 좌우 여백 포함 균등 정렬
    width: '100%',
    paddingHorizontal: 16,
  },

  frameCard: {
    width: 108,
    height: 128,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  frameCardActive: {
    backgroundColor: '#FFFFFF',
  },
  frameCardImg: { width: '100%', height: 90 },
  frameCardLabel: { marginTop: 6, fontSize: 12, color: '#BDBDBD' },
  frameCardLabelActive: { color: '#000', fontWeight: '700' },
  // 스티커 오버레이 관련
  stickerScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    rowGap: 12,
    columnGap: 12,
    paddingBottom: 24,
  },
  stickerItem: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerImg: {
    width: '80%',
    height: '80%',
  },  
});
