import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { isOfflineError } from "../../../../shared/utils/networkErrors";
import AppHeader from "../../../../shared/components/AppHeader";
import LeaveConfirmModal from "../../../../shared/components/LeaveConfirmModal";
import { AppText } from "../../../../shared/theme/components/AppText";
import BackIcon from "../../../../shared/assets/svg/chevrons/back.svg";
import CloseIcon from "../../assets/svg/closeIcon.svg";
import CircleWarning from "../../assets/svg/Circle_Warning.svg";
import { useUserStore } from "../../../../shared/store/userStore";
import useUpdateBioMutation from "../../hooks/useUpdateBioMutation";

const BIO_MAX_LEN = 50;
const INPUT_PLACEHOLDER = "한 줄 소개를 작성해보세요 :)";
const BIO_INFO_ACCESSORY_ID = "editBioInfoAccessory";

const EditBioScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const updateBioMutation = useUpdateBioMutation();
  const [bioDraft, setBioDraft] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const initialBioRef = useRef("");

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const subShow = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true),
    );
    const subHide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false),
    );
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const v = useUserStore.getState().user?.bio ?? "";
      initialBioRef.current = v;
      setBioDraft(v);
    }, []),
  );

  const isSaving = updateBioMutation.isPending;

  const normalizedDraft = bioDraft.trim().slice(0, BIO_MAX_LEN);
  const normalizedInitial = (initialBioRef.current ?? "").trim();
  const isDirty = normalizedDraft !== normalizedInitial;
  const canSave = isDirty && !isSaving;

  const handleBack = () => {
    const normalized = bioDraft.trim().slice(0, BIO_MAX_LEN);
    const initial = (initialBioRef.current ?? "").trim();
    if (normalized !== initial) {
      setLeaveModalVisible(true);
    } else {
      navigation.goBack();
    }
  };

  const handleSave = () => {
    if (isSaving || !isDirty) return;
    const normalized = bioDraft.trim().slice(0, BIO_MAX_LEN);

    updateBioMutation.mutate(
      { bio: normalized === "" ? "" : normalized },
      {
        onSuccess: (data) => {
          const nextBio = data?.bio ?? null;
          initialBioRef.current = nextBio ?? "";
          const current = useUserStore.getState().user;
          if (current) {
            setUser({
              ...current,
              bio: nextBio ?? undefined,
            });
          }
          navigation.goBack();
        },
        onError: (e) => {
          if (isOfflineError(e)) return;
          const msg =
            e?.response?.data?.message ??
            e?.message ??
            "한 줄 소개를 저장하지 못했습니다.";
          Alert.alert("오류", String(msg));
        },
      },
    );
  };

  const handleClearBio = () => {
    if (isSaving) return;
    setBioDraft("");
  };

  const saveEnabledStyle = canSave
    ? styles.uploadButtonEnabled
    : styles.uploadButtonDisabled;
  const saveTextStyle = canSave
    ? styles.uploadBtnTextEnabled
    : styles.uploadBtnTextDisabled;

  const renderInfoBox = () => (
    <View style={styles.infoBox}>
      <View style={styles.infoBoxLeftBar} />
      <View style={styles.infoBoxInner}>
        <CircleWarning width={14} height={14} />
        <AppText variant="spaced" style={styles.infoText}>
          빈 값으로 저장 시 한 줄 소개가 삭제됩니다
        </AppText>
      </View>
    </View>
  );

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <AppHeader
        left={
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <BackIcon width={12} height={18.5} />
          </TouchableOpacity>
        }
        center={
          <AppText variant="displayTitle2" className="text-[#E5E5E5]">
            한 줄 소개
          </AppText>
        }
        right={
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.uploadButton, saveEnabledStyle]}
            disabled={!canSave}
            activeOpacity={0.85}
          >
            <AppText variant="caption" style={saveTextStyle}>
              저장
            </AppText>
          </TouchableOpacity>
        }
      />

      {Platform.OS === "ios" ? (
        <InputAccessoryView nativeID={BIO_INFO_ACCESSORY_ID}>
          <View style={styles.infoAccessoryContainer}>{renderInfoBox()}</View>
        </InputAccessoryView>
      ) : null}

      <View style={styles.body}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <AppText variant="caption" style={styles.fieldLabel}>
              한 줄 소개
            </AppText>

            <View style={styles.inputWrap}>
              <TextInput
                value={bioDraft}
                onChangeText={(t) => setBioDraft(t.slice(0, BIO_MAX_LEN))}
                placeholder={INPUT_PLACEHOLDER}
                placeholderTextColor="rgba(228, 228, 228, 0.35)"
                multiline
                maxLength={BIO_MAX_LEN}
                editable={!isSaving}
                textAlignVertical="top"
                style={styles.textInput}
                inputAccessoryViewID={
                  Platform.OS === "ios" ? BIO_INFO_ACCESSORY_ID : undefined
                }
              />
              {bioDraft.length > 0 ? (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={handleClearBio}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel="전체 삭제"
                >
                  <CloseIcon width={21} height={21} />
                </TouchableOpacity>
              ) : null}
            </View>

            <AppText variant="smallRegular" style={styles.charCount}>
              {bioDraft.length}/{BIO_MAX_LEN}
            </AppText>
          </ScrollView>

          {Platform.OS === "android" ? (
            <View
              style={[
                styles.infoBoxAndroidWrap,
                {
                  paddingBottom: keyboardVisible
                    ? 0
                    : Math.max(insets.bottom, 8),
                },
              ]}
            >
              {renderInfoBox()}
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </View>

      <LeaveConfirmModal
        visible={leaveModalVisible}
        onClose={() => setLeaveModalVisible(false)}
        title="나가시겠어요?"
        description="지금 나가시면 작성 내용이 사라져요 😭"
        onLeave={() => navigation.goBack()}
      />
    </SafeAreaView>
  );
};

