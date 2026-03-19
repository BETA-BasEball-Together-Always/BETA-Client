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
import { useCreatePostMutation } from "../../services/post/createPostMutation";
import { useQueryClient } from "@tanstack/react-query";

import CommunityLoadingIcon from "../../assets/svg/CommunityPost/communityLoading.svg";

import ImagePreviewList from "../../component/createPost/ImagePreviewList";
import HashTagInput from "../../component/createPost/HashTagInput";

const { width } = Dimensions.get("window");

const MAX_CONTENT_LENGTH = 2000;
const MAX_IMAGES = 5;

const CreatePostScreen = () => {
  const scrollRef = useRef(null);
  const inputOffsetY = useRef(0);

  const navigation = useNavigation();
  const route = useRoute();
  const author = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const createPostMutation = useCreatePostMutation();

  const [content, setContent] = useState("");
  const [selectedBoardId, setSelectedBoardId] = useState("TEAM");
  const [isBoardModalVisible, setIsBoardModalVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [isImageLimitModalVisible, setIsImageLimitModalVisible] =
    useState(false);
  const [isHashEditing, setIsHashEditing] = useState(false);
  const [hashTagRaw, setHashTagRaw] = useState("");
  const [hashTags, setHashTags] = useState([]);
  const [isHashLimitModalVisible, setIsHashLimitModalVisible] = useState(false);

  const [isPickingMedia, setIsPickingMedia] = useState(false);

  const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);

  const isContentMax = content.length >= MAX_CONTENT_LENGTH;
  const isImagesMax = images.length >= MAX_IMAGES;
  const isUploadEnabled = content.trim().length > 0 || images.length > 0;

  const isUploading = createPostMutation.isPending;
  const isSpinning = isPickingMedia || isUploading;

  const spinAnim = React.useRef(new Animated.Value(0)).current;

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

  const createPostChannel = selectedBoardId;

  const handleChangeContent = (text) => {
    const next = text.slice(0, MAX_CONTENT_LENGTH);
    setContent(next);
  };

  // const isContentEmpty = content.length === 0;

  const handleAddImages = (newAssets) => {
    setImages((prev) => {
      const merged = [...prev, ...newAssets];
      if (merged.length <= MAX_IMAGES) return merged;
      setIsImageLimitModalVisible(true);
      return merged.slice(0, MAX_IMAGES);
    });
  };

  const handlePressGallery = async () => {
    try {
      setIsPickingMedia(true);
      const remaining = MAX_IMAGES - images.length;
      if (remaining <= 0) {
        setIsImageLimitModalVisible(true);
        return;
      }

      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: 0.9,
        exif: false,
        base64: false,
        // ios 이미지는 heic이므로 jpeg 자동 변환 요청!!
        preferredAssetRepresentationMode:
          ImagePicker.UIImagePickerPreferredAssetRepresentationMode?.Compatible,
      });

      if (!result.canceled) {
        handleAddImages(
          (result.assets ?? []).map((a) => ({
            uri: a.uri,
            width: a.width,
            height: a.height,
          })),
        );
      }
    } catch (error) {
      console.log("이미지 선택 실패:", error);
    } finally {
      setIsPickingMedia(false);
    }
  };

  const handlePressCamera = () => navigation.navigate("CreatePostCamera");

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const normalizeHashTag = (t) =>
    (t ?? "").toString().trim().replace(/^#/, "").slice(0, 20);

  const addHashTagsFromRaw = () => {
    const next = hashTagRaw
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => normalizeHashTag(t))
      .filter(Boolean);

    if (next.length === 0) {
      setIsHashEditing(false);
      setHashTagRaw("");
      return;
    }

    setHashTags((prev) => {
      const set = new Set(prev);
      let exceeded = false;
      next.forEach((t) => {
        if (set.size < 5) {
          set.add(t);
        } else {
          exceeded = true;
        }
      });
      if (exceeded) setIsHashLimitModalVisible(true);
      return Array.from(set).slice(0, 5);
    });
    setHashTagRaw("");
    setIsHashEditing(false);
  };

  useEffect(() => {
    const captured = route?.params?.capturedAsset;
    if (!captured?.uri) return;
    setIsPickingMedia(true);
    handleAddImages([captured]);
    navigation.setParams({ capturedAsset: undefined });
    setIsPickingMedia(false);
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

  const handleUpload = () => {
    if (!isUploadEnabled || isUploading) return;

    const formData = new FormData();
    formData.append("content", content);
    formData.append("channel", createPostChannel);
    hashTags.slice(0, 5).forEach((tag) => {
      formData.append("hashtags", tag);
    });

    images.forEach((asset, idx) => {
      if (!asset?.uri) return;
      const mimeType = guessMimeType(asset.uri);
      const extMap = {
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
        "image/jpeg": "jpg",
      };
      const ext = extMap[mimeType] ?? "jpg";

      formData.append("images", {
        uri: normalizeFileUri(asset.uri),
        name: `image-${Date.now()}-${idx}.${ext}`,
        type: mimeType,
      });
    });

    createPostMutation.mutate(formData, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["community"] });
        navigation.navigate("UploadSuccess", {
          createdPostId: data?.postId ?? data?.id ?? null,
        });
      },
      onError: (e) => {
        console.log("게시글 업로드 실패:", e?.response?.data ?? e);
      },
    });
  };

  const handlePressBack = () => {
    if (isUploadEnabled) {
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
              새 글 작성
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
                업로드
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
                <TextInput
                  value={content}
                  onChangeText={handleChangeContent}
                  placeholder="오늘의 팬심을 한 줄로 남겨보세요."
                  placeholderTextColor="#6F6F6F"
                  style={styles.contentInput}
                  multiline
                  textAlignVertical="top"
                  scrollEnabled={false}
                  onContentSizeChange={(e) => {
                    const inputHeight = e.nativeEvent.contentSize.height;
                    scrollRef.current?.scrollTo({
                      y: inputOffsetY.current + inputHeight - 200,
                      animated: true,
                    });
                  }}
                />

                <HashTagInput
                  isEditing={isHashEditing}
                  hashTagRaw={hashTagRaw}
                  hashTags={hashTags}
                  onChangeRaw={setHashTagRaw}
                  onSubmit={addHashTagsFromRaw}
                  onPressDisplay={() => {
                    setHashTagRaw(hashTags.map((t) => `#${t}`).join(" "));
                    setHashTags([]);
                    setIsHashEditing(true);
                  }}
                />

                <ImagePreviewList
                  images={images}
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
                  {` | ${images.length}/${MAX_IMAGES}장`}
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

            <Pressable
              style={styles.hashTagChip}
              onPress={() => setIsHashEditing(true)}
            >
              <AppText variant="labelSmall" style={styles.hashtagText}>
                #입력으로 해시태그 추가
              </AppText>
            </Pressable>
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

        {/* 이미지 초과 모달! */}
        <Modal
          transparent
          visible={isImageLimitModalVisible}
          animationType="fade"
          onRequestClose={() => setIsImageLimitModalVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setIsImageLimitModalVisible(false)}
          >
            <Pressable style={styles.limitModalCard} onPress={() => {}}>
              <View style={styles.limitModalContent}>
                <AppText variant="middle">⚠️</AppText>
                <AppText variant="middle" className="text-[#E5E5E5]">
                  {"사진은 최대 5장까지\n추가 가능합니다."}
                </AppText>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* 해시태그 초과 모달!! ui 비슷해서 컴포넌트로 뺄 방법 없는지 생각할 것 */}
        <Modal
          transparent
          visible={isHashLimitModalVisible}
          animationType="fade"
          onRequestClose={() => setIsHashLimitModalVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setIsHashLimitModalVisible(false)}
          >
            <Pressable style={styles.limitModalCard} onPress={() => {}}>
              <View style={styles.limitModalContent}>
                <AppText variant="middle">⚠️</AppText>
                <AppText variant="middle" className="text-[#E5E5E5]">
                  {"해시태그는 최대 5개까지\n추가 가능합니다."}
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
  },
  uploadBtnTextEnabled: {
    color: "#1E1E1E",
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
    // position: "relative",
    paddingBottom: 18,
    minHeight: 120,
  },
  contentInput: {
    color: "#E5E5E5",
    fontSize: 15,
    lineHeight: 21,
    minHeight: 10,
    marginBottom: 5,
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
  hashSection: {
    marginTop: 10,
    gap: 8,
  },
  hashInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  hashInputPrefix: {
    color: "#6F9D48",
  },
  hashTagInput: {
    flex: 1,
    color: "#E5E5E5",
    paddingVertical: 0,
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
  hashTagChip: {
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
