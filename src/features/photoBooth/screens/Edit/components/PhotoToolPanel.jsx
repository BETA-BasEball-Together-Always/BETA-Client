/**
 * 사진 탭: 썸네일 리스트 + 촬영/갤러리 카드
 * 높이·너비는 대부분 ../editStyles 의 thumb, photoActionCardOuter (둘 다 맞출 것)
 * 썸네일 사이 간격은 아래 THUMB_GAP과 동일
 *
 * 롱프레스 후 좌우 드래그로 썸네일 순서 변경(프레임 슬롯 순서와 동일 배열 photosLocal 반영)
 *
 * gap 삽입으로 슬롯의 row 기준 x가 바뀌면 translationX를 보정해 손가락/이미지 정렬 유지
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { AppText } from "../../../../../shared/theme/components/AppText";
import CameraPickerIcon from "../../../../community/assets/svg/CommunityPost/camera.svg";
import GalleryPickerIcon from "../../../../community/assets/svg/CommunityPost/image.svg";
import { editStyles } from "../editStyles";

/** editStyles.thumb.width + ItemSeparator width — EditScreen 프레임 슬롯 순서와 동일 */
const THUMB_W = 92;
const THUMB_H = 130;
const THUMB_GAP = 11;
const THUMB_SLOT = THUMB_W + THUMB_GAP;
/** editStyles.photoListContent.paddingLeft */
const PAD_L = 11;

const AUTO_SCROLL_EDGE = 44;
const AUTO_SCROLL_STEP = 6;

/** from 제외한 원본 인덱스 i의 reduced 배열상 위치 (from 이면 -1) */
function reducedPosition(i, from) {
  if (i === from) return -1;
  let p = 0;
  for (let j = 0; j < i; j++) {
    if (j !== from) p += 1;
  }
  return p;
}

/** insertPos(0..n) → reduced 행에서 gap 이 들어갈 인덱스(0..n-1, 끝이면 n-1이 아니라 reduced.length) */
function insertPosToGapIndex(fromIndex, insertPos, n) {
  const clamped = Math.max(0, Math.min(n, insertPos));
  const g = clamped > fromIndex ? clamped - 1 : clamped;
  return Math.max(0, Math.min(n - 1, g));
}

function InsertGap() {
  return <View style={styles.insertGap} />;
}