export default EditBioScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  flex: {
    flex: 1,
  },
  body: {
    flex: 1,
    position: "relative",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    flexGrow: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  uploadButton: {
    borderRadius: 15,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  uploadButtonDisabled: {
    backgroundColor: "#232323",
  },
  uploadButtonEnabled: {
    backgroundColor: "#F9F9F9",
  },
  uploadBtnTextDisabled: {
    color: "rgba(228, 228, 228, 0.50)",
    lineHeight: 19,
  },
  uploadBtnTextEnabled: {
    color: "#1E1E1E",
    lineHeight: 17,
  },
  fieldLabel: {
    color: "#F9F9F9",
    marginBottom: 10,
  },
  inputWrap: {
    position: "relative",
    minHeight: 50,
  },
  textInput: {
    minHeight: 50,
    paddingLeft: 16,
    paddingRight: 48,
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "#6F9D48",
    color: "#F9F9F9",
    fontSize: 14,
    lineHeight: 19.1,
  },
  clearBtn: {
    position: "absolute",
    right: 10,
    top: 0,
    bottom: 0,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  charCount: {
    alignSelf: "flex-end",
    marginTop: 5,
    color: "rgba(228, 228, 228, 0.45)",
    lineHeight: 17.7,
  },
  infoAccessoryContainer: {
    backgroundColor: "#121212",
    width: "100%",
  },
  /** Android: KeyboardAvoidingView 하단에 두어 키보드에 붙음 (adjustResize 권장) */
  infoBoxAndroidWrap: {
    width: "100%",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "stretch",
    overflow: "hidden",
    backgroundColor: "#252823",
    marginBottom: 6,
  },
  /** 피그마: 왼쪽 6px 세로 띠 (infoBox 높이와 동일) */
  infoBoxLeftBar: {
    backgroundColor: "rgba(139, 196, 90, 0.11)",
    width: 6,
    height: 52,
  },
  infoBoxInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  infoText: {
    flex: 1,
    marginLeft: 5,
    color: "rgba(228, 228, 228, 0.55)",
    lineHeight: 15.5,
  },
});
