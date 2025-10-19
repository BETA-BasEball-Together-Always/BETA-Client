// CameraScreen.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import photoBoothStore from '../../../stores/photoBoothStore';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';

// ▼▼▼ SVG 아이콘 임포트 ▼▼▼
import BackIcon from '../../../assets/images/PhotoBooth/Camera/Icons/BackArrow.svg';
import FlashOffIcon from '../../../assets/images/PhotoBooth/Camera/Icons/FlashOff.svg';
import FlashOnIcon  from '../../../assets/images/PhotoBooth/Camera/Icons/FlashOn.svg'; // on/auto 공용
import TimerManualIcon from '../../../assets/images/PhotoBooth/Camera/Icons/TimerOff.svg';
import Timer1sIcon from '../../../assets/images/PhotoBooth/Camera/Icons/Timer1s.svg';
import Timer3sIcon    from '../../../assets/images/PhotoBooth/Camera/Icons/Timer3s.svg';
import Timer5sIcon    from '../../../assets/images/PhotoBooth/Camera/Icons/Timer5s.svg';
import BeautyOffIcon  from '../../../assets/images/PhotoBooth/Camera/Icons/BeautyOff.svg';
import BeautyOnIcon   from '../../../assets/images/PhotoBooth/Camera/Icons/BeautyOn.svg';
import SwitchBtnIcon from '../../../assets/images/PhotoBooth/Camera/Icons/SwitchBtn.svg';

// CameraScreen.jsx 상단 import들 아래 아무 곳에 추가
function IconWithLabel({ onPress, children, text, color = '#FFF' }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.topIcon} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {children}
        {!!text && <Text style={[styles.topIconLabel, { color }]}>{text}</Text>}
      </View>
    </TouchableOpacity>
  );
}


