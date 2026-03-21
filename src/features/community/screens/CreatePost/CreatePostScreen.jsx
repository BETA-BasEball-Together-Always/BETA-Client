import React, { useEffect, useMemo, useRef, useState } from "react";
import {
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
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { AppText } from "../../../../shared/theme/components/AppText";
import AppHeader from "../../../../shared/component/AppHeader";
import { useNavigation, useRoute } from "@react-navigation/native";
import BackIcon from "../../../../shared/assets/svg/chevrons/back.svg";
import CameraIcon from "../../../community/assets/svg/CommunityPost/camera.svg";
import GalleryIcon from "../../../community/assets/svg/CommunityPost/image.svg";
import DropDownIcon from "../../assets/svg/CommunityPost/dropDown.svg";
import { useUserStore } from "../../../../shared/store/userStore";
import { TEAM_DATA } from "../../../../shared/constants/teams";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import {
  invalidateCommunityPostLists,
  useCreatePostMutation,
} from "../../services/post/createPostMutation";
import { getApiErrorMessage } from "../../../../shared/utils/apiErrorMessage";
import { useUpdatePostMutation } from "../../services/post/updatePostMutation";
import { useQueryClient } from "@tanstack/react-query";

import CommunityLoadingIcon from "../../assets/svg/CommunityPost/communityLoading.svg";

import ImagePreviewList from "../../component/createPost/ImagePreviewList";

const { width } = Dimensions.get("window");

const MAX_CONTENT_LENGTH = 2000;
const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB (단일 이미지 상한)
const MAX_TOTAL_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB (요청 전체 이미지 합산 상한, nginx 한도 대비)
const MAX_UPLOAD_WIDTH = 1280; // 업로드 시 리사이즈 기준 폭
const MAX_HASHTAGS = 5;
const MAX_HASHTAG_LEN = 20;
const DUPLICATE_POST_WINDOW_MS = 30 * 1000; // 30초

const CreatePostScreen = () => {
  const scrollRef = useRef(null);
  const inputOffsetY = useRef(0);
  const initialEditRef = useRef(null);

  const navigation = useNavigation();
  const route = useRoute();
  const editPost = route.params?.editPost;
  const isEditMode = !!editPost?.postId;

  const author = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const createPostMutation = useCreatePostMutation();
  const updatePostMutation = useUpdatePostMutation();

  const [content, setContent] = useState(() =>
    isEditMode ? (editPost?.content ?? "") : "",
  );
  const [selectedBoardId, setSelectedBoardId] = useState("TEAM");
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

  useEffect(() => {
    if (!editPost?.postId) {
      initialEditRef.current = null;
      return;
    }
    setContent(editPost.content ?? "");
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
      content: editPost.content ?? "",
    };
  }, [editPost?.postId]);

  useEffect(() => {
    if (!editPost?.postId) return;
    const ch = editPost.channel;
    if (ch === "ALL") {
      setSelectedBoardId("ALL");
    } else {
      setSelectedBoardId("TEAM");
    }
  }, [editPost?.postId, editPost?.channel]);

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
  const isUploadEnabled = content.trim().length > 0 || totalImageCount > 0;

  const isUploading = createPostMutation.isPending || updatePostMutation.isPending;
  const isSpinning = isPickingMedia || isUploading;

  const spinAnim = React.useRef(new Animated.Value(0)).current;
  const lastUploadRef = useRef({ content: "", at: 0 });

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
    return code ? TEAM_DATA[code] : null;
  }, [author?.favoriteTeamCode]);
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

  const compressIfNeeded = async (asset) => {
    // 아주 큰 이미지일 경우 가로 1280 기준으로 리사이즈 + jpeg 압축
    try {
      const actions = [];
      if (asset.width && asset.width > MAX_UPLOAD_WIDTH) {
        const ratio = MAX_UPLOAD_WIDTH / asset.width;
        actions.push({
          resize: {
            width: MAX_UPLOAD_WIDTH,
            height: Math.round(asset.height * ratio),
          },
        });
      }

      if (actions.length === 0) {
        return asset;
      }

      const result = await ImageManipulator.manipulateAsync(
        asset.uri,
        actions,
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );

      return {
        uri: result.uri,
        width: result.width,
        height: result.height,
      };
    } catch {
      return asset;
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

      // 먼저 필요하다면 리사이즈/압축
      const a = await compressIfNeeded(original);

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
    // - 공백/줄바꿈으로 구분된 토큰만 인식
    // - 각 20자 이하, 중복 제거
    const set = new Set();
    const regex = new RegExp(`(?:^|\\s)#([^\\s#]{1,${MAX_HASHTAG_LEN}})`, "g");
    let match;
    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(content)) !== null) {
      const tag = (match[1] ?? "").trim();
      if (!tag) continue;
      set.add(tag);
    }
    return Array.from(set);
  }, [content]);

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
    // "#태그" 토큰만 초록색으로 하이라이트 (공백/줄바꿈 기준)
    // 공백 자체도 그대로 렌더링해야 줄바꿈/간격이 맞습니다.
    const parts = content.split(/(\s+)/);
    return parts.map((part, idx) => {
      const isSpace = /^\s+$/.test(part);
      const isHash =
        !isSpace &&
        part.startsWith("#") &&
        part.length > 1 &&
        !part.startsWith("##");
      return (
        <AppText
          // eslint-disable-next-line react/no-array-index-key
          key={`${idx}-${part}`}
          variant="other"
          style={[
            styles.richTextBase,
            isHash ? styles.richTextHash : styles.richTextNormal,
          ]}
        >
          {part}
        </AppText>
      );
    });
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
        // 품질을 낮춰 전송 용량을 줄입니다 (0~1)
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

  const handlePressCamera = () => navigation.navigate("CreatePostCamera");

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
    const captured = route?.params?.capturedAsset;
    if (!captured?.uri) return;
    (async () => {
      setIsPickingMedia(true);
      const validated = await validateAndNormalizeAssets([captured]);
      handleAddImages(validated);
      navigation.setParams({ capturedAsset: undefined });
      setIsPickingMedia(false);
    })();
  }, [route?.params?.capturedAsset]); //안 넘어가면 navigation, 이거 추가할 것

  const guessMimeType = (uri) => {
    const lower = (uri || "").toLowerCase();
    if (lower.endsWith(".png")) return "image/png";
    if (lower.endsWith(".gif")) return "image/gif";
    if (lower.endsWith(".webp")) return "image/webp";
    if (lower.endsWith(".heic")) return "image/jpeg";
    if (lower.endsWith(".heif")) return "image/jpeg";
    return "image/jpeg";
  };

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

    formData.append(fieldName, {
      uri: normalizeFileUri(asset.uri),
      name: `image-${Date.now()}-${idx}.${ext}`,
      type: mimeType,
    });
  };

  const handleUpload = () => {
    if (!isUploadEnabled || isUploading) return;

    if (hasHashTagOverflow) {
      openLimitModal("해시태그는 최대 5개만 추가 가능합니다.");
      return;
    }

    if (!isEditMode && selectedBoardId === "TEAM" && !author?.favoriteTeamCode) {
      openLimitModal("응원팀을 설정한 뒤 팀 게시판에 글을 작성할 수 있습니다.");
      return;
    }

    if (isEditMode) {
      const formData = new FormData();
      formData.append("content", content);
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
          onSuccess: () => {
            invalidateCommunityPostLists(queryClient);
            navigation.goBack();
          },
          onError: (e) => {
            const status = e?.response?.status;
            if (status === 413) {
              openLimitModal(
                "게시글 용량이 너무 큽니다.\n이미지 크기나 개수를 줄여 다시 시도해 주세요.",
              );
            }
            console.log("게시글 수정 실패:", e?.response?.data ?? e);
          },
        },
      );
      return;
    }

    const now = Date.now();
    const normalizedContent = content.trim();
    if (
      normalizedContent &&
      normalizedContent === lastUploadRef.current.content &&
      now - lastUploadRef.current.at < DUPLICATE_POST_WINDOW_MS
    ) {
      openLimitModal("30초 내 동일 내용 게시글은 등록할 수 없습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("content", content);
    formData.append("channel", createPostChannel);
    acceptedHashTags.forEach((tag) => {
      formData.append("hashtags", tag);
    });

    images.forEach((asset, idx) => {
      appendImageFile(formData, "images", asset, idx);
    });

    createPostMutation.mutate(formData, {
      onSuccess: (data) => {
        lastUploadRef.current = { content: normalizedContent, at: now };
        // 목록 갱신은 useCreatePostMutation onSuccess에서 처리
        navigation.navigate("UploadSuccess", {
          createdPostId: data?.postId ?? data?.id ?? null,
        });
      },
      onError: (e) => {
        const status = e?.response?.status;
        const data = e?.response?.data;
        if (status === 413) {
          openLimitModal(
            "게시글 용량이 너무 큽니다.\n이미지 크기나 개수를 줄여 다시 시도해 주세요.",
          );
          return;
        }
        if (status === 400 && Array.isArray(data?.errors) && data.errors[0]?.message) {
          openLimitModal(data.errors[0].message);
          return;
        }
        if (status === 400) {
          openLimitModal(getApiErrorMessage(e, "입력값을 확인해 주세요."));
          return;
        }
        console.log("게시글 업로드 실패:", e?.response?.data ?? e);
      },
    });
  };

  const isEditDirty = () => {
    if (!isEditMode) return isUploadEnabled;
    const init = initialEditRef.current;
    if (!init) return isUploadEnabled;
    if (content !== init.content) return true;
    if (pendingNewImages.length > 0) return true;
    if (deletedImageIds.length > 0) return true;
    return false;
  };

  const handlePressBack = () => {
    if (isEditMode ? isEditDirty() : isUploadEnabled) {
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
            <AppText variant="displayTitle2" className="text-[#E5E5E5]">
              {isEditMode ? "게시글 수정" : "새 글 작성"}
            </AppText>
          }
          right={
            <TouchableOpacity
              onPress={handleUpload}
              style={[
                styles.uploadButton,
                isUploadEnabled && !isUploading
                  ? styles.uploadButtonEnabled
                  : styles.uploadButtonDisabled,
              ]}
              disabled={!isUploadEnabled || isUploading}
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
                <ProfileIcon width={28} height={28} />
              ) : (
                <AppText style={{ color: "#FFF" }}>
                  {(author?.nickname?.trim()?.[0] ?? "U").toUpperCase()}
                </AppText>
              )}
            </LinearGradient>
            <View style={styles.profileTextWrap}>
              <View style={styles.profileNameRow}>
                <AppText variant="caption" className="text-[#E5E5E5]">
                  {author?.nickname}
                </AppText>
                <View style={styles.teamChip}>
                  <AppText variant="smallRegular" className="text-[#FF4D6D]">
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
            <AppText variant="semi13" className="text-[#E5E5E5]">
              🔥 응원 문화 가이드
            </AppText>
            <View style={styles.guideList}>
              <AppText variant="labelSmall" className="text-[#9B9B9B]">
                · 상대팀 비하 및 욕설은 자동으로 신고됩니다.
              </AppText>
              <AppText variant="labelSmall" className="text-[#9B9B9B]">
                · 부적절한 게시물은 사전 통보 없이 삭제될 수 있습니다.
              </AppText>
              <AppText variant="labelSmall" className="text-[#9B9B9B]">
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
                <AppText variant="middle">⚠️</AppText>
                <AppText variant="middle" className="text-[#E5E5E5]">
                  {limitModalMessage || ""}
                </AppText>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* 사용자가 게시글 작성 도중 뒤로가기 버튼 누르면 뜨는 모달창! */}
        <Modal
          transparent
          visible={isLeaveModalVisible}
          animationType="fade"
          onRequestClose={() => setIsLeaveModalVisible(false)}
        >
          <View style={styles.leaveModalOverlay}>
            <View style={styles.leaveModalCard}>
              <AppText variant="displayTitle" style={styles.leaveModalTitle}>
                나가시겠어요?
              </AppText>
              <AppText variant="middle" style={styles.leaveModalDesc}>
                {"지금 나가시면 작성 내용이 사라져요 😭"}
              </AppText>

              <TouchableOpacity
                style={styles.leaveConfirmBtn}
                onPress={() => {
                  setIsLeaveModalVisible(false);
                  navigation.goBack();
                }}
              >
                <AppText variant="medium" style={styles.leaveConfirmText}>
                  나가기
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.leaveCancelBtn}
                onPress={() => setIsLeaveModalVisible(false)}
              >
                <AppText variant="medium" style={styles.leaveCancelText}>
                  취소
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* 이미지 첨부 + 업로드 관련 로딩 */}
        <Modal transparent visible={isSpinning} animationType="fade">
          <View style={styles.loadingOverlay}>
            <Animated.View style={spinStyle}>
              <CommunityLoadingIcon width={44} height={44} />
            </Animated.View>
          </View>
        </Modal>
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
    marginTop: 12,
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
  },
  categorySubText: {
    color: "#E5E5E5",
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
  teamChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: "rgba(255,77,109,0.12)",
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
    lineHeight: 21,
    color: "#E5E5E5",
  },
  richTextBase: {
    fontSize: 15,
    lineHeight: 21,
  },
  richTextNormal: {
    color: "#E5E5E5",
  },
  richTextHash: {
    color: "#6F9D48",
  },
  richTextPlaceholder: {
    fontSize: 15,
    lineHeight: 21,
    color: "#6F6F6F",
  },
  richInput: {
    ...StyleSheet.absoluteFillObject,
    color: "transparent",
    fontSize: 15,
    lineHeight: 21,
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
  },
  counterTextMax: {
    color: "#EEEEEE",
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
  },

  guideBox: {
    marginTop: 18,
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

  // 나가기 모달창
  leaveModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  leaveModalCard: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#202325",
    paddingTop: 28,
    paddingBottom: 8,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  leaveModalTitle: {
    color: "#E5E5E5",
    marginBottom: 8,
  },
  leaveModalDesc: {
    color: "rgba(228, 228, 228, 0.50)",
    textAlign: "center",
    marginBottom: 24,
  },
  leaveConfirmBtn: {
    width: "100%",
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 4,
  },
  leaveConfirmText: {
    color: "#1E1E1E",
  },
  leaveCancelBtn: {
    width: "100%",
    paddingVertical: 16,
    alignItems: "center",
  },
  leaveCancelText: {
    color: "#9B9B9B",
  },
});
