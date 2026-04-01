// EditScreen.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  PanResponder,
  Pressable,
  TouchableOpacity,
  InteractionManager,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import photoBoothStore from "@features/photoBooth/store/photoBoothStore";
import { FRAMES } from "@features/photoBooth/constants/framesMap";
import ImagesIcon from "./assets/tab/images.svg";
import FramesIcon from "./assets/tab/frames.svg";
import StickersIcon from "./assets/tab/stickers.svg";
import TextIcon from "./assets/tab/text.svg";
import { useNavigation } from "@react-navigation/native";
import ViewShot from "react-native-view-shot";
import * as ImagePicker from "expo-image-picker";
import {
  getOverlayHeight,
  getOverlayBackdropMode,
  computeEditFrameLayout,
  SNAP_THRESHOLD,
  TEXT_STYLE_PANEL_HEIGHT,
} from "./editConstants";
import { editStyles } from "./editStyles";
import LeaveConfirmModal from "../../../../shared/components/LeaveConfirmModal";
import EditTopBar from "./components/EditTopBar";
import EditBottomToolbar from "./components/EditBottomToolbar";
import EditOverlayBackdrop from "./components/EditOverlayBackdrop";
import PhotoToolPanel from "./components/PhotoToolPanel";
import FrameToolPanel from "./components/FrameToolPanel";
import StickerToolPanel from "./components/StickerToolPanel";
import AddTextToolPanel from "./components/AddTextToolPanel";
import TextStylePanel from "./components/TextStylePanel";
import StickerItem from "./StickerItem";
import TextItem from "./TextItem";

const { width, height } = Dimensions.get("window");

