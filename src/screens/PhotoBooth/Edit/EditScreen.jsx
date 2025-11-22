// EditScreen.jsx
import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Image, ImageBackground, StyleSheet,
  Dimensions, FlatList, Animated, Easing, PanResponder,
  ScrollView,
  Pressable,
  TextInput
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import photoBoothStore from '../../../stores/photoBoothStore';
import { FRAMES } from '../../../utils/framesMap';
import ImagesIcon   from './assets/tab/images.svg';
import FramesIcon   from './assets/tab/frames.svg';
import StickersIcon from './assets/tab/stickers.svg';
import TextIcon     from './assets/tab/text.svg';
import icon1 from './assets/stickers/icon1.svg';
import icon2 from './assets/stickers/icon2.svg';
import icon3 from './assets/stickers/icon3.svg';
import icon4 from './assets/stickers/icon4.svg';
import icon5 from './assets/stickers/icon5.svg';
import icon6 from './assets/stickers/icon6.svg';
import icon7 from './assets/stickers/icon7.svg';
import icon8 from './assets/stickers/icon8.svg';
import textbubble1 from './assets/stickers/textbubble1.svg';
import textbubble2 from './assets/stickers/textbubble2.svg';
import textbubble3 from './assets/stickers/textbubble3.svg';
import textbubble4 from './assets/stickers/textbubble4.svg';
import textbubble5 from './assets/stickers/textbubble5.svg';
import textbubble6 from './assets/stickers/textbubble6.svg';
import { useNavigation } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';


const { width, height } = Dimensions.get('window');
// 탭에 따라 달라지는 오버레이 높이
// 텍스트 탭도 버튼이 커서 살짝 여유 있게
const getOverlayHeight = (tool) =>
  tool=== 'photo'? 140 : (tool === 'text' ? 100 : (tool === 'sticker' ? 250 : 150));const SNAP_THRESHOLD = 48;

const FRAME_OPTIONS = [
  { id: '2x2', label: '2×2' },
  { id: '1x4', label: '1x4' },
];


// ✅ 편집 화면에서 사용할 5개 폰트(Expo Font loadAsync의 key와 동일해야 함)
const FONT_FAMILY_OPTIONS = [
  { key: 'NotoSansKR_Regular',     label: 'Noto Sans KR', family: 'NotoSansKR_Regular' },
  { key: 'Surround_Bold',  label: 'Surround',     family: 'Surround_Bold' },
  { key: 'Dohyeon_Regular',label: 'Do Hyeon',     family: 'Dohyeon_Regular' },
  { key: 'Myungjo_Medium', label: 'Myungjo',      family: 'Myungjo_Medium' },
  { key: 'MeetMe_Regular', label: 'Meet Me',      family: 'MeetMe_Regular' },
];
const TEXT_COLORS = ['#FFFFFF', '#C1C1C1', '#000000', '#E84A5F', '#FFF280', '#9ED4FF', '#C6A3FF', '#FFC8D8'];

