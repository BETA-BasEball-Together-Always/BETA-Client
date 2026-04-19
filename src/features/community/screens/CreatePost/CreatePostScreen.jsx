import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { AppText } from "../../../../shared/theme/components/AppText";
import AppHeader from "../../../../shared/components/AppHeader";
import LeaveConfirmModal from "../../../../shared/components/LeaveConfirmModal";
import { useNavigation, useRoute } from "@react-navigation/native";
import BackIcon from "../../../../shared/assets/svg/chevrons/back.svg";
import CameraIcon from "../../../community/assets/svg/CommunityPost/camera.svg";
import GalleryIcon from "../../../community/assets/svg/CommunityPost/image.svg";
import DropDownIcon from "../../assets/svg/CommunityPost/dropDown.svg";
import { useUserStore } from "../../../../shared/store/userStore";
import {
  TEAM_DATA,
  getFeedProfileIconSize,
} from "../../../../shared/constants/teams";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import {
  invalidateCommunityPostLists,
  useCreatePostMutation,
} from "../../services/post/createPostMutation";
import { getApiErrorMessage } from "../../../../shared/utils/apiErrorMessage";
import { isOfflineError } from "../../../../shared/utils/networkErrors";
import { useUpdatePostMutation } from "../../services/post/updatePostMutation";
import postDetailKeys from "../../services/postDetail/postDetailKeys";
import { useQueryClient } from "@tanstack/react-query";

import CommunityLoadingIcon from "../../assets/svg/CommunityPost/communityLoading.svg";

import ImagePreviewList from "../../component/createPost/ImagePreviewList";
import { copyFrameToUniqueUploadFile } from "@features/photoBooth/utils/copyFrameToUniqueUploadFile";
import { randomUploadKey } from "../../../../shared/utils/randomUploadKey";
import { getEditContentMergedWithServerHashtags } from "../../utils/communityPostVisibility";

const { width } = Dimensions.get("window");

const MAX_CONTENT_LENGTH = 2000;
const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB (단일 이미지 상한)
const MAX_TOTAL_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB (요청 전체 이미지 합산 상한, nginx 한도 대비)
/** 긴 변 기준(가로·세로 모두) — 세로 긴 사진도 용량·해상도 상한에 맞춤 */
const MAX_UPLOAD_LONG_EDGE = 1920;
const MIN_JPEG_QUALITY = 0.4;
const MAX_HASHTAGS = 5;
const MAX_HASHTAG_LEN = 20;
const DUPLICATE_POST_WINDOW_MS = 30 * 1000;

const UPLOAD_REQUIRES_BODY_TOAST =
  "본문 내용을 추가해야 업로드를 할 수 있어요!";

/** 업로드 직전 캐시에 고유 복사본을 만들어 동일 file:// 경로가 서버/캐시에서 덮어쓰이지 않게 함!! */
async function cloneAssetsForUpload(assets, uploadKey = null) {
  const list = assets ?? [];
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const asset = list[i];
    if (!asset?.uri) continue;
    try {
      const copied = await copyFrameToUniqueUploadFile(asset.uri, uploadKey);
      if (copied) {
        const uri = copied.startsWith("file://") ? copied : `file://${copied}`;
        out.push({
          ...asset,
          uri,
          key: `${asset.key ?? "img"}-u-${uploadKey ?? "upload"}-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 11)}`,
        });
      } else {
        out.push(asset);
      }
    } catch {
      out.push(asset);
    }
  }
  return out;
}

/**
 * 카메라 화면으로 이동 시 스택에서 CreatePost가 언마운트되면 로컬 state가 사라짐
 * 촬영 직전 스냅샷을 모듈에 두고 복귀 시 병합!
 */
let pendingCameraDraftForCreatePost = null;

const guessMimeType = (uri) => {
  const lower = (uri || "").toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".heic")) return "image/jpeg";
  if (lower.endsWith(".heif")) return "image/jpeg";
  return "image/jpeg";
};

const buildResizeToMaxLongEdge = (width, height, maxEdge) => {
  const w = Number(width) || 1;
  const h = Number(height) || 1;
  const maxSide = Math.max(w, h);
  if (maxSide <= maxEdge) return [];
  const scale = maxEdge / maxSide;
  return [
    {
      resize: {
        width: Math.round(w * scale),
        height: Math.round(h * scale),
      },
    },
  ];
};