function PhotoThumbItem({
  item,
  index,
  onPressThumb,
  onReorderEnd,
  onDragStateChange,
  onDragAbsoluteMoveWorklet,
  onDragStartMeasure,
  disableReorder,
  hidden,
}) {
  const isDragging = useSharedValue(false);
  const thumbWrapRef = useRef(null);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: isDragging.value ? 1.02 : 1 }],
    zIndex: isDragging.value ? 100 : 0,
    elevation: isDragging.value ? 10 : 0,
    shadowColor: "#000",
    shadowOpacity: isDragging.value ? 0.35 : 0,
    shadowRadius: isDragging.value ? 8 : 0,
    shadowOffset: { width: 0, height: 4 },
    opacity: hidden ? 0 : 1,
  }));

  const reportDragStart = useCallback(
    (absX, absY) => {
      if (!thumbWrapRef.current) return;
      thumbWrapRef.current.measureInWindow((x, y, w, h) => {
        onDragStartMeasure?.({
          index,
          item,
          absX,
          absY,
          thumbWindowX: x,
          thumbWindowY: y,
          thumbW: w,
          thumbH: h,
        });
      });
    },
    [index, item, onDragStartMeasure],
  );

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(220)
    .onStart((e) => {
      isDragging.value = true;
      runOnJS(onDragStateChange)(true, index);
      runOnJS(reportDragStart)(e.absoluteX, e.absoluteY);
    })
    .onUpdate((e) => {
      onDragAbsoluteMoveWorklet(e.absoluteX);
    })
    .onEnd(() => {
      runOnJS(onReorderEnd)(index);
    })
    .onFinalize(() => {
      isDragging.value = false;
      runOnJS(onDragStateChange)(false);
    });

  const tapGesture = Gesture.Tap()
    .maxDuration(200)
    .onEnd(() => {
      runOnJS(onPressThumb)(item);
    });

  const composed = disableReorder
    ? tapGesture
    : Gesture.Exclusive(tapGesture, panGesture);

  return (
    <View ref={thumbWrapRef} collapsable={false}>
      <GestureDetector gesture={composed}>
        <Animated.View style={animatedStyle}>
          <View style={editStyles.thumb}>
            {item ? (
              <Image
                source={{ uri: item }}
                style={editStyles.thumbImg}
                resizeMode="cover"
              />
            ) : (
              <View style={editStyles.thumbPlaceholder} />
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

/** insertPos(0..n)과 fromIndex로 splice 후 삽입 인덱스 to 계산 */
function insertPosToToIndex(fromIndex, insertPos, n) {
  if (n <= 0) return 0;
  const clamped = Math.max(0, Math.min(n, insertPos));
  const to = clamped > fromIndex ? clamped - 1 : clamped;
  return Math.max(0, Math.min(n - 1, to));
}

export default function PhotoToolPanel({
  photosLocal,
  onPressThumb,
  onReplaceFromCamera,
  onReplaceFromGallery,
  onReorderPhotos,
}) {
  const scrollRef = useAnimatedRef();
  const listWrapRef = useRef(null);
  const rowInnerRef = useRef(null);
  const listWindowXRef = useRef(0);
  const listWindowYRef = useRef(0);
  const listWidthRef = useRef(0);
  const contentWidthRef = useRef(0);
  const lastInsertPosRef = useRef(0);
  const insertPosStateRef = useRef(null);

  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [insertPos, setInsertPos] = useState(null);
  const [dragOverlayUri, setDragOverlayUri] = useState("");

  // --- Reanimated shared state (smooth drag/scroll without JS layout coupling)
  const nSV = useSharedValue(0);
  const listWindowXSV = useSharedValue(0);
  const listWidthSV = useSharedValue(0);
  const contentWidthSV = useSharedValue(0);
  const scrollXSV = useSharedValue(0);
  const dragActiveSV = useSharedValue(false);
  const dragAbsXSV = useSharedValue(0);
  const dragLeftSV = useSharedValue(0);
  const dragTopSV = useSharedValue(0);
  const dragFingerOffsetXSV = useSharedValue(0);
  const dragIndexSV = useSharedValue(-1);
  const lastInsertSV = useSharedValue(-1);

  useEffect(() => {
    nSV.value = photosLocal.length;
  }, [photosLocal.length, nSV]);

  const measureListWindow = useCallback(() => {
    listWrapRef.current?.measureInWindow((x, y, w, _h) => {
      listWindowXRef.current = x;
      listWindowYRef.current = y;
      listWidthRef.current = w;
      listWindowXSV.value = x;
      listWidthSV.value = w;
    });
  }, [listWindowXSV, listWidthSV]);

  const onDragStateChange = useCallback(
    (dragging, thumbIndex) => {
      setScrollEnabled(!dragging);
      if (dragging && thumbIndex !== undefined) {
        measureListWindow();
        setDraggingIndex(thumbIndex);
        const n = photosLocal.length;
        const centerInsert = Math.round(
          thumbIndex + THUMB_W / (2 * THUMB_SLOT),
        );
        const init = Math.max(0, Math.min(n, centerInsert));
        lastInsertPosRef.current = init;
        insertPosStateRef.current = init;
        setInsertPos(init);

        // overlay 활성화 (thumb 위치/오프셋은 onDragStartMeasure에서 채움)
        dragActiveSV.value = true;
        dragIndexSV.value = thumbIndex;
        setDragOverlayUri(photosLocal[thumbIndex] ?? "");
        lastInsertSV.value = init;
      } else if (!dragging) {
        setDraggingIndex(null);
        setInsertPos(null);
        insertPosStateRef.current = null;
        dragActiveSV.value = false;
        dragIndexSV.value = -1;
        setDragOverlayUri("");
        lastInsertSV.value = -1;
      }
    },
    [measureListWindow, photosLocal, dragActiveSV, dragIndexSV, lastInsertSV],
  );

  const applyNextInsertPos = useCallback((nextInsert) => {
    lastInsertPosRef.current = nextInsert;
    if (insertPosStateRef.current !== nextInsert) {
      insertPosStateRef.current = nextInsert;
      setInsertPos(nextInsert);
    }
  }, []);

  const onDragStartMeasure = useCallback(
    ({ index, item, absX, thumbWindowX, thumbWindowY, thumbW, thumbH }) => {
      // 손가락이 썸 내부 어느 지점을 잡았는지(offset)를 고정해 오버레이가 항상 손가락 아래 오게 함
      const offsetX = absX - thumbWindowX;
      dragFingerOffsetXSV.value = offsetX;
      dragTopSV.value = thumbWindowY - listWindowYRef.current;
      dragLeftSV.value = absX - listWindowXRef.current - offsetX;
      setDragOverlayUri(item ?? "");
      dragIndexSV.value = index;

      // iOS에서 살짝 커보이도록(인스타 느낌)
      // 높이/너비는 editStyles.thumb로 렌더링하되, top은 실제 측정값으로 맞춤
      // thumbW/thumbH는 현재는 사용하지 않지만 추후 필요 시 활용 가능
      void thumbW;
      void thumbH;
    },
    [dragFingerOffsetXSV, dragTopSV, dragLeftSV, dragIndexSV],
  );

  const onDragAbsoluteMoveWorklet = useCallback(
    (absoluteX) => {
      "worklet";
      dragAbsXSV.value = absoluteX;
      if (!dragActiveSV.value) return;
      // finger -> listWrap localX
      dragLeftSV.value =
        absoluteX - listWindowXSV.value - dragFingerOffsetXSV.value;

      const n = nSV.value;
      if (n <= 0) return;
      const contentX = absoluteX - listWindowXSV.value + scrollXSV.value;
      const nextInsert = Math.max(
        0,
        Math.min(n, Math.round((contentX - PAD_L) / THUMB_SLOT)),
      );
      if (nextInsert !== lastInsertSV.value) {
        lastInsertSV.value = nextInsert;
        runOnJS(applyNextInsertPos)(nextInsert);
      }
    },
    [applyNextInsertPos],
  );

  const handleReorderEnd = useCallback(
    (fromIndex) => {
      const n = photosLocal.length;
      if (n === 0) return;
      const targetInsert = lastInsertPosRef.current;
      const to = insertPosToToIndex(fromIndex, targetInsert, n);
      if (to !== fromIndex) {
        onReorderPhotos(fromIndex, to);
      }
    },
    [photosLocal.length, onReorderPhotos],
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollXSV.value = e.contentOffset.x;
    },
  });

  const onListLayout = useCallback(() => {
    measureListWindow();
  }, [measureListWindow]);

  const onRowContentLayout = useCallback(
    (e) => {
      contentWidthRef.current = e.nativeEvent.layout.width;
      contentWidthSV.value = e.nativeEvent.layout.width;
      measureListWindow();
    },
    [measureListWindow],
  );

  // edge auto-scroll (no animation queue; tiny step per frame)
  useDerivedValue(() => {
    if (!dragActiveSV.value) return;
    const left = listWindowXSV.value;
    const right = left + listWidthSV.value;
    const absX = dragAbsXSV.value;

    const maxS = Math.max(0, contentWidthSV.value - listWidthSV.value);
    let next = scrollXSV.value;
    if (absX < left + AUTO_SCROLL_EDGE && next > 0) {
      next = Math.max(0, next - AUTO_SCROLL_STEP);
    } else if (absX > right - AUTO_SCROLL_EDGE && next < maxS - 0.5) {
      next = Math.min(maxS, next + AUTO_SCROLL_STEP);
    }

    if (Math.abs(next - scrollXSV.value) > 0.1) {
      scrollXSV.value = next;
      scrollTo(scrollRef, next, 0, false);
    }
  });

  const dragOverlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dragActiveSV.value ? 1 : 0,
    transform: [{ scale: dragActiveSV.value ? 1.06 : 1 }],
    left: dragLeftSV.value,
    top: dragTopSV.value,
  }));

  const photoFooter = (
    <View style={editStyles.photoFooterActions}>
      <TouchableOpacity
        style={editStyles.photoActionCardOuter}
        onPress={onReplaceFromCamera}
        activeOpacity={0.85}
      >
        <View style={editStyles.photoActionCardInner}>
          <BlurView
            intensity={Platform.select({ ios: 28, android: 22, default: 26 })}
            tint="light"
            style={StyleSheet.absoluteFillObject}
          />
          <View
            pointerEvents="none"
            style={[editStyles.photoActionFrost, { borderRadius: 10 }]}
          />
          <View style={editStyles.photoActionContent}>
            <CameraPickerIcon width={28} height={28} />
            <AppText
              variant="labelSmall"
              style={editStyles.photoActionLabel}
              numberOfLines={2}
            >
              사진{"\n"}촬영하기
            </AppText>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={editStyles.photoActionCardOuter}
        onPress={onReplaceFromGallery}
        activeOpacity={0.85}
      >
        <View style={editStyles.photoActionCardInner}>
          <BlurView
            intensity={Platform.select({ ios: 28, android: 22, default: 26 })}
            tint="light"
            style={StyleSheet.absoluteFillObject}
          />
          <View
            pointerEvents="none"
            style={[editStyles.photoActionFrost, { borderRadius: 10 }]}
          />
          <View style={editStyles.photoActionContent}>
            <GalleryPickerIcon width={28} height={28} />
            <AppText
              variant="labelSmall"
              style={editStyles.photoActionLabel}
              numberOfLines={2}
            >
              갤러리에서{"\n"}추가하기
            </AppText>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const n = photosLocal.length;
  const gapIndex =
    draggingIndex != null && insertPos != null && n > 0
      ? insertPosToGapIndex(draggingIndex, insertPos, n)
      : null;
  /** 맨 뒤 삽입(n-1). n===1 이면 맨 앞 gap 과 중복되지 않게 제외 */
  const trailGap =
    draggingIndex != null && insertPos != null && n > 1 && gapIndex === n - 1;

  return (
    <View ref={listWrapRef} style={styles.listWrap} onLayout={onListLayout}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        scrollEnabled={scrollEnabled}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={editStyles.photoListContent}
        decelerationRate="fast"
      >
        <View
          ref={rowInnerRef}
          style={styles.rowInner}
          onLayout={onRowContentLayout}
          collapsable={false}
        >
          {photosLocal.map((item, i) => (
            <React.Fragment key={`slot-${i}`}>
              {i > 0 && <View style={{ width: THUMB_GAP }} />}
              {draggingIndex != null &&
                insertPos != null &&
                gapIndex != null &&
                ((i !== draggingIndex &&
                  reducedPosition(i, draggingIndex) === gapIndex) ||
                  (i === draggingIndex &&
                    gapIndex === 0 &&
                    draggingIndex === 0)) && (
                  <>
                    <InsertGap />
                    <View style={{ width: THUMB_GAP }} />
                  </>
                )}
              <PhotoThumbItem
                item={item}
                index={i}
                onPressThumb={onPressThumb}
                onReorderEnd={handleReorderEnd}
                onDragStateChange={onDragStateChange}
                onDragAbsoluteMoveWorklet={onDragAbsoluteMoveWorklet}
                onDragStartMeasure={onDragStartMeasure}
                disableReorder={draggingIndex !== null && draggingIndex !== i}
                hidden={draggingIndex !== null && draggingIndex === i}
              />
            </React.Fragment>
          ))}
          {trailGap && (
            <>
              <View style={{ width: THUMB_GAP }} />
              <InsertGap />
            </>
          )}
          <View style={editStyles.photoListFooter}>
            <View style={{ width: THUMB_GAP }} />
            {photoFooter}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Instagram-style: drag overlay detached from list layout */}
      <Animated.View
        pointerEvents="none"
        style={[styles.dragOverlay, dragOverlayAnimatedStyle]}
      >
        <View style={editStyles.thumb}>
          {dragOverlayUri ? (
            <Image
              source={{ uri: dragOverlayUri }}
              style={editStyles.thumbImg}
              resizeMode="cover"
            />
          ) : (
            <View style={editStyles.thumbPlaceholder} />
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  listWrap: {
    position: "relative",
    width: "100%",
  },
  rowInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  dragOverlay: {
    position: "absolute",
    zIndex: 999,
    elevation: 999,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  insertGap: {
    width: THUMB_W,
    height: THUMB_H,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
});
