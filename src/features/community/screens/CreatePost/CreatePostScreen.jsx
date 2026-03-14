import React, { useMemo, useState } from "react";
import {
  Dimensions,
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
import { AppText } from "../../../../shared/theme/components/AppText";
import AppHeader from "../../../../shared/component/AppHeader";
import { useNavigation } from "@react-navigation/native";
import BackIcon from "../../../../shared/assets/svg/chevrons/back.svg";
import CameraIcon from "../../../community/assets/svg/CommunityPost/camera.svg";
import GalleryIcon from "../../../community/assets/svg/CommunityPost/image.svg";
import DropDownIcon from "../../assets/svg/CommunityPost/dropDown.svg";
// import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("window");

const MAX_CONTENT_LENGTH = 2000;
const MAX_IMAGES = 5;

const CreatePostScreen = () => {
  const navigation = useNavigation();

  const [content, setContent] = useState("");
  const [selectedBoardId, setSelectedBoardId] = useState("cheer");
  const [isBoardModalVisible, setIsBoardModalVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [isImageLimitModalVisible, setIsImageLimitModalVisible] =
    useState(false);
  const [isHashEditing, setIsHashEditing] = useState(false);
  const [hashTagRaw, setHashTagRaw] = useState("");

  const isUploadEnabled = content.trim().length > 0 || images.length > 0;

  // 드롭다운 아이콘 버튼 위치
  const [dropdownLayout, setDropdownLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const mockUser = useMemo(
    () => ({
      nickname: "왕밤빵",
      selectedTeam: "LG 트윈스",
    }),
    [],
  );

  const boards = useMemo(
    () => [
      { id: "cheer", label: "응원팀 게시판" },
      { id: "all", label: "전체 게시판" },
    ],
    [],
  );

  const selectedBoardLabel = useMemo(() => {
    const found = boards.find((b) => b.id === selectedBoardId);
    return found?.label ?? "";
  }, [boards, selectedBoardId]);

  const avatarText = useMemo(() => {
    if (mockUser.nickname === "왕밤빵") return "왕";
    return (mockUser.nickname?.trim()?.[0] ?? "U").toUpperCase();
  }, [mockUser.nickname]);

  const handleChangeContent = (text) => {
    const next = text.slice(0, MAX_CONTENT_LENGTH);
    setContent(next);
  };

  const handleAddImages = (newUris) => {
    setImages((prev) => {
      const merged = [...prev, ...newUris];
      if (merged.length <= MAX_IMAGES) return merged;
      setIsImageLimitModalVisible(true);
      return merged.slice(0, MAX_IMAGES);
    });
  };

  const handlePressGallery = async () => {
    // try {
    //   const result = await ImagePicker.launchImageLibraryAsync({
    //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //     allowsMultipleSelection: true,
    //     quality: 0.8,
    //   });

    //   if (!result.canceled) {
    //     const uris = result.assets.map((asset) => asset.uri);
    //     handleAddImages(uris);
    //   }
    // } catch (error) {
    //   console.log("이미지 선택 실패:", error);
    // }
    handleAddImages([`mock://image-${Date.now()}`]);
  };

  const handlePressCamera = () => {
    // 촬영 완료 후 결과 uri를 handleAddImages로 전달할 것
    const parentNav = navigation.getParent?.();
    if (parentNav?.navigate) {
      parentNav.navigate("PhotoBooth", { screen: "Camera" });
      return;
    }
    navigation.navigate("PhotoBooth", { screen: "Camera" });
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (!isUploadEnabled) return;

    const postData = {
      content,
      boardId: selectedBoardId,
      images,
      hashTags: hashTagRaw,
    };

    console.log("업로드할 데이터:", postData);

    navigation.navigate("UploadSuccess");
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
              onPress={() => navigation.goBack()}
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
                isUploadEnabled
                  ? styles.uploadButtonEnabled
                  : styles.uploadButtonDisabled,
              ]}
              disabled={!isUploadEnabled}
            >
              <AppText
                variant="caption"
                style={
                  isUploadEnabled
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
            <View style={styles.avatarCircle}>
              <AppText variant="caption" className="text-[#121212]">
                {avatarText}
              </AppText>
            </View>
            <View style={styles.profileTextWrap}>
              <View style={styles.profileNameRow}>
                <AppText variant="caption" className="text-[#E5E5E5]">
                  {mockUser.nickname}
                </AppText>
                <View style={styles.teamChip}>
                  <AppText variant="smallRegular" className="text-[#FF4D6D]">
                    {mockUser.selectedTeam}
                  </AppText>
                </View>
              </View>

              {/* 닉네임 바로 아래에 위치하는 내용/이미지 입력 영역 */}
              <View style={styles.inputCard}>
                <TextInput
                  value={content}
                  onChangeText={handleChangeContent}
                  placeholder="오늘의 팬심을 한 줄로 남겨보세요."
                  placeholderTextColor="#6F6F6F"
                  style={styles.contentInput}
                  multiline
                  textAlignVertical="top"
                />
                <View style={styles.counterRow}>
                  <AppText variant="labelSmall" className="text-[#6F6F6F]">
                    {`${content.length}/${MAX_CONTENT_LENGTH}자`}
                  </AppText>
                  <AppText variant="labelSmall" className="text-[#6F6F6F]">
                    {` | ${images.length}/${MAX_IMAGES}장`}
                  </AppText>
                </View>
              </View>
            </View>
          </View>

          {/* 추후 image-picker 라이브러리로 수정  */}
          {images.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbRow}
            >
              {images.map((uri, idx) => (
                <View key={`${uri}-${idx}`} style={styles.thumbWrap}>
                  {uri.startsWith("http") || uri.startsWith("file") ? (
                    <Image source={{ uri }} style={styles.thumbImage} />
                  ) : (
                    <View style={styles.thumbFallback}>
                      <AppText variant="caption" className="text-[#E5E5E5]">
                        {idx + 1}
                      </AppText>
                    </View>
                  )}
                  <Pressable
                    onPress={() => handleRemoveImage(idx)}
                    style={styles.thumbRemove}
                    hitSlop={8}
                  >
                    <AppText variant="caption" className="text-[#E5E5E5]">
                      ×
                    </AppText>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}

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

            {/* {isHashEditing ? (
              <View style={styles.hashTagChip}>
                <AppText variant="caption" className="text-[#BDBDBD]">
                  #
                </AppText>
                <TextInput
                  value={hashTagRaw}
                  onChangeText={setHashTagRaw}
                  style={styles.hashTagInput}
                  placeholderTextColor="#6F6F6F"
                  autoFocus
                />
              </View>
            ) : ( */}
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

          {hashTagRaw.trim().length > 0 && (
            <View style={styles.hashTagDisplayRow}>
              <AppText variant="caption" className="text-[#BDBDBD]">
                {`#${hashTagRaw.split(/\s+/).filter(Boolean).join(" #")}`}
              </AppText>
            </View>
          )}
          {/* </View> */}

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
              {/* <AppText variant="displayTitle2" className="text-[#E5E5E5]">
                {selectedBoardLabel}
              </AppText>
              <View style={styles.boardDivider} /> */}
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
              <AppText variant="displayTitle2" className="text-[#E5E5E5]">
                ⚠️ 사진은 최대 5장까지{`\n`}추가 가능합니다.
              </AppText>
            </Pressable>
          </Pressable>
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
    backgroundColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
  },
  profileTextWrap: {
    flex: 1,
  },
  profileNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subText: {
    color: "#6F6F6F",
    marginTop: 6,
  },
  teamChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: "rgba(255,77,109,0.12)",
  },
  inputCard: {
    justifyContent: "center",
  },
  contentInput: {
    color: "#E5E5E5",
    fontSize: 15,
    lineHeight: 21,
    minHeight: 100,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
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
    borderRadius: 22,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#232323",
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  hashtagText: {
    color: "rgba(228, 228, 228, 0.50)",
  },
  thumbRow: {
    paddingTop: 14,
    gap: 10,
  },
  thumbWrap: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#232323",
    backgroundColor: "#1E1E1E",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  thumbFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbRemove: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
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
  boardDivider: {
    height: 1,
    backgroundColor: "#232323",
    marginTop: 12,
    marginBottom: 4,
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
    marginTop: 180,
    alignSelf: "center",
    width: width - 64,
    borderRadius: 12,
    backgroundColor: "#2B2B2B",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  hashTagInput: {
    flex: 1,
    color: "#E5E5E5",
    paddingVertical: 0,
  },
  hashTagDisplayRow: {
    marginTop: 8,
  },
});