export default function CameraScreen({ navigation, route }) {
  // const { frameType = '2x2' } = route?.params ?? {};
  const { selectedFrame } = photoBoothStore();
  const insets = useSafeAreaInsets();
  console.log("selectedFrame: ", selectedFrame);
  // permission
  const { hasPermission, requestPermission } = useCameraPermission();
  useEffect(() => { if (!hasPermission) requestPermission(); }, [hasPermission, requestPermission]);

  // camera
  const [cameraPosition, setCameraPosition] = useState('front'); // 'front' | 'back'
  const device = useCameraDevice(cameraPosition);
  const cameraRef = useRef(null);

  // states
  const [flash, setFlash] = useState('off');           // 'off' | 'on' | 'auto'  (on/auto 동일 아이콘)
  const [timerMode, setTimerMode] = useState('manual'); // 'manual' | '1s' | '3s' | '5s'
  const [beauty, setBeauty] = useState(false);

  const [isShooting, setIsShooting] = useState(false);
  const [photos, setPhotos] = useState([]); // VisionCamera PhotoFile[]
  const [countdown, setCountdown] = useState(0);

  const flashOverlayOpacity = useSharedValue(0);
  const zoomAnim = useSharedValue(1);  

  // aspect
  const { width: screenW } = Dimensions.get('window');
  const previewAspect = useMemo(() => {
    if (!selectedFrame?.name) return 7 / 10; // 기본값 (예방용)

    // selectedFrame에 따라 다른 비율 적용
    if (selectedFrame?.name === '2x2') return 7 / 10; // 세로형
    if (selectedFrame?.name === '1x4') return 10 / 7; // 가로형

    // 혹시 다른 프레임 타입이 추가될 경우 대비
    return 7 / 10;
  }, [selectedFrame]);

  const previewHeight = useMemo(() => screenW / previewAspect, [screenW, previewAspect]);


  // timer helpers
  const nextTimerMode = useCallback(() => {
    setTimerMode(prev => (prev === 'manual' ? '1s' : prev === '1s' ? '3s' : prev === '3s' ? '5s' : 'manual'));
  }, []);
  const timerSeconds = useMemo(() => (timerMode === '1s' ? 1 : timerMode === '3s' ? 3 : timerMode === '5s' ? 5 : 0), [timerMode]);


  const OFF = '#666666';
  const ON = '#FFFFFF';

  // 플래시: off/on/auto -> Off/On/Auto
  const flashText  = flash === 'off' ? 'Off' : flash === 'on' ? 'On' : 'Auto';
  const flashColor = flash === 'off' ? OFF : ON;

  // 타이머: manual/1s/3s/5s -> Off/1초/3초/5초
  const timerText = timerMode === 'manual' ? 'Off'
                  // : timerMode === '1s'     ? '1초'
                  // : timerMode === '3s'     ? '3초'
                  : '타이머';
  const timerColor = timerMode === 'manual' ? OFF : ON;

  // 뷰티: boolean -> Off/On
  const beautyText  = beauty ? 'On' : 'Off';
  const beautyColor = beauty ? ON : OFF;


  // --- 아이콘 선택기 ---
  const FlashIconComp = flash === 'off' ? FlashOffIcon : FlashOnIcon; // on/auto 동일
  const TimerIconComp = timerMode === 'manual' ? TimerManualIcon
                        : timerMode === '1s'   ? Timer1sIcon
                        : timerMode === '3s'   ? Timer3sIcon
                        : Timer5sIcon;
  const BeautyIconComp = beauty ? BeautyOnIcon : BeautyOffIcon;

  // 촬영
  const actuallyTake = useCallback(async () => {
    if (!cameraRef.current) return null;
    try {
      flashOverlayOpacity.value = 1;
      flashOverlayOpacity.value = withDelay(50, withTiming(0, { duration: 250 }));

      // ✅ 촬영 순간 살짝 줌인
      zoomAnim.value = withTiming(1.05, { duration: 100 }, () => {
        zoomAnim.value = withTiming(1, { duration: 150 });
      });

      const photo = await cameraRef.current.takePhoto({
        flash, // 'on' | 'off' | 'auto'
        enableShutterSound: true,
        qualityPrioritization: 'quality',
      });
      return photo;
    } catch (e) {
      console.warn('takePhoto error', e);
      return null;
    }
  }, [flash]);

  const flashOverlayStyle = useAnimatedStyle(() => ({
    opacity: flashOverlayOpacity.value,
  }));

  const zoomStyle = useAnimatedStyle(() => ({
    transform: [{ scale: zoomAnim.value }],
  }));  

  const takeOne = useCallback(async () => {
    if (isShooting) return;
    setIsShooting(true);
    const p = await actuallyTake();
    if (p) setPhotos(prev => [...prev, p]);
    setIsShooting(false);
  }, [actuallyTake, isShooting]);

  const startAutoSequence = useCallback(async () => {
    if (isShooting) return;
    setIsShooting(true);
    try {
      let remain = 4 - photos.length;
      while (remain > 0) {
        for (let s = timerSeconds; s > 0; s--) {
          setCountdown(s);
          // eslint-disable-next-line no-await-in-loop
          await new Promise(r => setTimeout(r, 1000));
        }
        setCountdown(0);
        // eslint-disable-next-line no-await-in-loop
        const p = await actuallyTake();
        if (p) setPhotos(prev => [...prev, p]);
        remain -= 1;
        if (remain > 0) {
          // eslint-disable-next-line no-await-in-loop
          await new Promise(r => setTimeout(r, 300));
        }
      }
    } finally {
      setCountdown(0);
      setIsShooting(false);
    }
  }, [isShooting, photos.length, timerSeconds, actuallyTake]);

  const onPressShutter = useCallback(() => {
    if (timerMode === 'manual') takeOne();
    else startAutoSequence();
  }, [timerMode, takeOne, startAutoSequence]);

  // 4장 완료 → 편집으로
  useEffect(() => {
    if (photos.length === 4) {
      navigation.replace('EditScreen', { photos });
    }
  }, [photos, navigation, selectedFrame]);

  if (!hasPermission || !device) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator />
        <Text style={{ color: '#fff', marginTop: 8 }}>카메라 준비 중…</Text>
      </View>
    );
  }

  // --- 렌더 ---
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* TopBar with SVG */}
      
      {/* 기존 <SvgButton>들을 아래처럼 교체 */}
      <View style={styles.topBar}>
        {/* Back: 라벨 필요 없으면 text="" 그대로 두면 됨 */}
        <IconWithLabel onPress={() => navigation.goBack()} text="" color={ON}>
          <BackIcon width={24} height={24} />
        </IconWithLabel>

        {/* Flash: on/auto 같은 SVG, 라벨/색상은 상태에 따라 */}
        <IconWithLabel onPress={() => setFlash(prev => (prev === 'off' ? 'on' : prev === 'on' ? 'auto' : 'off'))}
                      text={flashText} color={flashColor}>
          <FlashIconComp width={24} height={24} />
        </IconWithLabel>

        {/* Timer */}
        <IconWithLabel onPress={nextTimerMode} text={timerText} color={timerColor}>
          <TimerIconComp width={28} height={28} />
        </IconWithLabel>

        {/* Beauty */}
        <IconWithLabel onPress={() => setBeauty(b => !b)} text={beautyText} color={beautyColor}>
          <BeautyIconComp width={26} height={26} />
        </IconWithLabel>
      </View>


      {/* Preview */}
      <View style={[styles.previewWrap, { height: previewHeight }]}>
        <Animated.View style={[StyleSheet.absoluteFill, zoomStyle]}>   
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive
            photo
            enableZoomGesture
          />
        </Animated.View>     
        {/* Flash overlay animation */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: '#fff' },
            flashOverlayStyle,
          ]}
        />
        {/* Beauty overlay - 간단한 밝기 효과 (원하면 제거 가능) */}
        {beauty && <View pointerEvents="none" style={styles.beautyOverlay} />}

        {/* Countdown */}
        {countdown > 0 && (
          <View style={styles.countdownWrap}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}
        {/* ✅ stageGuide는 요청대로 제거됨 */}
      </View>

      {/* BottomBar (썸네일/셔터/전환) */}
      <View style={styles.bottomBar}>
        <View style={styles.indicatorArea}>
          {photos.length > 0 ? (
            <View style={styles.thumbWrap}>
              <Image
                source={{ uri: Platform.OS === 'android' ? `file://${photos[photos.length - 1].path}` : photos[photos.length - 1].path }}
                style={styles.thumb}
              />
            </View>
          ) : (
            <View style={styles.thumbPlaceholder} />
          )}
          <Text style={styles.orderText}>{photos.length > 0 ? `${photos.length} / 4` : ' '}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressShutter}
          disabled={isShooting}
          style={[styles.shutterOuter, isShooting && { opacity: 0.7 }]}
        >
          <View style={styles.shutterInner} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchBtn}
          onPress={() => setCameraPosition(p => (p === 'front' ? 'back' : 'front'))}
          disabled={isShooting}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <SwitchBtnIcon width={52} height={52} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------- 공용 SVG 버튼 ---------- */
function SvgButton({ onPress, children }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.topIcon} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      {children}
    </TouchableOpacity>
  );
}

/* ---------- 스타일 ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0B' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0B0B' },

  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    justifyContent: 'space-between',
  },
  topIcon: { minWidth: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  previewWrap: { width: '100%', alignSelf: 'center', overflow: 'hidden', backgroundColor: '#000' },
  beautyOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff', opacity: 0.08 },
  countdownWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  countdownText: { fontSize: 96, fontWeight: '700', color: '#fff' },

  bottomBar: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 22, paddingBottom: 24 },
  indicatorArea: { position: 'absolute', left: 22, bottom: 24, alignItems: 'center', width: 64 },
  thumbWrap: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: '#fff' },
  thumb: { width: '100%', height: '100%' },
  thumbPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)' },
  orderText: { color: '#fff', marginTop: 6, fontSize: 12 },

  shutterOuter: { alignSelf: 'center', width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' },

  switchBtn: { position: 'absolute', right: 22, bottom: 40},

  // styles에 아래 두 줄만 추가/수정
  topIcon: {
    minWidth: 56,           // 라벨까지 여유 있게
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topIconLabel: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 12,
    // color는 동적으로 주입
  },
});
