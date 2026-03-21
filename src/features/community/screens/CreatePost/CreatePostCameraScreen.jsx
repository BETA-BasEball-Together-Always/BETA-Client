import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";

export default function CreatePostCameraScreen({ navigation }) {
  const cameraRef = useRef(null);
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();

  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  const isReady = useMemo(
    () => !!device && !!hasPermission,
    [device, hasPermission],
  );

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePhoto({
        enableShutterSound: true,
        qualityPrioritization: "quality",
      });

      if (!photo?.path) return;

      const uri = photo.path.startsWith("file://")
        ? photo.path
        : `file://${photo.path}`;

      const capturedAsset = {
        uri,
        width: photo.width,
        height: photo.height,
      };

      /** captureNonce로 매 촬영마다 useEffect가 확실히 실행되도록 함(누적 첨부 유지) */
      navigation.navigate({
        name: "CreatePost",
        params: {
          capturedAsset,
          captureNonce: Date.now(),
        },
        merge: true,
      });
    } catch (e) {
      console.log("CreatePostCamera takePhoto error:", e);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, navigation]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <Pressable
            onPress={handleClose}
            hitSlop={10}
            style={styles.headerBtn}
          >
            <Text style={styles.headerText}>닫기</Text>
          </Pressable>
          <Text style={styles.title}>사진 촬영</Text>
          <View style={styles.headerRightSpacer} />
        </View>
      </SafeAreaView>

      {!isReady ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.centerText}>카메라 준비 중…</Text>
        </View>
      ) : (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive
          photo
        />
      )}

      <View style={styles.bottomBar}>
        <Pressable
          onPress={handleCapture}
          disabled={!isReady || isCapturing}
          style={[
            styles.shutter,
            (!isReady || isCapturing) && { opacity: 0.5 },
          ]}
        >
          <View style={styles.shutterInner} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  safeArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  headerBtn: {
    height: 36,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  headerText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  headerRightSpacer: {
    width: 56,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerText: {
    marginTop: 10,
    color: "rgba(255,255,255,0.8)",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 34,
    paddingTop: 16,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  shutter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FFFFFF",
  },
});
