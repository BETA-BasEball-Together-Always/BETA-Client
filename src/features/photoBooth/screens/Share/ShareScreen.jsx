import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import photoBoothStore from "@features/photoBooth/store/photoBoothStore";
import DownloadSVG from "./assets/download.svg";
import ShareIcon from "./assets/share.svg";
import RNShare from "react-native-share";
import BackIcon from "../../../../shared/assets/svg/chevrons/back.svg";
import PhotoBoothBack from "../assets/svg/photoBoothBack.svg";
import { AppText } from "../../../../shared/theme/components/AppText";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export default function ShareScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const exportedFrameUri = photoBoothStore((s) => s.exportedFrameUri);
  const selectedFrameId = photoBoothStore((s) => s.selectedFrame?.id);
  const [saving, setSaving] = useState(false);
  /** 다운로드 성공 후 상단 중앙 '저장 완료' 표시 */
  const [showSaveCompleteTitle, setShowSaveCompleteTitle] = useState(false);

  const aspectRatio = useMemo(() => {
    if (selectedFrameId === "1x4") return 1 / 3;
    return 2 / 3;
  }, [selectedFrameId]);

  const ensureFileUri = useCallback(async () => {
    if (!exportedFrameUri) return null;

    if (exportedFrameUri.startsWith("file://")) {
      return exportedFrameUri;
    }
    if (exportedFrameUri.startsWith("data:image")) {
      try {
        const base64 = exportedFrameUri.split("base64,")[1];
        const dest = `${FileSystem.cacheDirectory}beta-share-${Date.now()}.png`;
        await FileSystem.writeAsStringAsync(dest, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return dest;
      } catch (e) {
        console.warn("Failed to convert dataURL -> file", e);
        return null;
      }
    }
    return exportedFrameUri;
  }, [exportedFrameUri]);

  const onPressBack = () => navigation.goBack();

  const onDownload = useCallback(async () => {
    try {
      if (!exportedFrameUri) {
        Alert.alert("오류", "저장할 프레임 이미지가 없어요.");
        return;
      }
      setSaving(true);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        setSaving(false);
        Alert.alert("권한 필요", "갤러리 저장 권한을 허용해주세요.");
        return;
      }

      const fileUri = await ensureFileUri();
      if (!fileUri) {
        setSaving(false);
        Alert.alert("오류", "이미지 파일을 준비하지 못했어요.");
        return;
      }

      await MediaLibrary.saveToLibraryAsync(fileUri);
      setSaving(false);
      setShowSaveCompleteTitle(true);
      Alert.alert("저장이 완료되었습니다.");
    } catch (e) {
      setSaving(false);
      console.warn(e);
      Alert.alert("저장 실패", "이미지 저장 중 문제가 발생했어요.");
    }
  }, [exportedFrameUri, ensureFileUri]);

  const onPressShare = useCallback(async () => {
    try {
      const fileUri = await ensureFileUri();
      if (!fileUri) {
        Alert.alert("오류", "공유할 이미지가 없어요.");
        return;
      }

      await RNShare.open({
        url: fileUri,
        type: "image/png",
        title: "BETA 야구네컷",
        failOnCancel: false,
      });
    } catch (e) {
      console.warn(e);
      Alert.alert("공유 실패", "이미지 공유 중 문제가 발생했어요.");
    }
  }, [ensureFileUri]);

  const onPressCreatePost = useCallback(() => {
    if (!exportedFrameUri) {
      Alert.alert("오류", "첨부할 이미지가 없어요.");
      return;
    }

    const uriForSize = exportedFrameUri.startsWith("file://")
      ? exportedFrameUri
      : exportedFrameUri.startsWith("/")
        ? `file://${exportedFrameUri}`
        : exportedFrameUri;

    const go = (w, h) => {
      navigation.navigate("Community", {
        screen: "CreatePost",
        params: {
          photoBoothAttachNonce: Date.now(),
          initialImagesFromPhotoBooth: [
            {
              uri: uriForSize,
              width: w,
              height: h,
            },
          ],
        },
      });
    };

    Image.getSize(
      uriForSize,
      (w, h) => go(w, h),
      () => go(1080, Math.round(1080 / aspectRatio)),
    );
  }, [exportedFrameUri, navigation, aspectRatio]);

  const previewMaxWidth = Math.min(SCREEN_W - 48, 320);

  const preview = useMemo(() => {
    if (!exportedFrameUri) return null;
    return (
      <View style={[styles.glowOuter, { width: previewMaxWidth }]}>
        <View style={styles.glowInner}>
          <View style={[styles.previewCard, { width: "100%", aspectRatio }]}>
            <Image
              source={{ uri: exportedFrameUri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    );
  }, [exportedFrameUri, aspectRatio, previewMaxWidth]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <PhotoBoothBack
          width={SCREEN_W}
          height={SCREEN_H}
          preserveAspectRatio="xMidYMid slice"
        />
        <View style={styles.bgDim} />
      </View>

      <View style={styles.header}>
        <TouchableOpacity
          onPress={onPressBack}
          style={styles.headerSide}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="뒤로"
        >
          <BackIcon width={12} height={18.5} />
        </TouchableOpacity>
        <View style={styles.headerCenter} pointerEvents="none">
          {showSaveCompleteTitle ? (
            <AppText variant="heading" style={styles.headerSaveComplete}>
              저장 완료
            </AppText>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={onPressShare}
          style={styles.headerSide}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="공유"
        >
          <ShareIcon width={30} height={30} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <View style={styles.previewArea}>
          {preview || (
            <View
              style={[styles.previewCard, styles.previewEmpty, { aspectRatio }]}
            >
              <AppText variant="caption" style={{ color: "#888" }}>
                미리볼 이미지가 없어요
              </AppText>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={onDownload}
          style={[styles.downloadBtn, saving && styles.downloadBtnDisabled]}
          disabled={saving}
          activeOpacity={0.85}
        >
          <DownloadSVG width={24} height={24} />
          <AppText variant="heading" style={styles.downloadText}>
            {saving ? "저장 중..." : "다운로드"}
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPressCreatePost}
          style={styles.postBtn}
          activeOpacity={0.9}
        >
          <AppText variant="heading" style={styles.postBtnText}>
            게시글 올리기
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0E0E0E",
  },
  bgDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    minHeight: 48,
    zIndex: 2,
  },
  headerSide: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSaveComplete: {
    color: "#F9F9F9",
    textAlign: "center",
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  previewArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  glowOuter: {
    maxWidth: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#FFFFFF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 28,
      },
      android: {
        elevation: 18,
      },
      default: {},
    }),
  },
  glowInner: {
    borderRadius: 4,
    overflow: "visible",
  },
  previewCard: {
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  previewEmpty: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    maxWidth: 360,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#1E1E1E",
    marginTop: 8,
  },
  downloadBtnDisabled: {
    opacity: 0.6,
  },
  downloadText: {
    color: "#F9F9F9",
    lineHeight: 24.5,
  },
  postBtn: {
    width: "100%",
    maxWidth: 360,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#F9F9F9",
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  postBtnText: {
    color: "#1E1E1E",
  },
});
