import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { editStyles as styles } from "./editStyles";

export default function TextItem({
  item,
  selected,
  onSelect,
  onUpdate,
  onDelete,
  editing,
  onEditStart,
  onEditEnd,
  onEditCancel,
  onEditSave,
  onDraftChange,
}) {
  const {
    id,
    text,
    x,
    y,
    scale,
    rotation,
    size,
    color = "#FFF",
    fontFamily = "NotoSansKR_Regular",
  } = item;
  const [draft, setDraft] = useState(text);
  useEffect(() => {
    setDraft(text);
  }, [text]);
  useEffect(() => {
    if (editing) {
      onDraftChange?.(id, text);
    }
  }, [editing, id, text, onDraftChange]);

  const pos = useRef(new Animated.ValueXY({ x, y })).current;
  const scl = useRef(new Animated.Value(scale)).current;
  const rot = useRef(new Animated.Value(rotation)).current;

  const lastTapRef = useRef(0);
  const TAP_SLOP = 4;
  const DBL_GAP = 300;

  useEffect(() => {
    const cur = typeof pos.x.__getValue === "function" ? pos.x.__getValue() : x;
    if (Math.abs(cur - x) > 1e-3) pos.x.setValue(x);
  }, [x, pos.x]);
  useEffect(() => {
    const cur = typeof pos.y.__getValue === "function" ? pos.y.__getValue() : y;
    if (Math.abs(cur - y) > 1e-3) pos.y.setValue(y);
  }, [y, pos.y]);
  useEffect(() => {
    const cur = typeof scl.__getValue === "function" ? scl.__getValue() : scale;
    if (Math.abs(cur - scale) > 1e-3) scl.setValue(scale);
  }, [scale, scl]);
  useEffect(() => {
    const cur =
      typeof rot.__getValue === "function" ? rot.__getValue() : rotation;
    if (Math.abs(cur - rotation) > 1e-3) rot.setValue(rotation);
  }, [rotation, rot]);

  const prevIdRef = useRef(id);
  useEffect(() => {
    if (prevIdRef.current !== id) {
      pos.setValue({ x, y });
      scl.setValue(scale);
      rot.setValue(rotation);
      prevIdRef.current = id;
    }
  }, [id]); // eslint-disable-line

  const start = useRef({ x: 0, y: 0 }).current;
  const movePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !editing,
      onPanResponderGrant: () => {
        onSelect?.();
        const curPos =
          typeof pos.__getValue === "function" ? pos.__getValue() : { x, y };
        start.x = curPos.x;
        start.y = curPos.y;
      },
      onPanResponderMove: (_, g) => {
        pos.setValue({ x: start.x + g.dx, y: start.y + g.dy });
      },
      onPanResponderRelease: (_, g) => {
        onUpdate?.({ x: start.x + g.dx, y: start.y + g.dy });
        const isTap = Math.abs(g.dx) < TAP_SLOP && Math.abs(g.dy) < TAP_SLOP;
        if (isTap) {
          const now = Date.now();
          if (selected && now - lastTapRef.current < DBL_GAP) {
            onEditStart?.();
          }
          lastTapRef.current = now;
          return;
        }
        onUpdate?.({ x: start.x + g.dx, y: start.y + g.dy });
      },
    }),
  ).current;

  const tfStart = useRef({
    v0x: 0,
    v0y: 0,
    dist0: 1,
    ang0: 0,
    scale0: 1,
    rot0: 0,
  }).current;
  const transformPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !editing,
      onPanResponderGrant: () => {
        onSelect?.();
        tfStart.scale0 =
          typeof scl.__getValue === "function" ? scl.__getValue() : scale;
        tfStart.rot0 =
          typeof rot.__getValue === "function" ? rot.__getValue() : rotation;

        const h = (size * tfStart.scale0) / 2;
        const ang = tfStart.rot0;
        const cos = Math.cos(ang),
          sin = Math.sin(ang);
        tfStart.v0x = h * cos - h * sin;
        tfStart.v0y = h * sin + h * cos;

        tfStart.dist0 = Math.hypot(tfStart.v0x, tfStart.v0y);
        tfStart.ang0 = Math.atan2(tfStart.v0y, tfStart.v0x);
      },
      onPanResponderMove: (_, g) => {
        const vx = tfStart.v0x + g.dx;
        const vy = tfStart.v0y + g.dy;
        const dist = Math.max(10, Math.hypot(vx, vy));
        const ang = Math.atan2(vy, vx);
        const scaleNew = Math.min(
          4,
          Math.max(0.3, (dist / tfStart.dist0) * tfStart.scale0),
        );
        const rotNew = tfStart.rot0 + (ang - tfStart.ang0);
        scl.setValue(scaleNew);
        rot.setValue(rotNew);
      },
      onPanResponderRelease: (_, g) => {
        const vx = tfStart.v0x + g.dx;
        const vy = tfStart.v0y + g.dy;
        const dist = Math.max(10, Math.hypot(vx, vy));
        const ang = Math.atan2(vy, vx);
        const scaleNew = Math.min(
          4,
          Math.max(0.3, (dist / tfStart.dist0) * tfStart.scale0),
        );
        const rotNew = tfStart.rot0 + (ang - tfStart.ang0);
        onUpdate?.({ scale: scaleNew, rotation: rotNew });
      },
    }),
  ).current;

  const animatedStyle = {
    position: "absolute",
    left: 0,
    top: 0,
    transform: [
      {
        translateX: Animated.subtract(pos.x, Animated.multiply(scl, size / 2)),
      },
      {
        translateY: Animated.subtract(pos.y, Animated.multiply(scl, size / 2)),
      },
      {
        rotate: rot.interpolate({
          inputRange: [-Math.PI, Math.PI],
          outputRange: ["-180deg", "180deg"],
        }),
      },
      { scale: scl },
    ],
  };

  return (
    <Animated.View style={[animatedStyle, { minWidth: 60 }]}>
      <View
        {...movePan.panHandlers}
        style={{
          paddingHorizontal: 8,
          paddingVertical: 4,
          alignItems: "center",
          justifyContent: "center",
        }}
        collapsable={false}
      >
        {editing ? (
          <TextInput
            value={draft}
            onChangeText={(v) => {
              setDraft(v);
              onDraftChange?.(id, v);
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
              fontWeight:
                fontFamily === "NotoSansKR_Regular" ? "700" : "normal",
              textAlign: "center",
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
              fontWeight:
                fontFamily === "NotoSansKR_Regular" ? "700" : "normal",
            }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {text}
          </Text>
        )}
      </View>

      {(selected || editing) && (
        <>
          <View style={styles.stickerOutline} pointerEvents="none" />

          {editing ? (
            <>
              <TouchableOpacity
                style={[styles.handle, styles.handleTL, styles.actionCancel]}
                onPress={() => {
                  setDraft(text);
                  onEditCancel?.();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.handleText}>취소</Text>
              </TouchableOpacity>

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
              <TouchableOpacity
                style={[styles.handle, styles.handleTL]}
                onPress={onDelete}
                activeOpacity={0.8}
              >
                <Text style={styles.handleText}>×</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.handle, styles.handleTR, { width: 40 }]}
                onPress={() => onEditStart?.()}
                activeOpacity={0.85}
              >
                <Text style={styles.handleText}>수정</Text>
              </TouchableOpacity>

              <View
                style={[styles.handle, styles.handleBR]}
                {...transformPan.panHandlers}
              >
                <Text style={styles.handleText}>↔︎</Text>
              </View>
            </>
          )}
        </>
      )}
    </Animated.View>
  );
}
