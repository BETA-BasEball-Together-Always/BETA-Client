import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import AppHeader from "../../../../shared/component/AppHeader";
import { AppText } from "../../../../shared/theme/components/AppText";
import BackIcon from "../../../../shared/assets/svg/chevrons/back.svg";
import { TEAM_DATA } from "../../../../shared/constants/teams";
import { useUserStore } from "../../../../shared/store/userStore";
import useUpdateBioMutation from "../../hooks/useUpdateBioMutation";

const BIO_MAX_LEN = 50;
const INPUT_PLACEHOLDER = "한줄 소개를 입력하세요 (최대 50자)";

const EditBioScreen = () => {
  const navigation = useNavigation();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const updateBioMutation = useUpdateBioMutation();
  const [bioDraft, setBioDraft] = useState("");
  const [previewBio, setPreviewBio] = useState("");
  const initialBioRef = useRef("");

  useFocusEffect(
    useCallback(() => {
      const v = useUserStore.getState().user?.bio ?? "";
      initialBioRef.current = v;
      setBioDraft(v);
      setPreviewBio(v);
    }, []),
  );

  const favoriteTeamCode = user?.favoriteTeamCode;
  const team = favoriteTeamCode ? TEAM_DATA[favoriteTeamCode] : null;
  const ProfileIcon = team?.ProfileIcon;
  const nickname = user?.nickname ?? "";

  const isSaving = updateBioMutation.isPending;

  const handleBack = () => {
    const normalized = bioDraft.trim().slice(0, BIO_MAX_LEN);
    const initial = (initialBioRef.current ?? "").trim();
    if (normalized !== initial) {
      Alert.alert(
        "나가기",
        "저장하지 않은 변경 사항이 있습니다. 나가시겠습니까?",
        [
          { text: "취소", style: "cancel" },
          { text: "나가기", onPress: () => navigation.goBack() },
        ],
      );
    } else {
      navigation.goBack();
    }
  };

  const handleSave = () => {
    if (isSaving) return;
    const normalized = bioDraft.trim().slice(0, BIO_MAX_LEN);
    const initial = (initialBioRef.current ?? "").trim();
    if (normalized === initial) {
      navigation.goBack();
      return;
    }

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
          const msg =
            e?.response?.data?.message ??
            e?.message ??
            "한 줄 소개를 저장하지 못했습니다.";
          Alert.alert("오류", String(msg));
        },
      },
    );
  };

  const saveEnabledStyle = !isSaving
    ? styles.uploadButtonEnabled
    : styles.uploadButtonDisabled;
  const saveTextStyle = !isSaving
    ? styles.uploadBtnTextEnabled
    : styles.uploadBtnTextDisabled;

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
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
              한 줄 소개 수정
            </AppText>
          }
          right={
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.uploadButton, saveEnabledStyle]}
              disabled={isSaving}
              activeOpacity={0.85}
            >
              <AppText variant="caption" style={saveTextStyle}>
                저장
              </AppText>
            </TouchableOpacity>
          }
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 프로필 미리보기 */}
          <View style={styles.previewRow}>
            <LinearGradient
              colors={team?.gradient?.colors || ["#3A3D44", "#3A3D44"]}
              locations={team?.gradient?.locations}
              start={team?.gradient?.start}
              end={team?.gradient?.end}
              style={styles.avatarCircle}
            >
              {ProfileIcon ? (
                <ProfileIcon width={30} height={30} />
              ) : (
                <AppText style={{ color: "#FFF" }}>{nickname?.[0]}</AppText>
              )}
            </LinearGradient>
            <View style={styles.previewTextCol}>
              <AppText
                variant="heading"
                className="text-white"
                style={styles.previewNickname}
              >
                {nickname}
              </AppText>
              {/* <AppText variant="middle" style={styles.previewBio}>
                {previewBio?.trim() ? previewBio : ""}
              </AppText> */}
            </View>
          </View>

          <AppText variant="caption" style={styles.fieldLabel}>
            한 줄 소개
          </AppText>

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
          />

          <AppText variant="smallRegular" style={styles.charCount}>
            {bioDraft.length}/{BIO_MAX_LEN}
          </AppText>

          <View style={styles.infoBox}>
            <AppText variant="spaced" style={styles.infoText}>
              빈 값으로 저장 시 한 줄 소개가 삭제됩니다
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  uploadBtnTextDisabled: {
    color: "rgba(228, 228, 228, 0.50)",
    lineHeight: 19,
  },
  uploadBtnTextEnabled: {
    color: "#1E1E1E",
    lineHeight: 17,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 28,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  previewTextCol: {
    marginLeft: 16,
    flex: 1,
    minWidth: 0,
  },
  previewNickname: {
    lineHeight: 24.5,
  },
  previewBio: {
    marginTop: 6,
    color: "rgba(228, 228, 228, 0.55)",
    lineHeight: 17.7,
  },
  fieldLabel: {
    color: "rgba(228, 228, 228, 0.50)",
    marginBottom: 10,
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#1C1C1F",
    borderWidth: 1,
    borderColor: "#2E2E34",
    color: "#F9F9F9",
    fontSize: 14,
    lineHeight: 15,
    alignItems: "center",
  },
  charCount: {
    alignSelf: "flex-end",
    marginTop: 5,
    color: "rgba(228, 228, 228, 0.45)",
    lineHeight: 17,
  },
  infoBox: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#1C1C1F",
    borderLeftWidth: 2,
    borderLeftColor: "rgba(255, 255, 255, 0.2)",
  },
  infoText: {
    color: "rgba(228, 228, 228, 0.55)",
    lineHeight: 15.5,
  },
});
