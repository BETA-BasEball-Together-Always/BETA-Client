// CameraScreen.jsx
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";

export default function CameraScreen({navigation, route}) {
  const {frameType = "2x2"} = route?.params ?? {};
  const insets = useSafeAreaInsets();

  // ---- permission ----
  const {hasPermission, requestPermission} = useCameraPermission();

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  // ---- camera states ----
  const [cameraPosition, setCameraPosition] = useState("front"); // 'front' | 'back'
  const device = useCameraDevice(cameraPosition);
  const cameraRef = useRef(null);

  const [flash, setFlash] = useState("off"); // 'off' | 'on' | 'auto'
  const [timerMode, setTimerMode] = useState("manual"); // 'manual' | '1s' | '3s' | '5s'
  const [beauty, setBeauty] = useState(false);

  const [isShooting, setIsShooting] = useState(false);
  const [stage, setStage] = useState(0); // 0..3
  const [photos, setPhotos] = useState([]); // VisionCamera PhotoFile[]
  const [countdown, setCountdown] = useState(0);

  // ---- preview aspect by frame ----
  const {width: screenW} = Dimensions.get("window");
  const previewAspect = useMemo(
    () => (frameType === "2x2" ? 7 / 10 : 10 / 7),
    [frameType]
  );
  const previewHeight = useMemo(
    () => screenW / previewAspect,
    [screenW, previewAspect]
  );

  // ---- helpers ----
  const nextTimerMode = useCallback(() => {
    setTimerMode((prev) =>
      prev === "manual"
        ? "1s"
        : prev === "1s"
        ? "3s"
        : prev === "3s"
        ? "5s"
        : "manual"
    );
  }, []);
  const timerSeconds = useMemo(
    () =>
      timerMode === "1s"
        ? 1
        : timerMode === "3s"
        ? 3
        : timerMode === "5s"
        ? 5
        : 0,
    [timerMode]
  );
  const lastPhoto = photos[photos.length - 1];

  // ---- take photo ----
  const actuallyTake = useCallback(async () => {
    if (!cameraRef.current) return null;
    try {
      const photo = await cameraRef.current.takePhoto({
        flash: flash, // 'on' | 'off' | 'auto'
        enableShutterSound: true,
        qualityPrioritization: "quality", // iOS
      });
      return photo;
    } catch (e) {
      console.warn("takePhoto error", e);
      return null;
    }
  }, [flash]);

  const takeOne = useCallback(async () => {
    if (isShooting) return;
    setIsShooting(true);
    const p = await actuallyTake();
    if (p) {
      setPhotos((prev) => [...prev, p]);
      setStage((s) => Math.min(s + 1, 3));
    }
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
          await new Promise((r) => setTimeout(r, 1000));
        }
        setCountdown(0);
        // eslint-disable-next-line no-await-in-loop
        const p = await actuallyTake();
        if (p) {
          setPhotos((prev) => [...prev, p]);
          setStage((s) => Math.min(s + 1, 3));
        }
        remain -= 1;
        if (remain > 0) {
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 350));
        }
      }
    } finally {
      setCountdown(0);
      setIsShooting(false);
    }
  }, [isShooting, photos.length, timerSeconds, actuallyTake]);

  const onPressShutter = useCallback(() => {
    if (timerMode === "manual") takeOne();
    else startAutoSequence();
  }, [timerMode, takeOne, startAutoSequence]);

  // ---- done 4 shots -> navigate ----
  useEffect(() => {
    if (photos.length === 4) {
      navigation.replace("EditScreen", {photos, frameType});
    }
  }, [photos, navigation, frameType]);

  if (!hasPermission || !device) {
    return (
      <View style={[styles.center, {paddingTop: insets.top}]}>
        <ActivityIndicator />
        <Text style={{color: "#fff", marginTop: 8}}>
          {device ? "카메라 권한 대기…" : "카메라 장치 로딩…"}
        </Text>
      </View>
    );
  }

  const timerLabel = {manual: "수동", "1s": "1초", "3s": "3초", "5s": "5초"}[
    timerMode
  ];
  const flashLabel = flash === "off" ? "OFF" : flash === "on" ? "ON" : "AUTO";

  return (
    <View
      style={[
        styles.container,
        {paddingTop: insets.top, paddingBottom: insets.bottom},
      ]}
    >
      {/* TopBar */}
      <View style={styles.topBar}>
        <TopIcon label="←" onPress={() => navigation.goBack()} />
        <TopIcon
          label="⚡"
          subLabel={flashLabel}
          onPress={() =>
            setFlash((prev) =>
              prev === "off" ? "on" : prev === "on" ? "auto" : "off"
            )
          }
        />
        <TopIcon label="⏱" subLabel={timerLabel} onPress={nextTimerMode} />
        <TopIcon
          label="✨"
          subLabel={beauty ? "ON" : "OFF"}
          onPress={() => setBeauty((b) => !b)}
        />
      </View>

      {/* Preview */}
      <View style={[styles.previewWrap, {height: previewHeight}]}>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive
          photo
          // hdr, lowLightBoost 등 옵션은 기기 지원 여부에 따라
          enableZoomGesture
        />
        {beauty && <View pointerEvents="none" style={styles.beautyOverlay} />}

        {countdown > 0 && (
          <View style={styles.countdownWrap}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}

        <View pointerEvents="none" style={styles.stageGuide}>
          <Text style={styles.stageText}>
            {Math.min(photos.length + 1, 4)} / 4
          </Text>
        </View>
      </View>

      {/* BottomBar */}
      <View style={styles.bottomBar}>
        {/* left: order indicator */}
        <View style={styles.indicatorArea}>
          {photos.length > 0 ? (
            <View style={styles.thumbWrap}>
              {/* VisionCamera photo.path is file path */}
              <Image
                source={{
                  uri:
                    Platform.OS === "android"
                      ? `file://${lastPhoto.path}`
                      : lastPhoto.path,
                }}
                style={styles.thumb}
              />
            </View>
          ) : (
            <View style={styles.thumbPlaceholder} />
          )}
          <Text style={styles.orderText}>
            {photos.length > 0 ? `${photos.length} / 4` : " "}
          </Text>
        </View>

        {/* center: shutter */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressShutter}
          disabled={isShooting}
          style={[styles.shutterOuter, isShooting && {opacity: 0.7}]}
        >
          <View style={styles.shutterInner} />
        </TouchableOpacity>

        {/* right: switch camera */}
        <TouchableOpacity
          style={styles.switchBtn}
          onPress={() =>
            setCameraPosition((p) => (p === "front" ? "back" : "front"))
          }
          disabled={isShooting}
        >
          <Text style={styles.switchText}>⟲</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TopIcon({label, subLabel, onPress}) {
  return (
    <TouchableOpacity style={styles.topIcon} onPress={onPress}>
      <Text style={styles.topIconText}>{label}</Text>
      {subLabel ? <Text style={styles.topIconSub}>{subLabel}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#0B0B0B"},
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0B0B0B",
  },

  topBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    justifyContent: "space-between",
  },
  topIcon: {
    minWidth: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  topIconText: {color: "#fff", fontSize: 18},
  topIconSub: {position: "absolute", bottom: -12, fontSize: 10, color: "#bbb"},

  previewWrap: {
    width: "100%",
    alignSelf: "center",
    overflow: "hidden",
    backgroundColor: "#000",
  },

  beautyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff",
    opacity: 0.08,
  },
  countdownWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  countdownText: {fontSize: 96, fontWeight: "700", color: "#fff"},
  stageGuide: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stageText: {color: "#fff", fontSize: 12},

  bottomBar: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  indicatorArea: {
    position: "absolute",
    left: 22,
    bottom: 24,
    alignItems: "center",
    width: 64,
  },
  thumbWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
  },
  thumb: {width: "100%", height: "100%"},
  thumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  orderText: {color: "#fff", marginTop: 6, fontSize: 12},

  shutterOuter: {
    alignSelf: "center",
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
  },

  switchBtn: {
    position: "absolute",
    right: 22,
    bottom: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  switchText: {color: "#fff", fontSize: 22, fontWeight: "700"},
});
