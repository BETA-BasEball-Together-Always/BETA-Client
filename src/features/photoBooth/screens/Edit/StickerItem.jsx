import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { editStyles as styles } from "./editStyles";

/** 스티커: 이동/스케일/회전 + 삭제 */
export default function StickerItem({
  item,
  selected,
  onSelect,
  onUpdate,
  onDelete,
}) {
  const { x, y, scale, rotation, size, src, Svg, kind = "raster" } = item;

  const pos = useRef(new Animated.ValueXY({ x, y })).current;
  const scl = useRef(new Animated.Value(scale)).current;
  const rot = useRef(new Animated.Value(rotation)).current;

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

  const start = useRef({ x: 0, y: 0, offX: 0, offY: 0 }).current;
  const movePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        onSelect?.();
        const curPos =
          typeof pos.__getValue === "function" ? pos.__getValue() : { x, y };
        const curScale =
          typeof scl.__getValue === "function" ? scl.__getValue() : scale;
        const curRot =
          typeof rot.__getValue === "function" ? rot.__getValue() : rotation;
        start.x = curPos.x;
        start.y = curPos.y;

        const lx = evt.nativeEvent.locationX;
        const ly = evt.nativeEvent.locationY;
        const cx = size / 2,
          cy = size / 2;
        const localX = lx - cx,
          localY = ly - cy;
        const s = curScale;
        const cos = Math.cos(curRot),
          sin = Math.sin(curRot);
        const offX = localX * s * cos - localY * s * sin;
        const offY = localX * s * sin + localY * s * cos;
        start.offX = offX;
        start.offY = offY;
      },
      onPanResponderMove: (_, g) => {
        pos.setValue({ x: start.x + g.dx, y: start.y + g.dy });
      },
      onPanResponderRelease: (_, g) => {
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
      onStartShouldSetPanResponder: () => true,
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
    <Animated.View style={[animatedStyle, { width: size, height: size }]}>
      <View
        {...movePan.panHandlers}
        style={{ width: "100%", height: "100%" }}
        collapsable={false}
      >
        {kind === "svg" && Svg ? (
          <Svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
        ) : (
          <Image
            source={src}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        )}

        {selected && (
          <>
            <View style={styles.stickerOutline} pointerEvents="none" />
            <TouchableOpacity
              style={[styles.handle, styles.handleTL]}
              onPress={onDelete}
              activeOpacity={0.8}
            >
              <Text style={styles.handleText}>×</Text>
            </TouchableOpacity>
            <View
              style={[styles.handle, styles.handleBR]}
              {...transformPan.panHandlers}
            >
              <Text style={styles.handleText}>↔︎</Text>
            </View>
          </>
        )}
      </View>
    </Animated.View>
  );
}