const CreatePostScreen = () => {
  const scrollRef = useRef(null);
  const inputOffsetY = useRef(0);
  const initialEditRef = useRef(null);
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();
  const route = useRoute();
  const editPost = route.params?.editPost;
  const isEditMode = !!editPost?.postId;
  const photoBoothAttachNonce = route.params?.photoBoothAttachNonce;
  const initialBoardId =
    route.params?.initialBoardId === "ALL" ? "ALL" : "TEAM";

  const author = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const createPostMutation = useCreatePostMutation();
  const updatePostMutation = useUpdatePostMutation();

  const [content, setContent] = useState(() =>
    isEditMode ? (editPost?.content ?? "") : "",
  );
  const [selectedBoardId, setSelectedBoardId] = useState(initialBoardId);
  /** 수정 모드: 서버에 남길 기존 이미지 */
  const [keptExistingImages, setKeptExistingImages] = useState([]);
  /** 수정 모드: 새로 첨부한 로컬 이미지 */
  const [pendingNewImages, setPendingNewImages] = useState([]);
  /** 수정 모드: 삭제 요청할 imageId */
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [isBoardModalVisible, setIsBoardModalVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [limitModalMessage, setLimitModalMessage] = useState("");
  const [isLimitModalVisible, setIsLimitModalVisible] = useState(false);
  // 해시태그는 본문에서 "#태그" 형태로 자동 추출됩니다.

  const [isPickingMedia, setIsPickingMedia] = useState(false);

  const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);
  const [uploadBodyToastVisible, setUploadBodyToastVisible] = useState(false);

  useEffect(() => {
    if (!uploadBodyToastVisible) return;
    const t = setTimeout(() => setUploadBodyToastVisible(false), 2800);
    return () => clearTimeout(t);
  }, [uploadBodyToastVisible]);

  useEffect(() => {
    if (!editPost?.postId) {
      initialEditRef.current = null;
      return;
    }
    const mergedContent = getEditContentMergedWithServerHashtags(editPost);
    setContent(mergedContent);
    const existing = (editPost.images ?? [])
      .map((img) => ({
        imageId: Number(img.imageId ?? img.id),
        uri: img.imageUrl || img.url,
      }))
      .filter((x) => x.uri && !Number.isNaN(x.imageId));
    setKeptExistingImages(existing);
    setPendingNewImages([]);
    setDeletedImageIds([]);
    initialEditRef.current = {
      content: mergedContent,
    };
  }, [editPost?.postId, editPost?.content, editPost?.hashtags]);

  useEffect(() => {
    if (!editPost?.postId) return;
    const ch = editPost.channel;
    if (ch === "ALL") {
      setSelectedBoardId("ALL");
    } else {
      setSelectedBoardId("TEAM");
    }
  }, [editPost?.postId, editPost?.channel]);

  useEffect(() => {
    if (isEditMode) return;
    setSelectedBoardId(initialBoardId);
  }, [initialBoardId, isEditMode]);

  const totalImageCount = isEditMode
    ? keptExistingImages.length + pendingNewImages.length
    : images.length;

  const previewImages = useMemo(() => {
    if (!isEditMode) return images;
    return [
      ...keptExistingImages.map((e) => ({
        uri: e.uri,
        key: `existing-${e.imageId}`,
      })),
      ...pendingNewImages.map((a, i) => ({
        ...a,
        key: `new-${i}-${a.uri}`,
      })),
    ];
  }, [isEditMode, images, keptExistingImages, pendingNewImages]);

  const editBoardLabel = useMemo(() => {
    const ch = editPost?.channel;
    if (ch === "ALL") return "전체 게시판";
    return "응원팀 게시판";
  }, [editPost?.channel]);

  const isContentMax = content.length >= MAX_CONTENT_LENGTH;
  const isImagesMax = totalImageCount >= MAX_IMAGES;
  /** 이미지 유무와 관계없이 본문 1글자 이상일 때만 업로드 활성 */
  const isUploadEnabled = content.trim().length > 0;
  const hasDraftContent = content.trim().length > 0 || totalImageCount > 0;

  const isUploading =
    createPostMutation.isPending || updatePostMutation.isPending;
  const isSpinning = isPickingMedia || isUploading;

  const spinAnim = React.useRef(new Animated.Value(0)).current;
  const lastUploadRef = useRef({ content: "", at: 0 });
  const captureEffectIdRef = useRef(0);
  const photoBoothEffectIdRef = useRef(0);
  const lastPhotoBoothUploadUrisRef = useRef(null);

  const openLimitModal = (message) => {
    setLimitModalMessage(message);
    setIsLimitModalVisible(true);
  };

  useEffect(() => {
    if (!isSpinning) {
      spinAnim.stopAnimation(() => spinAnim.setValue(0));
      return;
    }
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
      spinAnim.setValue(0);
    };
  }, [isSpinning]);

  const [dropdownLayout, setDropdownLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const team = useMemo(() => {
    const code = author?.favoriteTeamCode;
    if (code && TEAM_DATA[code]) {
      return TEAM_DATA[code];
    }

    // 코드가 없거나 매칭 안 될 경우, 서버에서 내려준 favoriteTeamName으로 보조 매핑
    const name = author?.favoriteTeamName;
    if (!name) return null;
    const entry = Object.values(TEAM_DATA).find((t) => t.label === name);
    return entry || null;
  }, [author?.favoriteTeamCode, author?.favoriteTeamName]);
  const ProfileIcon = team?.ProfileIcon;

  const boards = useMemo(
    () => [
      { id: "TEAM", label: "응원팀 게시판" },
      { id: "ALL", label: "전체 게시판" },
    ],
    [],
  );

  const selectedBoardLabel = useMemo(() => {
    return boards.find((b) => b.id === selectedBoardId)?.label ?? "";
  }, [boards, selectedBoardId]);

  const createPostChannel = useMemo(() => {
    if (selectedBoardId === "ALL") return "ALL";
    return "TEAM";
  }, [selectedBoardId]);

  const handleChangeContent = (text) => {
    const next = text.slice(0, MAX_CONTENT_LENGTH);
    setContent(next);
  };

  /** width/height 누락 시 비율 깨짐 방지 */
  const ensureAssetDimensions = async (asset) => {
    if (!asset?.uri) return asset;
    const w = asset.width;
    const h = asset.height;
    if (w && h && w > 0 && h > 0) return asset;
    return new Promise((resolve) => {
      Image.getSize(
        asset.uri,
        (w0, h0) => resolve({ ...asset, width: w0, height: h0 }),
        () =>
          resolve({
            ...asset,
            width: w || 1080,
            height: h || 1440,
          }),
      );
    });
  };

  /**
   * 래스터 이미지: 긴 변 리사이즈 + JPEG 재압축으로 장당 10MB 이하를 목표로 맞춤 (비율 유지)
   * GIF: 애니 유지를 위해 변환 없이 용량만 검사
   */
  const normalizeRasterForUpload = async (asset) => {
    const mime = guessMimeType(asset.uri);
    if (mime === "image/gif") {
      const withDims = await ensureAssetDimensions(asset);
      try {
        const info = await FileSystem.getInfoAsync(withDims.uri, {
          size: true,
        });
        if (typeof info?.size === "number" && info.size > MAX_IMAGE_BYTES) {
          openLimitModal(
            "GIF 이미지 용량이 너무 큽니다.\n다른 이미지로 시도해 주세요.",
          );
          return null;
        }
      } catch {
        // size 미확인 시 서버 검증에 맡김
      }
      return withDims;
    }

    try {
      const base = await ensureAssetDimensions(asset);
      const ow = base.width || 1;
      const oh = base.height || 1;
      const qualities = [0.85, 0.75, 0.65, 0.55, 0.45, 0.4, MIN_JPEG_QUALITY];
      const maxSide0 = Math.max(ow, oh);
      let longEdgeCap = Math.min(maxSide0, MAX_UPLOAD_LONG_EDGE);

      while (longEdgeCap >= 320) {
        const actions = buildResizeToMaxLongEdge(ow, oh, longEdgeCap);
        const resized = await ImageManipulator.manipulateAsync(
          base.uri,
          actions,
          {
            compress: 0.85,
            format: ImageManipulator.SaveFormat.JPEG,
          },
        );

        for (const q of qualities) {
          const encoded = await ImageManipulator.manipulateAsync(
            resized.uri,
            [],
            {
              compress: Math.max(q, MIN_JPEG_QUALITY),
              format: ImageManipulator.SaveFormat.JPEG,
            },
          );
          try {
            const info = await FileSystem.getInfoAsync(encoded.uri, {
              size: true,
            });
            if (
              typeof info?.size === "number" &&
              info.size <= MAX_IMAGE_BYTES
            ) {
              return {
                uri: encoded.uri,
                width: encoded.width,
                height: encoded.height,
              };
            }
          } catch {
            return {
              uri: encoded.uri,
              width: encoded.width,
              height: encoded.height,
            };
          }
        }

        longEdgeCap = Math.round(longEdgeCap * 0.72);
      }

      openLimitModal(
        "이미지 용량을 줄여도 한도(장당 10MB)에 맞지 않습니다.\n다른 이미지를 선택해 주세요.",
      );
      return null;
    } catch {
      openLimitModal(
        "이미지를 처리하지 못했습니다.\n다른 이미지로 시도해 주세요.",
      );
      return null;
    }
  };

  const validateAndNormalizeAssets = async (assets) => {
    const allowed = new Set([
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ]);
    const next = [];
    let totalBytes = 0;

    for (const original of assets ?? []) {
      if (!original?.uri) continue;

      const a = await normalizeRasterForUpload(original);
      if (!a) continue;

      const mimeType = guessMimeType(a.uri);
      if (!allowed.has(mimeType)) {
        openLimitModal("이미지는 JPG/PNG/GIF/WEBP만 업로드할 수 있습니다.");
        continue;
      }

      try {
        const info = await FileSystem.getInfoAsync(a.uri, { size: true });
        if (typeof info?.size === "number") {
          if (info.size > MAX_IMAGE_BYTES) {
            openLimitModal("이미지는 장당 최대 10MB까지 업로드할 수 있습니다.");
            continue;
          }
          if (totalBytes + info.size > MAX_TOTAL_IMAGE_BYTES) {
            openLimitModal(
              "이미지 전체 용량은 최대 10MB까지 업로드할 수 있습니다.",
            );
            continue;
          }
          totalBytes += info.size;
        }
      } catch {
        // size 조회 실패 시에는 단일 용량/총 용량 체크를 스킵 (서버에서 최종 검증)
      }

      next.push(a);
    }

    return next;
  };

  const extractedHashTags = useMemo(() => {
    // 본문에서 "#해시태그" 형태를 추출
    // - 공백/문장부호 등 어떤 위치에서도 인식 (상세 화면의 렌더링 규칙과 일치)
    // - 각 20자 이하, 중복 제거
    const set = new Set();
    const regex = /#[^\s#]+/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const token = match[0] ?? "";
      if (!token || token === "#" || token.startsWith("##")) continue;
      const tag = token.slice(1).trim();
      if (!tag) continue;
      if (tag.length > MAX_HASHTAG_LEN) continue;
      set.add(tag);
    }
    return Array.from(set);
  }, [content]);

  // 업로드용 content는 사용자가 입력한 원문 그대로 전송
  // (서버가 hashtags를 따로 받더라도 content 내의 해시태그 위치/순서를 보존하기 위해)
  const contentForUpload = content;

  const acceptedHashTags = useMemo(
    () => extractedHashTags.slice(0, MAX_HASHTAGS),
    [extractedHashTags],
  );

  const hasHashTagOverflow = extractedHashTags.length > MAX_HASHTAGS;

  useEffect(() => {
    if (!hasHashTagOverflow) return;
    openLimitModal("해시태그는 최대 5개만 추가 가능합니다.");
  }, [hasHashTagOverflow]);

  const renderHighlightedContent = useMemo(() => {
    if (typeof content !== "string" || content.length === 0) return null;

    const regex = /#[^\s#]+/g;
    const nodes = [];
    let lastIndex = 0;
    let match;
    let segIdx = 0;

    while ((match = regex.exec(content)) != null) {
      const start = match.index;
      const token = match[0] ?? "";
      if (!token || token === "#" || token.startsWith("##")) continue;

      if (start > lastIndex) {
        nodes.push(
          <AppText
            variant="other"
            key={`t-${segIdx++}-${lastIndex}`}
            style={[styles.richTextBase, styles.richTextNormal]}
          >
            {content.slice(lastIndex, start)}
          </AppText>,
        );
      }

      nodes.push(
        <AppText
          variant="other"
          key={`h-${segIdx++}-${start}`}
          style={[styles.richTextBase, styles.richTextHash]}
        >
          {token}
        </AppText>,
      );

      lastIndex = start + token.length;
    }

    if (lastIndex < content.length) {
      nodes.push(
        <AppText
          variant="other"
          key={`t-${segIdx++}-${lastIndex}`}
          style={[styles.richTextBase, styles.richTextNormal]}
        >
          {content.slice(lastIndex)}
        </AppText>,
      );
    }

    return nodes;
  }, [content]);

  const handleAddImages = (newAssets) => {
    if (isEditMode) {
      setPendingNewImages((prev) => {
        const cap = MAX_IMAGES - keptExistingImages.length;
        const merged = [...prev, ...newAssets];
        if (merged.length <= cap) return merged;
        openLimitModal("사진은 최대 5장까지\n추가 가능합니다.");
        return merged.slice(0, Math.max(0, cap));
      });
      return;
    }
    setImages((prev) => {
      const merged = [...prev, ...newAssets];
      if (merged.length <= MAX_IMAGES) return merged;
      openLimitModal("사진은 최대 5장까지\n추가 가능합니다.");
      return merged.slice(0, MAX_IMAGES);
    });
  };

  const handlePressGallery = async () => {
    try {
      setIsPickingMedia(true);
      const remaining = MAX_IMAGES - totalImageCount;
      if (remaining <= 0) {
        openLimitModal("사진은 최대 5장까지\n추가 가능합니다.");
        return;
      }

      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        // 품질을 낮춰 전송 용량을 줄이기 (0~1)
        quality: 0.7,
        exif: false,
        base64: false,
        // ios 이미지는 heic이므로 jpeg 자동 변환 요청!!
        preferredAssetRepresentationMode:
          ImagePicker.UIImagePickerPreferredAssetRepresentationMode?.Compatible,
      });

      if (!result.canceled) {
        const mapped = (result.assets ?? []).map((a) => ({
          uri: a.uri,
          width: a.width,
          height: a.height,
        }));
        const validated = await validateAndNormalizeAssets(mapped);
        handleAddImages(validated);
      }
    } catch (error) {
      console.log("이미지 선택 실패:", error);
    } finally {
      setIsPickingMedia(false);
    }
  };

  const handlePressCamera = () => {
    if (isEditMode) {
      pendingCameraDraftForCreatePost = {
        isEditMode: true,
        content,
        selectedBoardId,
        keptExistingImages,
        pendingNewImages,
        deletedImageIds,
      };
    } else {
      pendingCameraDraftForCreatePost = {
        isEditMode: false,
        content,
        images,
        selectedBoardId,
      };
    }
    navigation.navigate("CreatePostCamera", {
      currentImageCount: totalImageCount,
      maxImages: MAX_IMAGES,
    });
  };

  const handleRemoveImage = (index) => {
    if (isEditMode) {
      const nExisting = keptExistingImages.length;
      if (index < nExisting) {
        const removed = keptExistingImages[index];
        setDeletedImageIds((prev) => [...prev, removed.imageId]);
        setKeptExistingImages((prev) => prev.filter((_, i) => i !== index));
      } else {
        const localIdx = index - nExisting;
        setPendingNewImages((prev) => prev.filter((_, i) => i !== localIdx));
      }
      return;
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const nonce = route.params?.captureNonce;
    const captured = route.params?.capturedAsset;
    if (nonce == null || !captured?.uri) return;
    const id = ++captureEffectIdRef.current;
    let cancelled = false;
    (async () => {
      setIsPickingMedia(true);
      try {
        const validated = await validateAndNormalizeAssets([captured]);
        if (cancelled || id !== captureEffectIdRef.current) return;

        const draft = pendingCameraDraftForCreatePost;
        pendingCameraDraftForCreatePost = null;

        if (!validated?.length) {
          navigation.setParams({
            capturedAsset: undefined,
            captureNonce: undefined,
          });
          return;
        }

        if (draft?.isEditMode) {
          const kept = draft.keptExistingImages ?? [];
          const cap = Math.max(0, MAX_IMAGES - kept.length);
          const prevPending = draft.pendingNewImages ?? [];
          const merged = [...prevPending, ...validated].slice(0, cap);
          if (prevPending.length + validated.length > cap) {
            openLimitModal("사진은 최대 5장까지\n추가 가능합니다.");
          }
          setContent(draft.content ?? "");
          setSelectedBoardId(draft.selectedBoardId ?? "TEAM");
          setKeptExistingImages(kept);
          setPendingNewImages(merged);
          setDeletedImageIds(draft.deletedImageIds ?? []);
        } else if (!isEditMode) {
          const baseImages = draft?.images ?? [];
          const merged = [...baseImages, ...validated].slice(0, MAX_IMAGES);
          if (baseImages.length + validated.length > MAX_IMAGES) {
            openLimitModal("사진은 최대 5장까지\n추가 가능합니다.");
          }
          setContent(draft?.content ?? "");
          setSelectedBoardId(draft?.selectedBoardId ?? "TEAM");
          setImages(merged);
        } else {
          handleAddImages(validated);
        }

        navigation.setParams({
          capturedAsset: undefined,
          captureNonce: undefined,
        });
      } finally {
        if (!cancelled && id === captureEffectIdRef.current) {
          setIsPickingMedia(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [route.params?.captureNonce]);

  useEffect(() => {
    const nonce = route.params?.photoBoothAttachNonce;
    const list = route.params?.initialImagesFromPhotoBooth;
    if (nonce == null || !list?.length || isEditMode) return;
    const id = ++photoBoothEffectIdRef.current;
    let cancelled = false;
    (async () => {
      setIsPickingMedia(true);
      try {
        if (__DEV__) {
          console.log("[CreatePost] photoBooth attach start", {
            nonce,
            initialImagesFromPhotoBooth: (list ?? []).map((x) => ({
              uri: x?.uri,
              width: x?.width,
              height: x?.height,
            })),
          });
        }

        /** Share에서 이미 복사했어도, 동일 경로/캐시 키를 한 번 더 분리 (잔상/덮어쓰기 방지) */
        const listUnique = [];
        for (let i = 0; i < list.length; i++) {
          const item = list[i];
          if (!item?.uri) continue;
          const copied = await copyFrameToUniqueUploadFile(item.uri, nonce);
          if (!copied) {
            console.warn("[CreatePost] photoBooth copy failed, skip asset", i);
            continue;
          }
          const uri = copied.startsWith("file://")
            ? copied
            : `file://${copied}`;

          if (__DEV__ && i === 0) {
            console.log("[CreatePost] photoBooth copy asset[0]", {
              srcUri: item.uri,
              copied,
              uri,
            });
          }

          listUnique.push({
            ...item,
            uri,
            width: item.width,
            height: item.height,
          });
        }
        if (!listUnique.length) {
          openLimitModal(
            "이미지를 불러오지 못했어요.\n포토부스에서 다시 시도해 주세요.",
          );
          return;
        }

        const validated = await validateAndNormalizeAssets(listUnique);
        if (cancelled || id !== photoBoothEffectIdRef.current) return;
        /** uri는 리스트 키로 쓰지 않음(동일 경로 문자열). nonce + randomUploadKey로만 구분 */
        const tagged = validated.map((a) => ({
          ...a,
          key: `photobooth-${nonce}-${randomUploadKey()}`,
        }));
        let mergedOverflow = false;
        // 다른 게시글로 같은 화면이 재사용될 수 있으므로, PhotoBooth attach 시점에는 기존 이미지를 초기화
        setImages(() => {
          mergedOverflow = tagged.length > MAX_IMAGES;
          return tagged.slice(0, MAX_IMAGES);
        });
        if (mergedOverflow) {
          openLimitModal("사진은 최대 5장까지\n추가 가능합니다.");
        }
        navigation.setParams({
          initialImagesFromPhotoBooth: undefined,
          photoBoothAttachNonce: undefined,
        });
      } finally {
        if (!cancelled && id === photoBoothEffectIdRef.current) {
          setIsPickingMedia(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [route.params?.photoBoothAttachNonce, isEditMode]);

  const normalizeFileUri = (uri) => {
    if (!uri) return uri;
    if (uri.startsWith("file://")) return uri;
    if (uri.startsWith("/")) return `file://${uri}`;
    return uri;
  };

  const appendImageFile = (formData, fieldName, asset, idx) => {
    if (!asset?.uri) return;
    const mimeType = guessMimeType(asset.uri);
    const extMap = {
      "image/png": "png",
      "image/gif": "gif",
      "image/webp": "webp",
      "image/jpeg": "jpg",
    };
    const ext = extMap[mimeType] ?? "jpg";
    // 서버가 업로드 multipart의 file name(또는 uri base name)을 저장 키 생성에 반영한다고 가정
    const uniqueName = `image-${photoBoothAttachNonce ?? "upload"}-${randomUploadKey()}-${idx}.${ext}`;

    if (__DEV__) {
      console.log("[CreatePost] appendImageFile", {
        fieldName,
        idx,
        assetUri: asset.uri,
        mimeType,
        uniqueName,
      });
    }

    formData.append(fieldName, {
      uri: normalizeFileUri(asset.uri),
      name: uniqueName,
      type: mimeType,
    });
  };

  const handleUploadPress = () => {
    if (isUploading) return;
    if (!content.trim()) {
      setUploadBodyToastVisible(true);
      return;
    }
    handleUpload();
  };

  const handleUpload = async () => {
    if (isUploading) return;
    if (!content.trim()) return;

    if (hasHashTagOverflow) {
      openLimitModal("해시태그는 최대 5개만 추가 가능합니다.");
      return;
    }

    if (
      !isEditMode &&
      selectedBoardId === "TEAM" &&
      !author?.favoriteTeamCode
    ) {
      openLimitModal("응원팀을 설정한 뒤 팀 게시판에 글을 작성할 수 있습니다.");
      return;
    }

    if (isEditMode) {
      const formData = new FormData();
      formData.append("content", contentForUpload);
      acceptedHashTags.forEach((tag) => {
        formData.append("hashtags", tag);
      });

      deletedImageIds.forEach((id) => {
        formData.append("deletedImageIds", String(id));
      });
      pendingNewImages.forEach((asset, idx) => {
        appendImageFile(formData, "newImages", asset, idx);
      });

      updatePostMutation.mutate(
        { postId: editPost.postId, formData },
        {
          onSuccess: async () => {
            pendingCameraDraftForCreatePost = null;
            invalidateCommunityPostLists(queryClient);
            // 수정 직후 바로 상세 화면으로 돌아가면 기존 캐시가 잠깐/계속 보일 수 있어
            // 상세 쿼리를 즉시 refetch 완료한 뒤 돌아가도록 보장
            const pid = editPost?.postId;
            if (pid != null) {
              await queryClient.invalidateQueries({
                queryKey: postDetailKeys.detail(pid),
              });
              await queryClient.refetchQueries({
                queryKey: postDetailKeys.detail(pid),
              });
            }
            navigation.goBack();
          },
          onError: (e) => {
            if (isOfflineError(e)) return;
            const status = e?.response?.status;
            const data = e?.response?.data;
            if (status === 413) {
              openLimitModal(
                "게시글 용량이 너무 큽니다.\n이미지 크기나 개수를 줄여 다시 시도해 주세요.",
              );
              return;
            }
            if (
              status === 400 &&
              Array.isArray(data?.errors) &&
              data.errors[0]?.message
            ) {
              openLimitModal(data.errors[0].message);
              return;
            }
            const msg = getApiErrorMessage(e, "");
            if (typeof msg === "string" && msg.trim()) {
              Alert.alert("알림", msg.trim());
              return;
            }
            Alert.alert(
              "알림",
              "게시글 수정에 실패했어요. 잠시 후 다시 시도해 주세요.",
            );
          },
        },
      );
      return;
    }

    const now = Date.now();
    const normalizedContent = contentForUpload.trim();
    if (
      normalizedContent &&
      normalizedContent === lastUploadRef.current.content &&
      now - lastUploadRef.current.at < DUPLICATE_POST_WINDOW_MS
    ) {
      openLimitModal("30초 내 동일 내용 게시글은 등록할 수 없습니다.");
      return;
    }

    let imagesForUpload = images;
    try {
      imagesForUpload = await cloneAssetsForUpload(
        images,
        photoBoothAttachNonce ?? "upload",
      );
    } catch (e) {
      console.warn("[CreatePost] cloneAssetsForUpload", e);
    }

    if (__DEV__) {
      lastPhotoBoothUploadUrisRef.current = {
        sourceImagesUris: (images ?? []).map((a) => a?.uri),
        uploadImagesUris: (imagesForUpload ?? []).map((a) => a?.uri),
      };
      console.log("[CreatePost] before createPost upload uris snapshot", {
        uploadImagesUris: lastPhotoBoothUploadUrisRef.current.uploadImagesUris,
      });
    }

    const formData = new FormData();
    formData.append("content", contentForUpload);
    formData.append("channel", createPostChannel);
    acceptedHashTags.forEach((tag) => {
      formData.append("hashtags", tag);
    });

    try {
      imagesForUpload.forEach((asset, idx) => {
        appendImageFile(formData, "images", asset, idx);
      });
    } catch (e) {
      console.warn("[CreatePost] handleUpload appendImageFile", e);
      openLimitModal(
        "업로드 준비 중 문제가 발생했어요.\n잠시 후 다시 시도해 주세요.",
      );
      return;
    }

    createPostMutation.mutate(formData, {
      onSuccess: (data) => {
        pendingCameraDraftForCreatePost = null;
        lastUploadRef.current = { content: normalizedContent, at: now };
        if (__DEV__) {
          console.log("[CreatePost] createPost onSuccess photoBooth uris", {
            createdPostId: data?.postId ?? data?.id ?? null,
            snapshot: lastPhotoBoothUploadUrisRef.current,
          });
        }
        // 목록 갱신은 useCreatePostMutation onSuccess에서 처리
        navigation.navigate("UploadSuccess", {
          createdPostId: data?.postId ?? data?.id ?? null,
        });
      },
      onError: (e) => {
        if (isOfflineError(e)) return;
        const status = e?.response?.status;
        const data = e?.response?.data;
        if (status === 413) {
          openLimitModal(
            "게시글 용량이 너무 큽니다.\n이미지 크기나 개수를 줄여 다시 시도해 주세요.",
          );
          return;
        }
        if (
          status === 400 &&
          Array.isArray(data?.errors) &&
          data.errors[0]?.message
        ) {
          openLimitModal(data.errors[0].message);
          return;
        }
        const msg = getApiErrorMessage(e, "");
        if (typeof msg === "string" && msg.trim()) {
          Alert.alert("알림", msg.trim());
          return;
        }
        if (status === 400) {
          openLimitModal("입력값을 확인해 주세요.");
          return;
        }
        Alert.alert(
          "알림",
          "게시글을 등록하지 못했어요. 잠시 후 다시 시도해 주세요.",
        );
      },
    });
  };

  const isEditDirty = () => {
    if (!isEditMode) return hasDraftContent;
    const init = initialEditRef.current;
    if (!init) return hasDraftContent;
    if (content !== init.content) return true;
    if (pendingNewImages.length > 0) return true;
    if (deletedImageIds.length > 0) return true;
    return false;
  };

  const handlePressBack = () => {
    if (isEditMode ? isEditDirty() : hasDraftContent) {
      setIsLeaveModalVisible(true);
    } else {
      navigation.goBack();
    }
  };

  const spinStyle = {
    transform: [
      {
        rotate: spinAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <AppHeader
          left={
            <TouchableOpacity
              style={styles.backButton}
              onPress={handlePressBack}
            >
              <BackIcon width={12} height={18.5} />
            </TouchableOpacity>
          }
          center={
            <AppText
              variant="displayTitle2"
              className="text-[#E5E5E5]"
              style={styles.screenTitle}
            >
              {isEditMode ? "게시글 수정" : "새 글 작성"}
            </AppText>
          }
          right={
            <TouchableOpacity
              onPress={handleUploadPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[
                styles.uploadButton,
                isUploadEnabled && !isUploading
                  ? styles.uploadButtonEnabled
                  : styles.uploadButtonDisabled,
              ]}
              disabled={isUploading}
            >
              <AppText
                variant="caption"
                style={
                  isUploadEnabled && !isUploading
                    ? styles.uploadBtnTextEnabled
                    : styles.uploadBtnTextDisabled
                }
              >
                {isEditMode ? "수정" : "업로드"}
              </AppText>
            </TouchableOpacity>
          }
        />

        <ScrollView
          ref={scrollRef}
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {isEditMode ? (
            <View style={styles.selectBar}>
              <View style={styles.textSection}>
                <AppText variant="labelSmall" style={styles.categoryText}>
                  채널
                </AppText>
                <AppText variant="caption" style={styles.categorySubText}>
                  {editBoardLabel}
                </AppText>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setIsBoardModalVisible(true)}
              style={styles.selectBar}
              onLayout={(e) => {
                const { x, y, width, height } = e.nativeEvent.layout;
                setDropdownLayout({ x, y, width, height });
              }}
            >
              <View style={styles.textSection}>
                <AppText variant="labelSmall" style={styles.categoryText}>
                  채널
                </AppText>
                <AppText variant="caption" style={styles.categorySubText}>
                  {selectedBoardLabel}
                </AppText>
              </View>

              <DropDownIcon width={12} height={10} />
            </Pressable>
          )}

          <View style={styles.divider} />

          <View style={styles.profileRow}>
            <LinearGradient
              colors={team?.gradient?.colors || ["#3A3D44", "#3A3D44"]}
              locations={team?.gradient?.locations}
              start={team?.gradient?.start}
              end={team?.gradient?.end}
              style={styles.avatarCircle}
            >
              {ProfileIcon ? (
                <ProfileIcon
                  width={getFeedProfileIconSize(author?.favoriteTeamCode, 26)}
                  height={getFeedProfileIconSize(author?.favoriteTeamCode, 26)}
                />
              ) : (
                <AppText style={{ color: "#FFF" }}>
                  {(author?.nickname?.trim()?.[0] ?? "U").toUpperCase()}
                </AppText>
              )}
            </LinearGradient>
            <View style={styles.profileTextWrap}>
              <View style={styles.profileNameRow}>
                <AppText
                  variant="caption"
                  className="text-[#E5E5E5]"
                  style={styles.profileNickname}
                >
                  {author?.nickname}
                </AppText>
                <View
                  style={[
                    styles.teamChip,
                    team?.labelStyle?.backgroundColor != null && {
                      backgroundColor: team.labelStyle.backgroundColor,
                    },
                  ]}
                >
                  <AppText
                    variant="smallRegular"
                    style={[
                      styles.teamName,
                      {
                        color: team?.labelStyle?.color ?? "#CCCCCC",
                      },
                    ]}
                  >
                    {author?.favoriteTeamName}
                  </AppText>
                </View>
              </View>

              <View
                style={styles.inputCard}
                onLayout={(e) => {
                  inputOffsetY.current = e.nativeEvent.layout.y;
                }}
              >
                <View style={styles.richInputWrap}>
                  <View pointerEvents="none" style={styles.richTextLayer}>
                    {content.length === 0 ? (
                      <AppText
                        variant="other"
                        style={styles.richTextPlaceholder}
                      >
                        오늘의 팬심을 한 줄로 남겨보세요.
                      </AppText>
                    ) : (
                      <AppText
                        variant="other"
                        style={styles.richTextContainer}
                        suppressHighlighting
                      >
                        {renderHighlightedContent}
                      </AppText>
                    )}
                  </View>

                  <TextInput
                    value={content}
                    onChangeText={handleChangeContent}
                    style={styles.richInput}
                    multiline
                    textAlignVertical="top"
                    scrollEnabled={false}
                    selectionColor="rgba(255,255,255,0.25)"
                    cursorColor="#E5E5E5"
                    onContentSizeChange={(e) => {
                      const inputHeight = e.nativeEvent.contentSize.height;
                      scrollRef.current?.scrollTo({
                        y: inputOffsetY.current + inputHeight - 200,
                        animated: true,
                      });
                    }}
                  />
                </View>

                <ImagePreviewList
                  images={previewImages}
                  onRemove={handleRemoveImage}
                />
              </View>

              <View style={styles.counterRow}>
                <AppText
                  variant="labelSmall"
                  style={
                    isContentMax ? styles.counterTextMax : styles.counterText
                  }
                >
                  {`${content.length}/${MAX_CONTENT_LENGTH}자`}
                </AppText>
                <AppText
                  variant="labelSmall"
                  style={
                    isImagesMax ? styles.counterTextMax : styles.counterText
                  }
                >
                  {` | ${totalImageCount}/${MAX_IMAGES}장`}
                </AppText>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.actionRow}>
            <Pressable
              onPress={handlePressGallery}
              style={styles.actionIconBtn}
            >
              <GalleryIcon width={20} height={20} />
            </Pressable>
            <Pressable onPress={handlePressCamera} style={styles.actionIconBtn}>
              <CameraIcon width={23} height={23} />
            </Pressable>

            <View style={{ flex: 1 }} />

            <View style={styles.hashTagHintChip}>
              <AppText variant="labelSmall" style={styles.hashtagText}>
                #입력으로 해시태그 추가
              </AppText>
            </View>
            {/* )} */}
          </View>

          <View style={styles.guideBox}>
            <AppText
              variant="semi13"
              className="text-[#E5E5E5]"
              style={styles.guideHeading}
            >
              🔥 응원 문화 가이드
            </AppText>
            <View style={styles.guideList}>
              <AppText
                variant="labelSmall"
                className="text-[#9B9B9B]"
                style={styles.guideLine}
              >
                · 상대팀 비하 및 욕설은 자동으로 신고됩니다.
              </AppText>
              <AppText
                variant="labelSmall"
                className="text-[#9B9B9B]"
                style={styles.guideLine}
              >
                · 부적절한 게시물은 사전 통보 없이 삭제될 수 있습니다.
              </AppText>
              <AppText
                variant="labelSmall"
                className="text-[#9B9B9B]"
                style={styles.guideLine}
              >
                · 게시글은 작성 후 24시간 내 수정 가능합니다.
              </AppText>
            </View>
          </View>
        </ScrollView>

        {/* 드롭다운 아이콘(셀렉트 바) 눌렀을 때 렌더링되는 게시판 선택 모달 */}
        <Modal
          transparent
          visible={isBoardModalVisible}
          animationType="fade"
          onRequestClose={() => setIsBoardModalVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setIsBoardModalVisible(false)}
          >
            <Pressable
              style={[
                styles.boardModalCard,
                {
                  marginTop: dropdownLayout.y + dropdownLayout.height + 135,
                },
              ]}
              onPress={() => {}}
            >
              {boards.map((b, index) => (
                <React.Fragment key={b.id}>
                  {index > 0 && <View style={[styles.boardOptionDivider]} />}
                  <Pressable
                    style={styles.boardOption}
                    onPress={() => {
                      setSelectedBoardId(b.id);
                      setIsBoardModalVisible(false);
                    }}
                  >
                    <AppText variant="caption" style={styles.labelText}>
                      {b.label}
                    </AppText>
                  </Pressable>
                </React.Fragment>
              ))}
            </Pressable>
          </Pressable>
        </Modal>

        {/* 제한 모달 (이미지/해시태그/중복등록 등 공통) */}
        <Modal
          transparent
          visible={isLimitModalVisible}
          animationType="fade"
          onRequestClose={() => setIsLimitModalVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setIsLimitModalVisible(false)}
          >
            <Pressable style={styles.limitModalCard} onPress={() => {}}>
              <View style={styles.limitModalContent}>
                <AppText variant="middle" style={styles.limitModalText}>
                  ⚠️
                </AppText>
                <AppText
                  variant="middle"
                  className="text-[#E5E5E5]"
                  style={styles.limitModalText}
                >
                  {limitModalMessage || ""}
                </AppText>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        <LeaveConfirmModal
          visible={isLeaveModalVisible}
          onClose={() => setIsLeaveModalVisible(false)}
          title="나가시겠어요?"
          description="지금 나가시면 작성 내용이 사라져요 😭"
          onLeave={() => navigation.goBack()}
        />
        {/* 이미지 첨부 + 업로드 관련 로딩 */}
        <Modal transparent visible={isSpinning} animationType="fade">
          <View style={styles.loadingOverlay}>
            <Animated.View style={spinStyle}>
              <CommunityLoadingIcon width={44} height={44} />
            </Animated.View>
          </View>
        </Modal>

        {uploadBodyToastVisible ? (
          <View pointerEvents="auto" style={styles.uploadHintToastOverlay}>
            <View pointerEvents="none" style={styles.uploadHintToast}>
              <AppText variant="caption" style={styles.uploadHintToastText}>
                {UPLOAD_REQUIRES_BODY_TOAST}
              </AppText>
            </View>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  uploadButton: {
    borderRadius: 15,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  uploadButtonDisabled: {
    backgroundColor: "#232323",
  },
  uploadHintToastOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 100,
    elevation: 24,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  uploadHintToast: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(30, 30, 30, 0.95)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
  },
  uploadHintToastText: {
    color: "#E5E5E5",
    textAlign: "center",
    lineHeight: 18,
  },
  screenTitle: {
    lineHeight: 29,
  },
  uploadButtonEnabled: {
    backgroundColor: "#F9F9F9",
  },
  container: {
    flex: 1,
  },
  uploadBtnTextDisabled: {
    color: "rgba(228, 228, 228, 0.50)",
    lineHeight: 19,
  },
  uploadBtnTextEnabled: {
    color: "#1E1E1E",
    lineHeight: 19,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  selectBar: {
    paddingVertical: 15,
    borderRadius: 5,
    backgroundColor: "#252823",
    borderWidth: 1,
    borderColor: "#232323",
    paddingHorizontal: 16,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  categoryText: {
    color: "rgba(228, 228, 228, 0.50)",
    lineHeight: 16,
  },
  categorySubText: {
    color: "#E5E5E5",
    lineHeight: 19,
  },
  divider: {
    borderWidth: 1,
    borderColor: "rgba(59, 70, 50, 0.50)",
    marginVertical: 18,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  profileTextWrap: {
    flex: 1,
  },
  profileNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileNickname: {
    lineHeight: 18,
  },
  teamName: {
    lineHeight: 14,
  },
  teamChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: "rgba(60, 60, 60, 0.5)",
  },
  inputCard: {
    justifyContent: "flex-start",
    paddingBottom: 18,
    marginTop: 3,
  },
  richInputWrap: {
    marginBottom: 12,
  },
  richTextLayer: {
    minHeight: 10,
  },
  richTextContainer: {
    fontSize: 15,
    lineHeight: 19,
    color: "#E5E5E5",
  },
  richTextBase: {
    fontSize: 15,
    lineHeight: 19,
  },
  richTextNormal: {
    color: "#E5E5E5",
  },
  richTextHash: {
    color: "#6F9D48",
  },
  richTextPlaceholder: {
    fontSize: 15,
    lineHeight: 19,
    color: "#6F6F6F",
  },
  richInput: {
    ...StyleSheet.absoluteFillObject,
    color: "transparent",
    fontSize: 15,
    lineHeight: 19,
    padding: 0,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 12,
  },
  counterText: {
    color: "rgba(228, 228, 228, 0.50)",
    lineHeight: 16,
  },
  counterTextMax: {
    color: "#EEEEEE",
    lineHeight: 16,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionIconBtn: {
    borderRadius: 5,
    backgroundColor: "#1E1E1E",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#232323",
    width: 46,
    height: 46,
  },
  hashTagHintChip: {
    height: 44,
    borderRadius: 20,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(139, 196, 90, 0.11)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  hashtagText: {
    color: "rgba(228, 228, 228, 0.50)",
    lineHeight: 16.3,
  },

  guideBox: {
    marginTop: 18,
  },
  guideHeading: {
    lineHeight: 18,
  },
  guideLine: {
    lineHeight: 16,
  },
  guideList: {
    marginTop: 10,
    gap: 6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 20,
  },
  boardModalCard: {
    borderRadius: 5,
    backgroundColor: "#252823",
    borderWidth: 1,
    borderColor: "#252823",
  },
  boardOption: {
    paddingVertical: 12,
  },
  boardOptionDivider: {
    height: 1,
    backgroundColor: "#353F2D",
  },
  labelText: {
    paddingVertical: 4,
    paddingHorizontal: 13,
    color: "#E5E5E5",
    lineHeight: 19,
  },
  limitModalCard: {
    marginTop: 330,
    alignSelf: "center",
    borderRadius: 10,
    backgroundColor: "#2B2B2B",
    paddingVertical: 10,
    paddingHorizontal: 35,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  limitModalContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  limitModalText: {
    lineHeight: 18,
  },
});
