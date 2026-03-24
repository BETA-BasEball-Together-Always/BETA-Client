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
import photoBoothStore from "@features/photoBooth/store/photoBoothStore";
import {
  copyFrameToUniqueUploadFile,
  writeDataUrlPngToCache,
} from "@features/photoBooth/utils/copyFrameToUniqueUploadFile";
import DownloadSVG from "./assets/download.svg";
import ShareIcon from "./assets/share.svg";
import RNShare from "react-native-share";
import BackIcon from "../../../../shared/assets/svg/chevrons/back.svg";
import PhotoBoothBack from "../assets/svg/photoBoothBack.svg";
import { AppText } from "../../../../shared/theme/components/AppText";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

/** PhotoBooth 등 중첩 스택에서 Root(Community가 등록된 Stack)까지 올라가 이동 */
function getRootNavigation(navigation) {
  let nav = navigation;
  while (nav?.getParent?.()) {
    nav = nav.getParent();
  }
  return nav;
}

function measureImageSizeWithTimeout(uri, fallbackW, fallbackH, timeoutMs = 4000) {
  return new Promise((resolve) => {
    const done = (w, h) => resolve({ width: w, height: h });
    const t = setTimeout(() => done(fallbackW, fallbackH), timeoutMs);
    Image.getSize(
      uri,
      (w, h) => {
        clearTimeout(t);
        done(w, h);
      },
      () => {
        clearTimeout(t);
        done(fallbackW, fallbackH);
      },
    );
  });
}

/** Figma Share 미리보기 가로 상한 (프레임별) */
const PREVIEW_MAX_WIDTH_1x4 = 140.313;
const PREVIEW_MAX_WIDTH_2x2 = 285.6;

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

  /**
   * 화면 가로에 맞춘 미리보기 너비 — aspectRatio와 함께 높이 결정.
   * 1x4(세로 4컷): 285.6px / 2x2: 140.313px (Figma 기준 상한, 좁은 화면에서는 축소)
   */
  const previewWidth = useMemo(() => {
    const horizontalPad = 48;
    const maxByFrame =
      selectedFrameId === "1x4" ? PREVIEW_MAX_WIDTH_1x4 : PREVIEW_MAX_WIDTH_2x2;
    return Math.min(SCREEN_W - horizontalPad, maxByFrame);
  }, [SCREEN_W, selectedFrameId]);

  /**
   * Edit에서 저장한 file:// 는 이미 캡처마다 고유 경로이므로 복사 없이 그대로 사용.
   * (Expo 54에서 copyAsync/Base64 복사가 실패하는 환경 대비)
   */
  const ensureFileUri = useCallback(async () => {
    if (!exportedFrameUri) return null;

    if (
      exportedFrameUri.startsWith("file://") ||
      exportedFrameUri.startsWith("/")
    ) {
      return exportedFrameUri.startsWith("file://")
        ? exportedFrameUri
        : `file://${exportedFrameUri}`;
    }
    if (exportedFrameUri.startsWith("data:image")) {
      try {
        return await writeDataUrlPngToCache(exportedFrameUri);
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

      if (__DEV__) {
        console.log("[ShareScreen] onDownload uri snapshot", {
          exportedFrameUri,
          ensuredFileUri: fileUri,
        });
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

  const onPressCreatePost = useCallback(async () => {
    try {
      if (!exportedFrameUri) {
        Alert.alert("오류", "첨부할 이미지가 없어요.");
        return;
      }

      const fileUri = await ensureFileUri();
      if (!fileUri) {
        Alert.alert("오류", "이미지 파일을 준비하지 못했어요.");
        return;
      }

      const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

      /**
       * exportedFrameUri / ViewShot tmpfile와 분리된 고유 파일로 복사
       * 동일 경로를 포토부스·게시글 파이프라인이 공유하면 이후 캡처/정규화 시 덮어쓰기로
       * 이전 게시글 썸네일이 최신 이미지로 바뀌는 현상이 날 수 있음.
       * 복사 실패 시 동일 file:// 를 넘기지 않음 (폴백 금지).
       */
      const uniqueCopyUri = await copyFrameToUniqueUploadFile(fileUri, nonce);
      if (!uniqueCopyUri) {
        console.warn("[ShareScreen] copyFrameToUniqueUploadFile returned null");
        Alert.alert(
          "오류",
          "이미지를 안전하게 복사하지 못했어요. 저장 공간을 확인한 뒤 다시 시도해 주세요.",
        );
        return;
      }

      const uriForPost = uniqueCopyUri.startsWith("file://")
        ? uniqueCopyUri
        : `file://${uniqueCopyUri}`;

      const uriForSize =
        uriForPost.startsWith("file://") || uriForPost.startsWith("/")
          ? uriForPost.startsWith("file://")
            ? uriForPost
            : `file://${uriForPost}`
          : uriForPost;

      if (__DEV__) {
        console.log("[ShareScreen] onPressCreatePost photoBooth uris", {
          exportedFrameUri,
          ensuredFileUri: fileUri,
          uniqueCopyUri,
          uriForPost,
          uriForSize,
        });
      }

      const { width: w, height: h } = await measureImageSizeWithTimeout(
        uriForSize,
        1080,
        1620,
      );

      const rootNav = getRootNavigation(navigation);
      if (!rootNav?.navigate) {
        console.warn("[ShareScreen] root navigation missing", {
          hasNavigation: !!navigation,
        });
        Alert.alert(
          "이동 실패",
          "게시글 작성 화면을 찾지 못했어요. 앱을 다시 실행한 뒤 시도해 주세요.",
        );
        return;
      }

      rootNav.navigate("Community", {
        screen: "CreatePost",
        params: {
          photoBoothAttachNonce: nonce,
          initialImagesFromPhotoBooth: [
            {
              uri: uriForPost,
              width: w,
              height: h,
            },
          ],
        },
      });
    } catch (e) {
      console.warn("[ShareScreen] onPressCreatePost", e);
      Alert.alert(
        "오류",
        "게시글 작성 화면으로 이동하지 못했어요. 잠시 후 다시 시도해 주세요.",
      );
    }
  }, [exportedFrameUri, ensureFileUri, navigation]);

  const preview = useMemo(() => {
    if (!exportedFrameUri) return null;
    return (
      <View style={[styles.glowOuter, { width: previewWidth, aspectRatio }]}>
        <View style={[styles.glowInner, styles.previewFill]}>
          <View style={[styles.previewCard, styles.previewFill]}>
            <Image
              source={{ uri: exportedFrameUri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    );
  }, [exportedFrameUri, previewWidth, aspectRatio]);

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
              style={[
                styles.previewCard,
                styles.previewEmpty,
                { width: previewWidth, aspectRatio },
              ]}
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
  previewFill: {
    flex: 1,
    alignSelf: "stretch",
  },
  glowOuter: {
    maxWidth: "100%",
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#FFFFFF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
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
    alignItems: "center",
    justifyContent: "center",
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