export default function EditScreen() {
  const navigation = useNavigation();
  const viewShotRef = useRef(null);  
  const insets = useSafeAreaInsets();
  const store = photoBoothStore();
  const { selectedTeam, selectedFrame, capturedPhotos } = store;

  const [activeTool, setActiveTool] = useState('photo'); // 'photo' | 'frame' | 'sticker' | 'text' | 'none'
  const [bottomBarH, setBottomBarH] = useState(86);

  // 스티커 상태
  const [stickers, setStickers] = useState([]); // { id, src, x, y, scale, rotation, size }[]
  const [selectedStickerId, setSelectedStickerId] = useState(null);
 
  // ─ 텍스트 상태 ─
  const [texts, setTexts] = useState([]); // { id, text, x, y, scale, rotation, size, color, weight }[]
  const [selectedTextId, setSelectedTextId] = useState(null);  
  const draftsRef = useRef(new Map()); // id -> latest draft string  

  const [editingTextId, setEditingTextId] = useState(null);
  
  const selectSticker = React.useCallback((id) => {
    if (editingTextId) {
      const draft = draftsRef.current.get(editingTextId);
      commitEditText(
        editingTextId,
        draft ?? (texts.find(t => t.id === editingTextId)?.text ?? '')
      );
    }
    setSelectedStickerId(id);
    setSelectedTextId(null);
    setEditingTextId(null);
    setSelectedSlot(null);
  }, [editingTextId, texts]);

  const selectText = React.useCallback((id) => {
    // 다른 텍스트 편집 중이면 먼저 저장
    if (editingTextId && editingTextId !== id) {
      const draft = draftsRef.current.get(editingTextId);
      commitEditText(editingTextId, draft ?? (texts.find(t => t.id === editingTextId)?.text ?? ''));
    }
    setSelectedTextId(id);
    setSelectedStickerId(null);
    setSelectedSlot(null);
  }, [editingTextId, texts]);

  // 탭 전환 시 선택 상태 정리 (슬롯 보존 옵션)
  const changeTool = React.useCallback((tool, opts = {}) => {
    const { preserveSlot = false, preserveSelection = false } = opts;
    // 편집 중 자동 저장은 'text'로 전환할 때는 하지 않음 (편집 진입 용도)
    if (editingTextId && tool !== 'text') {
      const draft = draftsRef.current.get(editingTextId);
      commitEditText(
        editingTextId,
        draft ?? (texts.find(t => t.id === editingTextId)?.text ?? '')
      );
    }
    if (!preserveSelection) {
      setSelectedStickerId(null);
      setSelectedTextId(null);
      setEditingTextId(null);
    }
    if (!preserveSlot) setSelectedSlot(null);
    setActiveTool(tool);
  }, [editingTextId, texts]);

  // 편집 시작: 현재 텍스트를 draft에 초기화
  const startEditText = (id) => {
    // 텍스트 편집 시작: 선택을 보장, 스티커 해제, 탭은 'text'로
    setSelectedTextId(id);
    setSelectedStickerId(null);
    setEditingTextId(id);
    const cur = texts.find(t => t.id === id)?.text ?? '';
    draftsRef.current.set(id, cur);    
    changeTool('text', { preserveSlot: true, preserveSelection: true });
  };

  const commitEditText = (id, newText) => {
    setTexts(prev => prev.map(x => x.id === id ? { ...x, text: newText } : x));
    setEditingTextId(null);
  };

  const saveAndClearEditing = React.useCallback(() => {
    if (editingTextId) {
      // ✅ draftRef에 최신 입력값이 있으면 무조건 그걸로 저장
      const latestDraft = draftsRef.current.get(editingTextId);
      const fallback = texts.find(t => t.id === editingTextId)?.text ?? '';
      const finalText = latestDraft !== undefined ? latestDraft : fallback;
      commitEditText(editingTextId, finalText);
    }
    setSelectedTextId(null);
    setSelectedStickerId(null);
    setSelectedSlot(null);
  }, [editingTextId, texts]); 

  const cancelEditText = () => {
    // ❌ 사용자가 '취소' 버튼을 직접 누른 경우에만 원래 텍스트로 복원
    if (editingTextId) {
      const original = texts.find(t => t.id === editingTextId)?.text ?? '';
      commitEditText(editingTextId, original);
    }
    setEditingTextId(null);
  };

  // 텍스트 선택 패널일 때 높이(스크린샷 느낌) 우선 적용
  const isTextStylePanel = selectedTextId !== null;
  // 현재 탭 기준 오버레이 높이/숨김 Y
  const overlayHeight = isTextStylePanel ? 160 : getOverlayHeight(activeTool);
  const hiddenY = overlayHeight + 24;
    
  const hiddenYRef = useRef(hiddenY);
  useEffect(() => { hiddenYRef.current = hiddenY; }, [hiddenY]);  



  const selectedText = useMemo(
    () => texts.find(t => t.id === selectedTextId) || null,
    [texts, selectedTextId]
  );

   // 프레임 박스 레이아웃(스티커 기본 위치/좌표 계산용)
   const [frameLayout, setFrameLayout] = useState({ x: 0, y: 0, w: 0, h: 0 });

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
  const frameW = width * 1;
  const frameH = height * 0.8;
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
      { top: '4.5%',  left: '5.7%',  width: '42.5%', height: '40.3%' },
      { top: '4.5%',  right: '5.7%', width: '42.5%', height: '40.3%' },
      { bottom: '12.5%', left: '5.7%',  width: '42.5%', height: '40.3%' },
      { bottom: '12.5%', right: '5.7%', width: '42.5%', height: '40.3%' },
    ];
  }, [frameKey]);

  const handleSave = async () => {
    try {
      // 편집 중이면 먼저 저장 반영
      saveAndClearEditing();
      // 프레임 박스만 캡쳐 (png 권장, 품질 1.0)
      const uri = await viewShotRef.current?.capture?.({
        format: 'png',
        quality: 1.0,
        result: 'tmpfile', // 임시 파일 (갤러리 저장 아님)
      });
      if (!uri) return;
      // 전역 저장
      store.setExportedFrameUri(uri);
      // 공유 화면으로 이동 (필요하면 파라미터도 같이 전달 가능)
      navigation.navigate('Share'); // 네비게이터의 라우트 이름에 맞춰 수정
    } catch (e) {
      console.warn('[EditScreen] viewshot failed:', e);
    }
  };

  // ── 오버레이 애니메이션/드래그 ──
  // 처음엔 닫힌 상태로 시작
  const overlayY = useRef(new Animated.Value(hiddenY)).current;  
  const currentY = useRef(0);
  const isOverlayOpen = ['photo', 'frame', 'sticker', 'text'].includes(activeTool) || selectedTextId !== null;

  const showHandle = activeTool === 'sticker';

  // 탭/높이 변경 시 새 hiddenY에 맞춰 열림/닫힘 목표값 갱신
  useEffect(() => {
    Animated.timing(overlayY, {
      toValue: isOverlayOpen ? 0 : hiddenY,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isOverlayOpen, hiddenY, overlayY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 2,
      onPanResponderGrant: () => overlayY.stopAnimation(v => { currentY.current = v; }),
      onPanResponderMove: (_, g) => {
        const next = Math.min(hiddenYRef.current, Math.max(0, currentY.current + g.dy));        
        overlayY.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const shouldClose = g.dy > SNAP_THRESHOLD || currentY.current + g.dy > hiddenYRef.current * 0.5;
        Animated.timing(overlayY, {
          toValue: shouldClose ? hiddenYRef.current : 0,
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
    saveAndClearEditing(); // 편집 중이면 저장 후 해제
    setSelectedSlot(idx);
    changeTool('photo', { preserveSlot: true }); 
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

  function TextStylePanel() {
    if (!selectedText) return null;

    const onPickColor = (c) => {
      setTexts(prev =>
        prev.map(x =>
          x.id === selectedText.id ? { ...x, color: c } : x
        )
      );
    };

    const onPickFamily = (family) => {
      setTexts(prev =>
        prev.map(x =>
          x.id === selectedText.id ? { ...x, fontFamily: family } : x
        )
      );
    };

    return (
      <View style={styles.textPanelWrap}>
        {/* ✅ 폰트 선택 (이전 '서체') */}
        <View style={[styles.textPanelRow, { marginBottom: 10 }]}>
          <Text style={styles.panelTitle}>폰트</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.fontRow}
          >
            {FONT_FAMILY_OPTIONS.map(opt => {
              const active = selectedText.fontFamily === opt.family;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => onPickFamily(opt.family)}
                  activeOpacity={0.85}
                  style={[styles.fontChip, active && styles.fontChipActive]}
                >
                  <Text
                    style={[
                      styles.fontChipLabel,
                      active && styles.fontChipLabelActive,
                      { fontFamily: opt.family },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ✅ 색상 선택 */}
        <View style={[styles.textPanelRow, { marginTop: 8 }]}>
          <Text style={styles.panelTitle}>색상</Text>
          <View style={styles.colorRow}>
            {TEXT_COLORS.map((c) => {
              const active = selectedText.color?.toLowerCase() === c.toLowerCase();
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => onPickColor(c)}
                  activeOpacity={0.8}
                  style={[
                    styles.swatch,
                    { backgroundColor: c },
                    active && styles.swatchActive,
                  ]}
                />
              );
            })}
            {/* <View style={styles.moreBox}>
              <Text style={styles.moreText}>more</Text>
            </View> */}
          </View>
        </View>
      </View>
    );
  }

  // 오버레이 콘텐츠 스위치
  const renderOverlayContent = () => {
    // 텍스트가 선택된 경우: 스타일 패널 우선
    if (isTextStylePanel) {
      return <TextStylePanel />;
    }

    // 1️⃣ 사진
    if (activeTool === 'photo') {
      return (
        <FlatList
          horizontal
          data={capturedPhotos.slice(0, 4)}
          keyExtractor={(u, idx) => `${u}-${idx}`}
          contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center' }}
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
    }

    // 2️⃣ 프레임
    if (activeTool === 'frame') {
      return (
        <View style={styles.frameOptionsRow}>
          {FRAME_OPTIONS.map(opt => (
            <FrameOptionCard key={opt.id} id={opt.id} label={opt.label} />
          ))}
        </View>
      );
    }

    //  3️⃣스티커 (SVG로 교체)
    if (activeTool === 'sticker') {
      // 실제 프로젝트 경로/파일명에 맞춰 SVG 컴포넌트 목록을 구성
      const svgStickerComps = [
        icon1,icon2,icon3,icon4,icon5,icon6,icon7,icon8,textbubble1,textbubble2,textbubble3,textbubble4,textbubble5,textbubble6
        // 필요에 따라 더 추가
      ];

      const onPressStickerSvg = (SvgComp) => {
        const id = Date.now().toString();
        const baseSize = 80;
        const cx = frameLayout.w ? frameLayout.w / 2 : 120;
        const cy = frameLayout.h ? frameLayout.h / 2 : 120;

        setStickers((prev) => [
          ...prev,
          {
            id,
            kind: 'svg',
            Svg: SvgComp,
            x: cx,
            y: cy,
            scale: 1,
            rotation: 0,
            size: baseSize,
          },
        ]);
        setSelectedStickerId(id);
        setSelectedTextId(null);   // ⬅️ 추가
        // setActiveTool('none');
      };

      return (
        <View style={{flex:1, width: '100%', justifyContent: 'center'}}>
          <ScrollView
            style={styles.stickerScroll}
            contentContainerStyle={styles.stickerContainer}
            showsVerticalScrollIndicator={false}
          >
            {svgStickerComps.map((SvgComp, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.stickerItem}
                onPress={() => onPressStickerSvg(SvgComp)}
                activeOpacity={0.8}
              >
                {/* 썸네일은 SVG 컴포넌트를 그대로 축소 렌더 */}
                <SvgComp width={40} height={40} preserveAspectRatio="xMidYMid meet" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      );
    }

    // 4️⃣ 텍스트
    if (activeTool === 'text') {
      const onAddText = () => {
        const id = Date.now().toString();
        const baseSize = 160; // 텍스트 박스 기준 사이즈(스케일 기준점)
        const cx = frameLayout.w ? frameLayout.w / 2 : 140;
        const cy = frameLayout.h ? frameLayout.h / 2 : 140;
        setTexts(prev => [
          ...prev,
          {
            id,
            text: '텍스트 입력',
            x: cx,
            y: cy,
            scale: 1,
            rotation: 0,
            size: baseSize,
            color: '#FFFFFF',
            fontFamily: 'NotoSansKR_Regular', // ✅ 기본 서체            
          },
        ]);
        setSelectedTextId(id);
        setSelectedStickerId(null);
        // 필요시 오버레이 닫기
        // setActiveTool('none');
      };

      return (
        <View style={{ flex: 1, paddingHorizontal: width*0.06, justifyContent: 'center', width: '100%'}}>
          <TouchableOpacity style={styles.addTextButton} onPress={onAddText} activeOpacity={0.85}>
            <Text style={styles.addTextPlus}>＋</Text>
            <Text style={styles.addTextLabel}>텍스트 추가</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* 상단바 */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>야구네컷 편집</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.saveText}>완료</Text>
        </TouchableOpacity>
      </View>

      {/* 캔버스 */}
      <Pressable 
        style={styles.canvasArea} 
        onPress={() => {
          saveAndClearEditing();
        }}
      >    
        <ViewShot
          ref={viewShotRef}
          style={[styles.frameBox, frameStyle]}
          options={{ format: 'png', quality: 1 }}
        >
          {frameSource ? (
            <ImageBackground
              source={frameSource}
              style={StyleSheet.absoluteFill}
              resizeMode="contain"
              onLayout={(e) => {
                const { x, y, width: w, height: h } = e.nativeEvent.layout;
                setFrameLayout({ x, y, w, h });
              }}
            >
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
            <View style={{ flex:1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{ color: '#aaa'}}>프레임 이미지를 찾을 수 없어요</Text>
            </View>
            
          )}
          {/* 스티커들 */}
          {stickers.map((st) => (
            <StickerItem
              key={st.id}
              item={st}
              selected={selectedStickerId === st.id}
              onSelect={() => selectSticker(st.id)}
              onUpdate={(patch) => {
                setStickers((prev) => prev.map(s => s.id === st.id ? { ...s, ...patch } : s));
              }}
              onDelete={() => {
                setStickers((prev) => prev.filter(s => s.id !== st.id));
                if (selectedStickerId === st.id) setSelectedStickerId(null);
              }}
            />
          ))}    
          {/* 텍스트들 */}
          {texts.map(t => (
            <TextItem
              key={t.id}
              item={t}
              selected={selectedTextId === t.id}
              onSelect={() => selectText(t.id)}
              onUpdate={(patch) => {
                setTexts(prev => prev.map(x => x.id === t.id ? { ...x, ...patch } : x));
              }}
              onDelete={() => {
                setTexts(prev => prev.filter(x => x.id !== t.id));
                if (selectedTextId === t.id) setSelectedTextId(null);
              }}
              editing={editingTextId === t.id}
              onEditStart={() => startEditText(t.id)}
              onEditSave={(newText) => commitEditText(t.id, newText)}
              onEditCancel={() => setEditingTextId(null)}
              onDraftChange={(id, v) => { draftsRef.current.set(id, v); }}                
            />
          ))}        
        </ViewShot>   
      </Pressable>

      {/* 오버레이 (사진/프레임 공용) */}
      <Animated.View
        pointerEvents={isOverlayOpen ? 'auto' : 'none'}
        style={[
          styles.overlayWrap,
          {
            height: overlayHeight,
            transform: [{ translateY: overlayY }],
            bottom: bottomBarH,
            // 핸들이 없으면 위 여백 제거
            paddingTop: showHandle ? 8 : 0,
          },
        ]}
      >
        {showHandle && (
          <View style={styles.overlayHandle} {...panResponder.panHandlers} />
        )}        
        {renderOverlayContent()}
      </Animated.View>

      {/* 하단 툴바 */}
      <View
        style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}
        onLayout={e => setBottomBarH(e.nativeEvent.layout.height)}
      >
        <ToolItem label="사진"   Icon={ImagesIcon}   active={activeTool === 'photo'}   onPress={() => changeTool('photo')} />
        <ToolItem label="프레임" Icon={FramesIcon}   active={activeTool === 'frame'}   onPress={() => changeTool('frame')} />
        <ToolItem label="스티커" Icon={StickersIcon} active={activeTool === 'sticker'} onPress={() => changeTool('sticker')} />
        <ToolItem label="텍스트" Icon={TextIcon}     active={activeTool === 'text'}    onPress={() => changeTool('text')} />
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


/** ───────── StickerItem: 이동/스케일/회전 + 삭제 ───────── */
function StickerItem({ item, selected, onSelect, onUpdate, onDelete }) {
  const { x, y, scale, rotation, size, src, Svg, kind = 'raster' } = item;

  const pos = useRef(new Animated.ValueXY({ x, y })).current;
  const scl = useRef(new Animated.Value(scale)).current;
  const rot = useRef(new Animated.Value(rotation)).current;

  // ❗️ props ↔ Animated 값 동기화 (부모 state가 바뀌면 반영)
  useEffect(() => {
    const cur = typeof pos.x.__getValue === 'function' ? pos.x.__getValue() : x;
    if (Math.abs(cur - x) > 1e-3) pos.x.setValue(x);
  }, [x, pos.x]);
  useEffect(() => {
    const cur = typeof pos.y.__getValue === 'function' ? pos.y.__getValue() : y;
    if (Math.abs(cur - y) > 1e-3) pos.y.setValue(y);
  }, [y, pos.y]);

  useEffect(() => {
    const cur = typeof scl.__getValue === 'function' ? scl.__getValue() : scale;
    if (Math.abs(cur - scale) > 1e-3) scl.setValue(scale);
  }, [scale, scl]);

  useEffect(() => {
    const cur = typeof rot.__getValue === 'function' ? rot.__getValue() : rotation;
    if (Math.abs(cur - rotation) > 1e-3) rot.setValue(rotation);
  }, [rotation, rot]);

  const start = useRef({ x: 0, y: 0, offX: 0, offY: 0 }).current;
  const movePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        onSelect?.();
        const curPos = typeof pos.__getValue === 'function' ? pos.__getValue() : { x, y };
        const curScale = typeof scl.__getValue === 'function' ? scl.__getValue() : scale;
        const curRot   = typeof rot.__getValue === 'function' ? rot.__getValue() : rotation;
        start.x = curPos.x; start.y = curPos.y;

        const lx = evt.nativeEvent.locationX;
        const ly = evt.nativeEvent.locationY;
        const cx = size / 2, cy = size / 2;
        const localX = lx - cx, localY = ly - cy;
        const s = curScale;
        const cos = Math.cos(curRot), sin = Math.sin(curRot);
        const offX = (localX * s) * cos - (localY * s) * sin;
        const offY = (localX * s) * sin + (localY * s) * cos;
        start.offX = offX; start.offY = offY;
      },
      onPanResponderMove: (_, g) => {
        pos.setValue({ x: start.x + g.dx, y: start.y + g.dy });
      },
      onPanResponderRelease: (_, g) => {
        onUpdate?.({ x: start.x + g.dx, y: start.y + g.dy });
      },
    })
  ).current;

  const tfStart = useRef({
    v0x: 0, v0y: 0, dist0: 1, ang0: 0, scale0: 1, rot0: 0,
  }).current;

  const transformPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        onSelect?.();

        // ✅ "현재 보이는 값"을 기준으로 시작값을 설정 (초기화 방지 핵심)
        tfStart.scale0 = typeof scl.__getValue === 'function' ? scl.__getValue() : scale;
        tfStart.rot0   = typeof rot.__getValue === 'function' ? rot.__getValue() : rotation;

        // 현재 크기/회전에서의 핸들 기준 벡터 계산
        const h = (size * tfStart.scale0) / 2;
        const ang = tfStart.rot0;
        // 우하단 핸들 벡터(회전 전): (h, h)
        const cos = Math.cos(ang), sin = Math.sin(ang);
        tfStart.v0x =  h * cos - h * sin;
        tfStart.v0y =  h * sin + h * cos;

        tfStart.dist0 = Math.hypot(tfStart.v0x, tfStart.v0y);
        tfStart.ang0  = Math.atan2(tfStart.v0y, tfStart.v0x);
      },
      onPanResponderMove: (_, g) => {
        const vx = tfStart.v0x + g.dx;
        const vy = tfStart.v0y + g.dy;
        const dist = Math.max(10, Math.hypot(vx, vy));
        const ang  = Math.atan2(vy, vx);

        const scaleNew = Math.min(4, Math.max(0.3, (dist / tfStart.dist0) * tfStart.scale0));
        const rotNew   = tfStart.rot0 + (ang - tfStart.ang0);

        scl.setValue(scaleNew);
        rot.setValue(rotNew);
      },
      onPanResponderRelease: (_, g) => {
        const vx = tfStart.v0x + g.dx;
        const vy = tfStart.v0y + g.dy;
        const dist = Math.max(10, Math.hypot(vx, vy));
        const ang  = Math.atan2(vy, vx);
        const scaleNew = Math.min(4, Math.max(0.3, (dist / tfStart.dist0) * tfStart.scale0));
        const rotNew   = tfStart.rot0 + (ang - tfStart.ang0);

        // 부모 state에 최종값 기록 (다음 진입 시에도 유지)
        onUpdate?.({ scale: scaleNew, rotation: rotNew });
      },
    })
  ).current;

  const animatedStyle = {
    position: 'absolute',
    left: 0, top: 0,
    transform: [
      { translateX: Animated.subtract(pos.x, Animated.multiply(scl, size / 2)) },
      { translateY: Animated.subtract(pos.y, Animated.multiply(scl, size / 2)) },
      {
        rotate: rot.interpolate({
          inputRange: [-Math.PI, Math.PI],
          outputRange: ['-180deg', '180deg'],
        }),
      },
      { scale: scl },
    ],
  };

  return (
    <Animated.View style={[animatedStyle, { width: size, height: size }]}>
      <View
        {...movePan.panHandlers}
        style={{ width: '100%', height: '100%' }}
        collapsable={false}
      >
        {kind === 'svg' && Svg ? (
          // ✅ SVG 스티커 본체
          <Svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
        ) : (
          // (호환) 기존 래스터 스티커도 계속 지원
          <Image source={src} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        )}

        {selected && (
          <>
            <View style={styles.stickerOutline} pointerEvents="none" />
            <TouchableOpacity style={[styles.handle, styles.handleTL]} onPress={onDelete} activeOpacity={0.8}>
              <Text style={styles.handleText}>×</Text>
            </TouchableOpacity>
            <View style={[styles.handle, styles.handleBR]} {...transformPan.panHandlers}>
              <Text style={styles.handleText}>↔︎</Text>
            </View>
          </>
        )}
      </View>
    </Animated.View>
  );
}

function TextItem({
  item, selected, onSelect, onUpdate, onDelete,
  editing, onEditStart, onEditEnd, onEditCancel, onEditSave, onDraftChange
}) {
  const { id, text, x, y, scale, rotation, size, color = '#FFF', weight = '700', fontFamily = 'NotoSansKR_Regular' } = item;
  const [draft, setDraft] = useState(text);
  useEffect(() => { setDraft(text); }, [text]);
  // 편집 진입 시 부모 draft도 초기화
  useEffect(() => {
    if (editing) {
      onDraftChange?.(id, text);
    }
  }, [editing, id, text, onDraftChange]);  

  const pos = useRef(new Animated.ValueXY({ x, y })).current;
  const scl = useRef(new Animated.Value(scale)).current;
  const rot = useRef(new Animated.Value(rotation)).current;

  // 더블탭 감지
  const lastTapRef = useRef(0);
  const TAP_SLOP = 4;      // 이동 허용치
  const DBL_GAP  = 300;    // 더블탭 간격(ms)  

  // 부모 state ↔ Animated 값 동기화
  useEffect(() => {
    const cur = typeof pos.x.__getValue === 'function' ? pos.x.__getValue() : x;
    if (Math.abs(cur - x) > 1e-3) pos.x.setValue(x);
  }, [x, pos.x]);
  useEffect(() => {
    const cur = typeof pos.y.__getValue === 'function' ? pos.y.__getValue() : y;
    if (Math.abs(cur - y) > 1e-3) pos.y.setValue(y);
  }, [y, pos.y]);
  useEffect(() => {
    const cur = typeof scl.__getValue === 'function' ? scl.__getValue() : scale;
    if (Math.abs(cur - scale) > 1e-3) scl.setValue(scale);
  }, [scale, scl]);
  useEffect(() => {
    const cur = typeof rot.__getValue === 'function' ? rot.__getValue() : rotation;
    if (Math.abs(cur - rotation) > 1e-3) rot.setValue(rotation);
  }, [rotation, rot]);

  // 새 텍스트 생성 시 초기화
  const prevIdRef = useRef(id);
  useEffect(() => {
    if (prevIdRef.current !== id) {
      pos.setValue({ x, y });
      scl.setValue(scale);
      rot.setValue(rotation);
      prevIdRef.current = id;
    }
  }, [id]); // eslint-disable-line

  // 이동 제스처
  const start = useRef({ x: 0, y: 0 }).current;
  const movePan = useRef(
    PanResponder.create({
        onStartShouldSetPanResponder: () => !editing,
        onPanResponderGrant: () => {
        onSelect?.();
        const curPos = typeof pos.__getValue === 'function' ? pos.__getValue() : { x, y };
        start.x = curPos.x; start.y = curPos.y;
      },
      onPanResponderMove: (_, g) => {
        pos.setValue({ x: start.x + g.dx, y: start.y + g.dy });
      },
      onPanResponderRelease: (_, g) => {
        onUpdate?.({ x: start.x + g.dx, y: start.y + g.dy });
        const isTap = Math.abs(g.dx) < TAP_SLOP && Math.abs(g.dy) < TAP_SLOP;
        if (isTap) {
          const now = Date.now();
          // 선택된 상태에서 더블탭 → 편집 시작
          if (selected && now - lastTapRef.current < DBL_GAP) {
            onEditStart?.();
          }
          lastTapRef.current = now;
          return;
        }
        // 드래그로 간주 → 위치 저장
        onUpdate?.({ x: start.x + g.dx, y: start.y + g.dy });        
      },
    })
  ).current;

  // 크기/회전 제스처 (우하단 핸들) — 스티커와 동일
  const tfStart = useRef({ v0x: 0, v0y: 0, dist0: 1, ang0: 0, scale0: 1, rot0: 0 }).current;
  const transformPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !editing,
      onPanResponderGrant: () => {
        onSelect?.();
        tfStart.scale0 = typeof scl.__getValue === 'function' ? scl.__getValue() : scale;
        tfStart.rot0   = typeof rot.__getValue === 'function' ? rot.__getValue() : rotation;

        const h = (size * tfStart.scale0) / 2;
        const ang = tfStart.rot0;
        const cos = Math.cos(ang), sin = Math.sin(ang);
        tfStart.v0x =  h * cos - h * sin;
        tfStart.v0y =  h * sin + h * cos;

        tfStart.dist0 = Math.hypot(tfStart.v0x, tfStart.v0y);
        tfStart.ang0  = Math.atan2(tfStart.v0y, tfStart.v0x);
      },
      onPanResponderMove: (_, g) => {
        const vx = tfStart.v0x + g.dx;
        const vy = tfStart.v0y + g.dy;
        const dist = Math.max(10, Math.hypot(vx, vy));
        const ang  = Math.atan2(vy, vx);
        const scaleNew = Math.min(4, Math.max(0.3, (dist / tfStart.dist0) * tfStart.scale0));
        const rotNew   = tfStart.rot0 + (ang - tfStart.ang0);
        scl.setValue(scaleNew);
        rot.setValue(rotNew);
      },
      onPanResponderRelease: (_, g) => {
        const vx = tfStart.v0x + g.dx;
        const vy = tfStart.v0y + g.dy;
        const dist = Math.max(10, Math.hypot(vx, vy));
        const ang  = Math.atan2(vy, vx);
        const scaleNew = Math.min(4, Math.max(0.3, (dist / tfStart.dist0) * tfStart.scale0));
        const rotNew   = tfStart.rot0 + (ang - tfStart.ang0);
        onUpdate?.({ scale: scaleNew, rotation: rotNew });
      },
    })
  ).current;

  // 중심 기준 transform (스티커와 동일)
  const animatedStyle = {
    position: 'absolute',
    left: 0, top: 0,
    transform: [
      { translateX: Animated.subtract(pos.x, Animated.multiply(scl, size / 2)) },
      { translateY: Animated.subtract(pos.y, Animated.multiply(scl, size / 2)) },
      {
        rotate: rot.interpolate({
          inputRange: [-Math.PI, Math.PI],
          outputRange: ['-180deg', '180deg'],
        }),
      },
      { scale: scl },
    ],
  };

  return (
    <Animated.View style={[animatedStyle, { minWidth: 60 }]}>
      {/* 드래그 영역: 본문만 panHandlers 연결 */}
      <View
        {...movePan.panHandlers}
        style={{ paddingHorizontal: 8, paddingVertical: 4, alignItems: 'center', justifyContent: 'center' }}
        collapsable={false}
      >
        {editing ? (
          <TextInput
            value={draft}
            onChangeText={(v) => {
              setDraft(v);
              onDraftChange?.(id, v); // 부모 draftRef 최신화
            }}
            autoFocus
            multiline
            placeholder="텍스트 입력"
            placeholderTextColor="rgba(255,255,255,0.5)"
            onBlur={() => onEditEnd?.(draft)}
            onSubmitEditing={() => onEditSave?.(draft)}
            style={{
              color,
              fontSize: 24,
              fontFamily,
              fontWeight: fontFamily === 'NotoSansKR_Regular' ? '700' : 'normal',
              textAlign: 'center',
              paddingVertical: 4,
              paddingHorizontal: 6,
              minWidth: 80,
            }}
          />
        ) : (
          <Text
            style={{
              color,
              fontSize: 24,
              fontFamily,
              fontWeight: fontFamily === 'NotoSansKR_Regular' ? '700' : 'normal',
            }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {text}
          </Text>
        )}
      </View>

      {/* ✅ 선택/편집 오버레이(드래그 영역 밖에 렌더) */}
      {(selected || editing) && (
        <>
          <View style={styles.stickerOutline} pointerEvents="none" />

          {editing ? (
            <>
              {/* 취소(좌상단) */}
              <TouchableOpacity
                style={[styles.handle, styles.handleTL, styles.actionCancel]}
                onPress={() => {
                  setDraft(text);      // 원본으로 되돌림
                  onEditCancel?.();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.handleText}>취소</Text>
              </TouchableOpacity>

              {/* 저장(우상단) */}
              <TouchableOpacity
                style={[styles.handle, styles.handleTR, styles.actionSave]}
                onPress={() => onEditSave?.(draft)}
                activeOpacity={0.85}
              >
                <Text style={styles.handleText}>저장</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* 삭제(X) - 좌상단 */}
              <TouchableOpacity
                style={[styles.handle, styles.handleTL]}
                onPress={onDelete}
                activeOpacity={0.8}
              >
                <Text style={styles.handleText}>×</Text>
              </TouchableOpacity>

              {/* ✅ 수정 - 우상단 */}
              <TouchableOpacity
                style={[styles.handle, styles.handleTR, {width: 40}]}
                onPress={() => onEditStart?.()}
                activeOpacity={0.85}
              >
                <Text style={styles.handleText}>수정</Text>
              </TouchableOpacity>

              {/* 변형 핸들 - 우하단 */}
              <View style={[styles.handle, styles.handleBR]} {...transformPan.panHandlers}>
                <Text style={styles.handleText}>↔︎</Text>
              </View>
            </>
          )}
        </>
      )}
    </Animated.View>
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

  canvasArea: { flex: 1, alignItems: 'center', justifyContent: 'center',  overflow: 'hidden' },
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
    backgroundColor: 'rgba(0,0,0,0.8)',   // 60% 투명
    borderTopLeftRadius: 14, borderTopRightRadius: 14,
    justifyContent: 'center',
    alignItems: 'center', 
    // paddingBottom: 12,
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
  frameOptionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly', // ← 좌우 여백 포함 균등 정렬
    width: '100%',
    paddingHorizontal: 20,
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
    justifyContent: 'flex-start',
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
  stickerOutline: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.2,
    borderColor: '#FFFFFF',
    borderStyle: 'dashed',
    // borderRadius: 6,
  },
  handle: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
      // paddingHorizontal: 6,
      // paddingVertical: 2,    
  },
  handleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  handleTL: { left: -11, top: -11 },      // 좌상단
  handleBR: { right: -11, bottom: -11 },  // ✅ 우하단  
  handleTR: { right: -11, top: -11 },

  // 편집 전용 버튼 가독성 강화
  actionSave: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // 파랑
    borderColor: 'rgba(255,255,255,0.9)',
    width: 40,
    height:25,
  },
  actionCancel: {
    backgroundColor: 'rgba(108, 108, 108, 1)', // 빨강
    borderColor: 'rgba(255,255,255,0.9)',
    width: 40,
    height:25,    
  },  
  addTextButton: {
    width: '100%',
    // height: 50,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#F2F2F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addTextPlus: {
    color: '#111',
    fontSize: 20,
    fontWeight: '800',
  },
  addTextLabel: {
    color: '#111',
    fontSize: 16,
    fontWeight: '700',
  },  
  // 텍스트 스타일 패널
  textPanelWrap: {
    width: '100%',
    paddingHorizontal: 16,
  },
  textPanelRow: {
    width: '100%',
  },
  panelTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 8,
  },
  fontRow: {
    alignItems: 'center',
    gap: 8,
  },
  fontChip: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontChipActive: {
    backgroundColor: '#FFFFFF',
  },
  fontChipLabel: {
    color: '#BDBDBD',
    fontSize: 13,
  },
  fontChipLabelActive: {
    color: '#000',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  swatchActive: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  // moreBox: {
  //   marginLeft: 4,
  //   height: 28,
  //   paddingHorizontal: 10,
  //   borderRadius: 6,
  //   backgroundColor: 'rgba(255,255,255,0.12)',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  // moreText: {
  //   color: '#E5E5E5',
  //   fontSize: 12,
  //   fontWeight: '600',
  // },  
});