export default function EditScreen() {
  const navigation = useNavigation();
  const viewShotRef = useRef(null);
  const insets = useSafeAreaInsets();
  const store = photoBoothStore();
  const { selectedTeam, selectedFrame, capturedPhotos, setCapturedPhotos } =
    store;
  const imagePool = photoBoothStore((s) => s.imagePool);
  const setImagePool = photoBoothStore((s) => s.setImagePool);
  const addImagePoolItem = photoBoothStore((s) => s.addImagePoolItem);
  const removeImagePoolItem = photoBoothStore((s) => s.removeImagePoolItem);

  const [activeTool, setActiveTool] = useState("photo");
  const [bottomBarH, setBottomBarH] = useState(86);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);

  const [stickers, setStickers] = useState([]);
  const [selectedStickerId, setSelectedStickerId] = useState(null);
  const [selectedStickerPaletteIndex, setSelectedStickerPaletteIndex] =
    useState(null);

  const [texts, setTexts] = useState([]);
  const [selectedTextId, setSelectedTextId] = useState(null);
  const draftsRef = useRef(new Map());

  const [editingTextId, setEditingTextId] = useState(null);

  const selectSticker = React.useCallback(
    (id) => {
      if (editingTextId) {
        const draft = draftsRef.current.get(editingTextId);
        commitEditText(
          editingTextId,
          draft ?? texts.find((t) => t.id === editingTextId)?.text ?? "",
        );
      }
      setSelectedStickerId(id);
      setSelectedTextId(null);
      setEditingTextId(null);
      setSelectedSlot(null);
    },
    [editingTextId, texts],
  );

  const selectText = React.useCallback(
    (id) => {
      if (editingTextId && editingTextId !== id) {
        const draft = draftsRef.current.get(editingTextId);
        commitEditText(
          editingTextId,
          draft ?? texts.find((t) => t.id === editingTextId)?.text ?? "",
        );
      }
      setSelectedTextId(id);
      setSelectedStickerId(null);
      setSelectedSlot(null);
    },
    [editingTextId, texts],
  );

  const changeTool = React.useCallback(
    (tool, opts = {}) => {
      const { preserveSlot = false, preserveSelection = false } = opts;
      if (editingTextId && tool !== "text") {
        const draft = draftsRef.current.get(editingTextId);
        commitEditText(
          editingTextId,
          draft ?? texts.find((t) => t.id === editingTextId)?.text ?? "",
        );
      }
      if (!preserveSelection) {
        setSelectedStickerId(null);
        setSelectedTextId(null);
        setEditingTextId(null);
      }
      if (!preserveSlot) setSelectedSlot(null);
      if (tool !== "sticker") setSelectedStickerPaletteIndex(null);
      setActiveTool(tool);
    },
    [editingTextId, texts],
  );

  const startEditText = (id) => {
    setSelectedTextId(id);
    setSelectedStickerId(null);
    setEditingTextId(id);
    const cur = texts.find((t) => t.id === id)?.text ?? "";
    draftsRef.current.set(id, cur);
    changeTool("text", { preserveSlot: true, preserveSelection: true });
  };

  const commitEditText = (id, newText) => {
    setTexts((prev) =>
      prev.map((x) => (x.id === id ? { ...x, text: newText } : x)),
    );
    setEditingTextId(null);
  };

  const saveAndClearEditing = React.useCallback(() => {
    if (editingTextId) {
      const latestDraft = draftsRef.current.get(editingTextId);
      const fallback = texts.find((t) => t.id === editingTextId)?.text ?? "";
      const finalText = latestDraft !== undefined ? latestDraft : fallback;
      commitEditText(editingTextId, finalText);
    }
    setSelectedTextId(null);
    setSelectedStickerId(null);
    setSelectedSlot(null);
  }, [editingTextId, texts]);

  const isTextStylePanel = selectedTextId !== null;
  /** 폰트/색 패널일 때만 TEXT_STYLE_PANEL_HEIGHT — editConstants */
  const overlayHeight = isTextStylePanel
    ? TEXT_STYLE_PANEL_HEIGHT
    : getOverlayHeight(activeTool);
  const hiddenY = overlayHeight + 24;

  const hiddenYRef = useRef(hiddenY);
  useEffect(() => {
    hiddenYRef.current = hiddenY;
  }, [hiddenY]);

  const selectedText = useMemo(
    () => texts.find((t) => t.id === selectedTextId) || null,
    [texts, selectedTextId],
  );

  const [frameLayout, setFrameLayout] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const [photosLocal, setPhotosLocal] = useState(() =>
    capturedPhotos.slice(0, 4),
  );
  useEffect(() => {
    setPhotosLocal(capturedPhotos.slice(0, 4));
  }, [capturedPhotos]);

  // imagePool에 slot-0..3 미러(삭제 여부 포함)를 한 번 보장
  useEffect(() => {
    const cur = Array.isArray(imagePool) ? imagePool : [];
    const hasSlot = cur.some((x) => x?.kind === "slot");
    if (hasSlot) return;

    const slots = Array.from({ length: 4 }).map((_, i) => ({
      id: `slot-${i}`,
      kind: "slot",
      slotIndex: i,
      uri: photosLocal?.[i] ?? null,
      deleted: false,
    }));
    const added = cur.filter((x) => x?.kind === "added");
    setImagePool([...slots, ...added]);
  }, [imagePool, photosLocal, setImagePool]);

  const [selectedSlot, setSelectedSlot] = useState(null);

  const teamKey = selectedTeam?.teamKey ?? "base";
  const frameKey = selectedFrame?.id ?? "2x2";

  const frameSource = useMemo(() => {
    const theme = FRAMES[teamKey] || FRAMES.base;
    return theme?.[frameKey] || FRAMES.base?.[frameKey] || null;
  }, [teamKey, frameKey]);

  const editFrameLayout = useMemo(
    () =>
      computeEditFrameLayout({
        frameKey,
        windowWidth: width,
        windowHeight: height,
        safeTopInset: insets.top,
      }),
    [frameKey, width, height, insets.top],
  );

  const slots = useMemo(() => {
    if (frameKey === "1x4") {
      return [
        { top: "4.6%", left: "7.6%", width: "84.4%", height: "19.9%" },
        { top: "25.85%", left: "7.6%", width: "84.4%", height: "19.9%" },
        { top: "47.1%", left: "7.6%", width: "84.4%", height: "19.9%" },
        { top: "68.35%", left: "7.6%", width: "84.4%", height: "19.95%" },
      ];
    }
    return [
      { top: "4.5%", left: "5.7%", width: "42.5%", height: "40.3%" },
      { top: "4.5%", right: "5.7%", width: "42.5%", height: "40.3%" },
      { bottom: "12.5%", left: "5.7%", width: "42.5%", height: "40.3%" },
      { bottom: "12.5%", right: "5.7%", width: "42.5%", height: "40.3%" },
    ];
  }, [frameKey]);

  const handleSave = async () => {
    try {
      saveAndClearEditing();
      await new Promise((resolve) => {
        InteractionManager.runAfterInteractions(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
          });
        });
      });

      const uri = await viewShotRef.current?.capture?.({
        format: "png",
        quality: 1.0,
        result: "tmpfile",
      });
      if (!uri) return;

      /** ViewShot tmpfile는 캡처마다 고유 경로이며 Share에서 복사 없이 file:// 그대로 사용 */
      store.setExportedFrameUri(uri);
      navigation.navigate("Share");
    } catch (e) {
      console.warn("[EditScreen] viewshot failed:", e);
    }
  };

  const overlayY = useRef(new Animated.Value(hiddenY)).current;
  const currentY = useRef(0);
  const isOverlayOpen =
    ["photo", "frame", "sticker", "text"].includes(activeTool) ||
    selectedTextId !== null;

  const overlayBackdropMode = useMemo(
    () => getOverlayBackdropMode(activeTool, isTextStylePanel),
    [activeTool, isTextStylePanel],
  );

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
      onPanResponderGrant: () =>
        overlayY.stopAnimation((v) => {
          currentY.current = v;
        }),
      onPanResponderMove: (_, g) => {
        const next = Math.min(
          hiddenYRef.current,
          Math.max(0, currentY.current + g.dy),
        );
        overlayY.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const shouldClose =
          g.dy > SNAP_THRESHOLD ||
          currentY.current + g.dy > hiddenYRef.current * 0.5;
        Animated.timing(overlayY, {
          toValue: shouldClose ? hiddenYRef.current : 0,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          if (shouldClose) setActiveTool("none");
        });
      },
      onPanResponderTerminate: () => {
        Animated.timing(overlayY, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  const onPressFramePhoto = (idx) => {
    saveAndClearEditing();
    setSelectedSlot(idx);
    changeTool("photo", { preserveSlot: true });
  };

  const onPressThumb = (uri) => {
    if (selectedSlot === null) return;
    setPhotosLocal((prev) => {
      const next = [...prev];
      next[selectedSlot] = uri;
      setCapturedPhotos(next);
      return next;
    });
    setSelectedSlot(null);
  };

  const applyUriToSelectedSlot = React.useCallback(
    (uri) => {
      if (uri == null || selectedSlot === null) return;
      setPhotosLocal((prev) => {
        const next = [...prev];
        next[selectedSlot] = uri;
        setCapturedPhotos(next);
        return next;
      });
    },
    [selectedSlot, setCapturedPhotos],
  );

  /** 썸네일 리스트 순서 변경! 프레임 슬롯 photosLocal 동일 인덱스에 반영 */
  const onReorderPhotos = React.useCallback(
    (fromIndex, toIndex) => {
      if (fromIndex === toIndex) return;
      setPhotosLocal((prev) => {
        const next = [...prev];
        const [removed] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, removed);
        setCapturedPhotos(next);
        return next;
      });
      // slot 미러도 동일 순서로 이동(값만)
      const cur = Array.isArray(imagePool) ? imagePool : [];
      const slotUris = [0, 1, 2, 3].map(
        (i) => cur.find((x) => x?.id === `slot-${i}`)?.uri ?? null,
      );
      const [removedUri] = slotUris.splice(fromIndex, 1);
      slotUris.splice(toIndex, 0, removedUri);
      setImagePool(
        cur.map((x) => {
          if (x?.kind !== "slot") return x;
          const idx = x?.slotIndex;
          if (typeof idx !== "number") return x;
          return { ...x, uri: slotUris[idx] };
        }),
      );
    },
    [setCapturedPhotos, imagePool, setImagePool],
  );

  const handleReplaceFromCamera = React.useCallback(async () => {
    saveAndClearEditing();
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("권한 필요", "카메라 권한이 필요합니다.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      exif: false,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      const exists = (imagePool ?? []).some((x) => x?.uri === uri);
      if (!exists) {
        const cur = Array.isArray(imagePool) ? imagePool : [];
        const visibleSlots = cur.filter(
          (x) => x?.kind === "slot" && x?.deleted !== true,
        ).length;
        const maxAdded = Math.max(0, 6 - visibleSlots);
        const addedCount = cur.filter((x) => x?.kind === "added").length;
        if (addedCount >= maxAdded) {
          Alert.alert("알림", "추가 이미지는 최대 2장까지 가능합니다.");
          return;
        }
        const id = `added-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        addImagePoolItem({ id, uri, kind: "added" });
      }
      if (selectedSlot !== null) {
        // swap: slot-i와 선택된 added(또는 exists) 아이템을 교환해야 리스트가 덮어쓰기 되지 않음
        const oldUri = photosLocal?.[selectedSlot] ?? null;
        applyUriToSelectedSlot(uri);
        const cur = Array.isArray(imagePool) ? imagePool : [];
        const tapped = cur.find((x) => x?.uri === uri);
        const tappedId = tapped?.id;
        if (tappedId) {
          setImagePool(
            cur.map((x) => {
              if (x?.id === `slot-${selectedSlot}`) return { ...x, uri };
              if (x?.id === tappedId) return { ...x, uri: oldUri };
              return x;
            }),
          );
        }
        setSelectedSlot(null);
      }
    }
  }, [
    selectedSlot,
    applyUriToSelectedSlot,
    saveAndClearEditing,
    imagePool,
    addImagePoolItem,
    photosLocal,
    setImagePool,
  ]);

  const handleReplaceFromGallery = React.useCallback(async () => {
    saveAndClearEditing();
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("권한 필요", "사진 라이브러리 권한이 필요합니다.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      const exists = (imagePool ?? []).some((x) => x?.uri === uri);
      if (!exists) {
        const cur = Array.isArray(imagePool) ? imagePool : [];
        const visibleSlots = cur.filter(
          (x) => x?.kind === "slot" && x?.deleted !== true,
        ).length;
        const maxAdded = Math.max(0, 6 - visibleSlots);
        const addedCount = cur.filter((x) => x?.kind === "added").length;
        if (addedCount >= maxAdded) {
          Alert.alert("알림", "추가 이미지는 최대 2장까지 가능합니다.");
          return;
        }
        const id = `added-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        addImagePoolItem({ id, uri, kind: "added" });
      }
      if (selectedSlot !== null) {
        const oldUri = photosLocal?.[selectedSlot] ?? null;
        applyUriToSelectedSlot(uri);
        const cur = Array.isArray(imagePool) ? imagePool : [];
        const tapped = cur.find((x) => x?.uri === uri);
        const tappedId = tapped?.id;
        if (tappedId) {
          setImagePool(
            cur.map((x) => {
              if (x?.id === `slot-${selectedSlot}`) return { ...x, uri };
              if (x?.id === tappedId) return { ...x, uri: oldUri };
              return x;
            }),
          );
        }
        setSelectedSlot(null);
      }
    }
  }, [
    selectedSlot,
    applyUriToSelectedSlot,
    saveAndClearEditing,
    imagePool,
    addImagePoolItem,
    photosLocal,
    setImagePool,
  ]);

  const handlePressSlotThumb = React.useCallback(
    (idx, uri) => {
      saveAndClearEditing();
      if (selectedSlot === null) {
        setSelectedSlot(idx);
        return;
      }
      if (typeof uri === "string" && uri) {
        applyUriToSelectedSlot(uri);
      }
      setSelectedSlot(null);
    },
    [applyUriToSelectedSlot, saveAndClearEditing, selectedSlot],
  );

  const handleApplyPoolItemToSlot = React.useCallback(
    (item) => {
      const uri = item?.uri;
      if (selectedSlot === null) {
        Alert.alert("알림", "프레임에서 먼저 바꿀 칸을 선택해 주세요.");
        return;
      }
      if (!uri) return;

      // slot을 탭한 경우: 프레임 슬롯끼리 swap
      if (item?.kind === "slot" && typeof item?.slotIndex === "number") {
        const other = item.slotIndex;
        if (other === selectedSlot) {
          setSelectedSlot(null);
          return;
        }
        setPhotosLocal((prev) => {
          const next = [...prev];
          const a = next[selectedSlot];
          next[selectedSlot] = next[other];
          next[other] = a;
          setCapturedPhotos(next);
          return next;
        });
        const cur = Array.isArray(imagePool) ? imagePool : [];
        const aUri = photosLocal?.[selectedSlot] ?? null;
        const bUri = photosLocal?.[other] ?? null;
        setImagePool(
          cur.map((x) => {
            if (x?.id === `slot-${selectedSlot}`) return { ...x, uri: bUri };
            if (x?.id === `slot-${other}`) return { ...x, uri: aUri };
            return x;
          }),
        );
        setSelectedSlot(null);
        return;
      }

      // added를 탭한 경우: slot-i와 tapped item의 uri를 swap
      const oldUri = photosLocal?.[selectedSlot] ?? null;
      applyUriToSelectedSlot(uri);
      if (item?.id) {
        const cur = Array.isArray(imagePool) ? imagePool : [];
        setImagePool(
          cur.map((x) => {
            if (x?.id === `slot-${selectedSlot}`) return { ...x, uri };
            if (x?.id === item.id) return { ...x, uri: oldUri };
            return x;
          }),
        );
      }
      setSelectedSlot(null);
    },
    [
      applyUriToSelectedSlot,
      selectedSlot,
      imagePool,
      photosLocal,
      setCapturedPhotos,
      setImagePool,
    ],
  );

  const handleStickerPalettePick = React.useCallback(
    (SvgComp, paletteIdx) => {
      const id = Date.now().toString();
      const baseSize = 80;
      const cx = frameLayout.w ? frameLayout.w / 2 : 120;
      const cy = frameLayout.h ? frameLayout.h / 2 : 120;

      setSelectedStickerPaletteIndex(paletteIdx);
      setStickers((prev) => [
        ...prev,
        {
          id,
          kind: "svg",
          Svg: SvgComp,
          x: cx,
          y: cy,
          scale: 1,
          rotation: 0,
          size: baseSize,
        },
      ]);
      setSelectedStickerId(id);
      setSelectedTextId(null);
    },
    [frameLayout.w, frameLayout.h],
  );

  const handleAddText = React.useCallback(() => {
    const id = Date.now().toString();
    const baseSize = 160;
    const cx = frameLayout.w ? frameLayout.w / 2 : 140;
    const cy = frameLayout.h ? frameLayout.h / 2 : 140;
    setTexts((prev) => [
      ...prev,
      {
        id,
        text: "텍스트 입력",
        x: cx,
        y: cy,
        scale: 1,
        rotation: 0,
        size: baseSize,
        color: "#FFFFFF",
        fontFamily: "NotoSansKR_Regular",
      },
    ]);
    setSelectedTextId(id);
    setSelectedStickerId(null);
  }, [frameLayout.w, frameLayout.h]);

  const renderOverlayContent = () => {
    if (isTextStylePanel) {
      return <TextStylePanel selectedText={selectedText} setTexts={setTexts} />;
    }

    if (activeTool === "photo") {
      return (
        <PhotoToolPanel
          photosLocal={photosLocal}
          selectedSlot={selectedSlot}
          imagePool={imagePool}
          onPressSlotThumb={handlePressSlotThumb}
          onPressPoolItem={handleApplyPoolItemToSlot}
          onDeletePoolItem={removeImagePoolItem}
          onReplaceFromCamera={handleReplaceFromCamera}
          onReplaceFromGallery={handleReplaceFromGallery}
          onReorderPhotos={onReorderPhotos}
        />
      );
    }

    if (activeTool === "frame") {
      return (
        <FrameToolPanel
          teamKey={teamKey}
          frameKey={frameKey}
          onSelectFrame={(frame) => store.setSelectedFrame(frame)}
        />
      );
    }

    if (activeTool === "sticker") {
      return (
        <StickerToolPanel
          selectedStickerPaletteIndex={selectedStickerPaletteIndex}
          onPickSticker={handleStickerPalettePick}
        />
      );
    }

    if (activeTool === "text") {
      return <AddTextToolPanel onAddText={handleAddText} />;
    }

    return null;
  };

  return (
    <View style={[editStyles.screen, { paddingTop: insets.top }]}>
      <EditTopBar
        onBack={() => setLeaveModalVisible(true)}
        onSave={handleSave}
        title="야구네컷 편집"
      />

      <LeaveConfirmModal
        visible={leaveModalVisible}
        onClose={() => setLeaveModalVisible(false)}
        title="아직 저장하지 않았어요"
        description="나가면 편집 내용이 사라져요 😭"
        onLeave={() => navigation.goBack()}
      />

      <Pressable
        style={[
          editStyles.canvasArea,
          {
            paddingLeft: editFrameLayout.padL,
            paddingRight: editFrameLayout.padR,
          },
        ]}
        onPress={() => {
          saveAndClearEditing();
        }}
      >
        <View
          style={{
            marginTop: editFrameLayout.marginTop,
            alignItems: "center",
          }}
        >
          <ViewShot
            ref={viewShotRef}
            style={[editStyles.frameBox, editFrameLayout.frameStyle]}
            options={{ format: "png", quality: 1 }}
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
                    style={[editStyles.photo, slots[i]]}
                    onPress={() => onPressFramePhoto(i)}
                  >
                    <Image
                      source={{ uri }}
                      style={StyleSheet.absoluteFill}
                      resizeMode="cover"
                    />
                    {selectedSlot === i && (
                      <View
                        style={editStyles.selectedOverlay}
                        pointerEvents="none"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ImageBackground>
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#aaa" }}>
                  프레임 이미지를 찾을 수 없어요
                </Text>
              </View>
            )}
            {stickers.map((st) => (
              <StickerItem
                key={st.id}
                item={st}
                selected={selectedStickerId === st.id}
                onSelect={() => selectSticker(st.id)}
                onUpdate={(patch) => {
                  setStickers((prev) =>
                    prev.map((s) => (s.id === st.id ? { ...s, ...patch } : s)),
                  );
                }}
                onDelete={() => {
                  setStickers((prev) => prev.filter((s) => s.id !== st.id));
                  if (selectedStickerId === st.id) setSelectedStickerId(null);
                }}
              />
            ))}
            {texts.map((t) => (
              <TextItem
                key={t.id}
                item={t}
                selected={selectedTextId === t.id}
                onSelect={() => selectText(t.id)}
                onUpdate={(patch) => {
                  setTexts((prev) =>
                    prev.map((x) => (x.id === t.id ? { ...x, ...patch } : x)),
                  );
                }}
                onDelete={() => {
                  setTexts((prev) => prev.filter((x) => x.id !== t.id));
                  if (selectedTextId === t.id) setSelectedTextId(null);
                }}
                editing={editingTextId === t.id}
                onEditStart={() => startEditText(t.id)}
                onEditSave={(newText) => commitEditText(t.id, newText)}
                onEditCancel={() => setEditingTextId(null)}
                onDraftChange={(id, v) => {
                  draftsRef.current.set(id, v);
                }}
              />
            ))}
          </ViewShot>
        </View>
      </Pressable>

      <Animated.View
        pointerEvents={isOverlayOpen ? "auto" : "none"}
        style={[
          editStyles.overlayWrap,
          overlayBackdropMode === "sticker" && editStyles.overlayWrapSticker,
          overlayBackdropMode === "none" && editStyles.overlayWrapTextAddOnly,
          {
            height: overlayHeight,
            transform: [{ translateY: overlayY }],
            bottom: bottomBarH,
          },
        ]}
      >
        <EditOverlayBackdrop mode={overlayBackdropMode} />
        <View
          style={[
            editStyles.overlayForeground,
            overlayBackdropMode === "sticker" && {
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "stretch",
            },
          ]}
        >
          {overlayBackdropMode === "sticker" && (
            <View
              style={editStyles.stickerHandleHitArea}
              {...panResponder.panHandlers}
            >
              <View style={editStyles.stickerTopHandleBar} />
            </View>
          )}
          <View
            style={{
              flex: overlayBackdropMode === "sticker" ? 1 : undefined,
              width: "100%",
              minHeight: 0,
              justifyContent: "center",
            }}
          >
            {renderOverlayContent()}
          </View>
        </View>
      </Animated.View>

      <EditBottomToolbar
        ImagesIcon={ImagesIcon}
        FramesIcon={FramesIcon}
        StickersIcon={StickersIcon}
        TextIcon={TextIcon}
        activeTool={activeTool}
        onChangeTool={changeTool}
        onLayout={(e) => setBottomBarH(e.nativeEvent.layout.height)}
        paddingBottom={insets.bottom + 8}
      />
    </View>
  );
}
