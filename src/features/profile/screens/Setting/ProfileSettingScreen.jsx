import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";

import AppHeader from "../../../../shared/component/AppHeader";
import { AppText } from "../../../../shared/theme/components/AppText";
import api from "../../../../shared/libs/api";
import { useUserStore } from "../../../../shared/store/userStore";
import { useUserEmotionSelectionStore } from "../../../community/store/userEmotionSelectionStore";
import {
  logoutApi,
  withdrawAccountApi,
} from "../../../auth/services/authSessionService";
import { getDeviceId } from "../../../auth/libs/Login/deviceUtils";
import { getRootNavigation } from "../../utils/navigation/getRootNavigation";
import {
  getApiErrorUserMessage,
  logAxiosError,
} from "../../../../shared/utils/debugAxiosError";
import {
  fetchCurrentDevicePushSettings,
  submitPushDetailSettingsToServer,
  submitPushEnabledToServer,
} from "../../../../shared/services/pushDeviceService";
import MoreArrow from "@features/auth/assets/common/svg/more_arrow.svg";

const NOTION_URLS = {
  notice: "",
  faq: "",
  termsOfService:
    "https://www.notion.so/29b226b7125d800c92c9e2d4fca7696e?source=copy_link",
  privacyPolicy:
    "https://www.notion.so/2e1226b7125d80398dece59a2b1f0a6b?source=copy_link",
};

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";
const PUSH_TOGGLE_W = 54;
const PUSH_TOGGLE_H = 33;
const PUSH_TOGGLE_THUMB = 28;
const PUSH_TOGGLE_PAD = 2.5;
const EMPTY_PUSH_SETTINGS = {
  pushEnabled: false,
  postCommentPushEnabled: false,
  postEmotionPushEnabled: false,
};

function PushSettingToggle({ value, onValueChange, busy }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: busy }}
      disabled={busy}
      onPress={() => onValueChange(!value)}
      style={[
        styles.pushToggleTrack,
        value ? styles.pushToggleTrackOn : styles.pushToggleTrackOff,
      ]}
    >
      <View
        style={[
          styles.pushToggleInner,
          { justifyContent: value ? "flex-end" : "flex-start" },
        ]}
      >
        <View style={styles.pushToggleThumb} />
      </View>
    </Pressable>
  );
}

function PushSettingRow({
  title,
  description,
  value,
  onValueChange,
  busy,
  showDivider = true,
}) {
  return (
    <View style={[styles.pushItem, showDivider && styles.pushItemDivider]}>
      <View style={styles.pushItemTextWrap}>
        <AppText variant="semi16" style={styles.pushItemTitle}>
          {title}
        </AppText>
        {description ? (
          <AppText variant="smallRegular" style={styles.pushItemDescription}>
            {description}
          </AppText>
        ) : null}
      </View>
      <PushSettingToggle
        value={value}
        onValueChange={onValueChange}
        busy={busy}
      />
    </View>
  );
}

const LOGOUT_SUB =
  "계정에서 로그아웃됩니다.\n언제든 다시 로그인하실 수 있어요.";
const WITHDRAW_SUB =
  "탈퇴 후에는 계정을 다시 되돌릴 수 없어요.\n작성한 정보도 복구되지 않아요.";

const ProfileSettingScreen = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const clearAuth = useUserStore((state) => state.clearAuth);

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [pushSettings, setPushSettings] = useState(EMPTY_PUSH_SETTINGS);
  const [pushSettingsLoading, setPushSettingsLoading] = useState(true);
  const [pushToggleBusy, setPushToggleBusy] = useState(false);

  const refreshPushSettings = useCallback(async () => {
    try {
      setPushSettingsLoading(true);
      const result = await fetchCurrentDevicePushSettings();
      setPushSettings(result.settings ?? EMPTY_PUSH_SETTINGS);
    } catch (error) {
      logAxiosError("fetchDevicePushSettings", error);
      setPushSettings(EMPTY_PUSH_SETTINGS);
    } finally {
      setPushSettingsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshPushSettings();
    }, [refreshPushSettings]),
  );

  const resetAppSession = useCallback(async () => {
    await clearAuth();
    delete api.defaults.headers.Authorization;
    queryClient.clear();
    useUserEmotionSelectionStore.setState({ selectionsByPostId: {} });

    const rootNav = getRootNavigation(navigation);
    rootNav.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "Auth",
            state: {
              routes: [{ name: "Login" }],
              index: 0,
            },
          },
        ],
      }),
    );
  }, [clearAuth, navigation, queryClient]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const deviceId = await getDeviceId();
      return logoutApi({ deviceId });
    },
    onSuccess: async () => {
      setLogoutModalVisible(false);
      await resetAppSession();
    },
    onError: (error) => {
      logAxiosError("logout", error);
      const message = getApiErrorUserMessage(
        error,
        "로그아웃에 실패했습니다. 다시 시도해 주세요.",
      );
      Alert.alert("오류", String(message));
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: withdrawAccountApi,
    onSuccess: async (data) => {
      setWithdrawModalVisible(false);
      const message = data?.message;
      if (message) {
        Alert.alert("안내", message, [
          {
            text: "확인",
            onPress: async () => {
              await resetAppSession();
            },
          },
        ]);
      } else {
        await resetAppSession();
      }
    },
    onError: (error) => {
      logAxiosError("withdrawAccount", error);
      const message = getApiErrorUserMessage(
        error,
        "회원 탈퇴 요청에 실패했습니다. 다시 시도해 주세요.",
      );
      Alert.alert("오류", String(message));
    },
  });

  const isAuthBusy = logoutMutation.isPending || withdrawMutation.isPending;
  const isPushBusy = pushToggleBusy || pushSettingsLoading;

  const openNotionLink = useCallback((url, labelForEmpty) => {
    const trimmed = String(url ?? "").trim();
    if (!trimmed) {
      Alert.alert(
        "안내",
        `${labelForEmpty} 노션 링크가 비어 있습니다. 이 파일 상단의 NOTION_URLS 객체에 해당 필드(notice / faq / termsOfService / privacyPolicy)에 URL을 넣어 주세요.`,
      );
      return;
    }
    Linking.openURL(trimmed).catch(() => {
      Alert.alert("오류", "링크를 열 수 없습니다.");
    });
  }, []);

  const showPermissionSettingsAlert = useCallback(() => {
    Alert.alert(
      "알림 허용",
      Platform.select({
        ios: "설정 > 알림에서 이 앱의 알림을 허용해 주세요.",
        default: "설정에서 이 앱의 알림 권한을 허용해 주세요.",
      }),
      [
        { text: "확인", style: "cancel" },
        { text: "설정", onPress: () => Linking.openSettings() },
      ],
    );
  }, []);

  const onPushSwitchChange = useCallback(
    async (nextOn) => {
      if (isPushBusy) {
        return;
      }

      setPushToggleBusy(true);
      try {
        const result = await submitPushEnabledToServer(nextOn);

        if (result.skipped) {
          if (result.reason === "NOTIFICATION_PERMISSION_NOT_GRANTED") {
            if (result.shouldOpenSettings) {
              showPermissionSettingsAlert();
            }
            return;
          }

          if (result.reason === "NO_ACCESS_TOKEN") {
            Alert.alert("안내", "로그인이 필요합니다.");
            return;
          }

          if (result.reason === "FCM_TOKEN_ERROR") {
            const hint =
              result.error?.message ?? result.error?.nativeErrorMessage ?? "";
            const apsHint =
              Platform.OS === "ios" &&
              String(hint).includes("aps-environment")
                ? "\n\n(iOS) Apple 푸시(APS) 인타이틀먼트가 빌드에 포함되어야 합니다. app.config에 aps-environment를 넣은 뒤 prebuild·재빌드하고, Apple Developer에서 해당 앱 ID에 Push Notifications 기능이 켜져 있는지 확인하세요. 백엔드 문제가 아닙니다."
                : "";

            Alert.alert(
              "알림",
              hint
                ? `푸시 알림을 변경하는 중 오류가 났습니다.\n${hint}${apsHint}`
                : "푸시 알림을 변경하는 중 오류가 났습니다. 잠시 후 다시 시도해 주세요.",
            );
            return;
          }

          Alert.alert(
            "안내",
            "푸시 알림을 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.",
          );
          return;
        }

        setPushSettings(result.settings ?? EMPTY_PUSH_SETTINGS);
      } catch (error) {
        logAxiosError("pushSettingsToggle", error);
        Alert.alert(
          "오류",
          getApiErrorUserMessage(error, "푸시 설정을 변경하지 못했습니다."),
        );
        await refreshPushSettings();
      } finally {
        setPushToggleBusy(false);
      }
    },
    [isPushBusy, refreshPushSettings, showPermissionSettingsAlert],
  );

  const onPushDetailChange = useCallback(
    async (field, nextValue) => {
      if (isPushBusy) {
        return;
      }

      const nextSettings = {
        ...pushSettings,
        [field]: nextValue,
      };

      setPushToggleBusy(true);
      try {
        const result = await submitPushDetailSettingsToServer({
          postCommentPushEnabled: nextSettings.postCommentPushEnabled,
          postEmotionPushEnabled: nextSettings.postEmotionPushEnabled,
        });

        if (result.skipped) {
          if (result.reason === "NO_ACCESS_TOKEN") {
            Alert.alert("안내", "로그인이 필요합니다.");
            return;
          }

          Alert.alert(
            "안내",
            "푸시 세부 설정을 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.",
          );
          return;
        }

        setPushSettings(result.settings ?? EMPTY_PUSH_SETTINGS);
      } catch (error) {
        logAxiosError("pushDetailSettingsToggle", error);
        Alert.alert(
          "오류",
          getApiErrorUserMessage(
            error,
            "푸시 세부 설정을 변경하지 못했습니다.",
          ),
        );
        await refreshPushSettings();
      } finally {
        setPushToggleBusy(false);
      }
    },
    [isPushBusy, pushSettings, refreshPushSettings],
  );

  const openNotionLink = useCallback((url, labelForEmpty) => {
    const trimmed = String(url ?? "").trim();
    if (!trimmed) {
      Alert.alert(
        "안내",
        `${labelForEmpty} 노션 링크가 비어 있습니다. 이 파일 상단의 NOTION_URLS 객체에 해당 필드(notice / faq / termsOfService / privacyPolicy)에 URL을 넣어 주세요.`,
      );
      return;
    }
    Linking.openURL(trimmed).catch(() => {
      Alert.alert("오류", "링크를 열 수 없습니다.");
    });
  }, []);

  const onPushSwitchChange = useCallback(
    async (nextOn) => {
      if (pushToggleBusy) return;
      setPushToggleBusy(true);
      try {
        if (nextOn) {
          const result = await submitPushEnabledToServer(true);
          if (result.skipped) {
            if (result.reason === "NOTIFICATION_PERMISSION_NOT_GRANTED") {
              Alert.alert(
                "알림 허용",
                Platform.select({
                  ios: "설정 > 알림에서 이 앱의 알림을 허용해 주세요.",
                  default: "설정에서 이 앱의 알림 권한을 허용해 주세요.",
                }),
                [
                  { text: "확인", style: "cancel" },
                  { text: "설정", onPress: () => Linking.openSettings() },
                ],
              );
              await refreshPushSwitchFromOs();
              return;
            }
            if (result.reason === "NO_ACCESS_TOKEN") {
              Alert.alert("안내", "로그인이 필요합니다.");
              await refreshPushSwitchFromOs();
              return;
            }
            if (result.reason === "FCM_TOKEN_ERROR") {
              const hint =
                result.error?.message ?? result.error?.nativeErrorMessage ?? "";
              const apsHint =
                Platform.OS === "ios" &&
                String(hint).includes("aps-environment")
                  ? "\n\n(iOS) Apple 푸시(APS) 인타이틀먼트가 빌드에 포함되어야 합니다. app.config에 aps-environment를 넣은 뒤 prebuild·재빌드하고, Apple Developer에서 해당 앱 ID에 Push Notifications 기능이 켜져 있는지 확인하세요. 백엔드 문제가 아닙니다."
                  : "";
              Alert.alert(
                "알림",
                hint
                  ? `푸시 알림을 다시 켜는 중 오류가 났습니다.\n${hint}${apsHint}`
                  : "푸시 알림을 다시 켜는 중 오류가 났습니다. 잠시 후 다시 시도하거나 앱을 다시 시작해 주세요.",
              );
              await refreshPushSwitchFromOs();
              return;
            }
            Alert.alert(
              "안내",
              "푸시 알림을 켤 수 없습니다. 잠시 후 다시 시도해 주세요.",
            );
            await refreshPushSwitchFromOs();
            return;
          }
          lastServerPushEnabledRef.current = true;
          setPushSwitchOn(true);
        } else {
          const result = await submitPushEnabledToServer(false);
          if (result.skipped && result.reason === "NO_ACCESS_TOKEN") {
            Alert.alert("안내", "로그인이 필요합니다.");
          } else {
            lastServerPushEnabledRef.current = false;
            setPushSwitchOn(false);
          }
        }
      } catch (e) {
        logAxiosError("pushSettingsToggle", e);
        Alert.alert(
          "오류",
          getApiErrorUserMessage(e, "푸시 설정을 변경하지 못했습니다."),
        );
        await refreshPushSwitchFromOs();
      } finally {
        setPushToggleBusy(false);
      }
    },
    [pushToggleBusy, refreshPushSwitchFromOs],
  );

  const renderConfirmModal = ({
    visible,
    onClose,
    title,
    description,
    confirmLabel,
    onConfirm,
    pending,
  }) => (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <AppText variant="displayTitle" style={styles.modalTitle}>
            {title}
          </AppText>
          <AppText variant="middle" style={styles.modalDesc}>
            {description}
          </AppText>

          <TouchableOpacity
            style={[styles.cancelBtn, pending && styles.btnDisabled]}
            disabled={pending}
            onPress={onClose}
          >
            <AppText variant="semi16" style={styles.cancelBtnText}>
              취소
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dangerBtn, pending && styles.btnDisabled]}
            disabled={pending}
            onPress={onConfirm}
          >
            {pending ? (
              <ActivityIndicator color="#F9F9F9" />
            ) : (
              <AppText variant="semi16" style={styles.dangerBtnText}>
                {confirmLabel}
              </AppText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader pageName="설정" showBack />

      <View style={styles.section}>
        <View style={styles.pushRow}>
          <AppText
            variant="semi18"
            className="text-white"
            style={styles.pushLabel}
          >
            푸시 알람 설정
          </AppText>
          {pushToggleBusy ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <PushSettingToggle
              value={pushSwitchOn}
              onValueChange={onPushSwitchChange}
              busy={pushToggleBusy}
            />
          )}
        </View>
      </View>

      <View style={styles.section}>
        <AppText
          variant="semi18"
          className="text-white"
          style={styles.sectionTitle}
        >
          푸시 알림 설정
        </AppText>

        <View style={styles.pushCard}>
          {pushSettingsLoading ? (
            <View style={styles.pushLoadingWrap}>
              <ActivityIndicator color="#FFF" />
            </View>
          ) : (
            <>
              <PushSettingRow
                title="푸시 알람 전체"
                description="알림을 끄면 모든 소식을 받을 수 없어요."
                value={pushSettings.pushEnabled}
                onValueChange={onPushSwitchChange}
                busy={isPushBusy}
              />
              <PushSettingRow
                title="댓글 알림"
                value={pushSettings.postCommentPushEnabled}
                onValueChange={(value) =>
                  onPushDetailChange("postCommentPushEnabled", value)
                }
                busy={isPushBusy}
              />
              <PushSettingRow
                title="공감 알림"
                value={pushSettings.postEmotionPushEnabled}
                onValueChange={(value) =>
                  onPushDetailChange("postEmotionPushEnabled", value)
                }
                busy={isPushBusy}
                showDivider={false}
              />
            </>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <AppText
          variant="semi18"
          className="text-white"
          style={styles.sectionTitle}
        >
          계정
        </AppText>
        <Pressable
          onPress={() => setLogoutModalVisible(true)}
          disabled={isAuthBusy}
          style={({ pressed }) => [
            styles.accountRow,
            pressed && styles.rowPressed,
            isAuthBusy && styles.rowDisabled,
          ]}
        >
          <AppText variant="bodyMedium" style={styles.menuItemText}>
            로그아웃
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => setWithdrawModalVisible(true)}
          disabled={isAuthBusy}
          style={({ pressed }) => [
            styles.accountRow,
            pressed && styles.rowPressed,
            isAuthBusy && styles.rowDisabled,
          ]}
        >
          <AppText variant="bodyMedium" style={styles.menuItemText}>
            계정 탈퇴
          </AppText>
        </Pressable>
      </View>

      <View style={styles.section}>
        <AppText
          variant="semi18"
          className="text-white"
          style={styles.sectionTitle}
        >
          안내
        </AppText>
        <Pressable
          onPress={() => openNotionLink(NOTION_URLS.notice, "공지사항")}
          style={({ pressed }) => [
            styles.linkRow,
            pressed && styles.rowPressed,
          ]}
        >
          <AppText variant="bodyMedium" style={styles.linkRowText}>
            공지사항
          </AppText>
          <MoreArrow width={22} height={22} />
        </Pressable>
        <Pressable
          onPress={() => openNotionLink(NOTION_URLS.faq, "FAQ")}
          style={({ pressed }) => [
            styles.linkRow,
            pressed && styles.rowPressed,
          ]}
        >
          <AppText variant="bodyMedium" style={styles.linkRowText}>
            FAQ
          </AppText>
          <MoreArrow width={22} height={22} />
        </Pressable>
      </View>

      <View style={styles.section}>
        <AppText
          variant="semi18"
          className="text-white"
          style={styles.sectionTitle}
        >
          서비스 정보
        </AppText>
        <Pressable
          onPress={() =>
            openNotionLink(NOTION_URLS.termsOfService, "서비스 이용약관")
          }
          style={({ pressed }) => [
            styles.linkRow,
            pressed && styles.rowPressed,
          ]}
        >
          <AppText variant="bodyMedium" style={styles.linkRowText}>
            서비스 이용약관
          </AppText>
          <MoreArrow width={22} height={22} />
        </Pressable>
        <Pressable
          onPress={() =>
            openNotionLink(NOTION_URLS.privacyPolicy, "개인정보 처리방침")
          }
          style={({ pressed }) => [
            styles.linkRow,
            pressed && styles.rowPressed,
          ]}
        >
          <AppText variant="bodyMedium" style={styles.linkRowText}>
            개인정보 처리방침
          </AppText>
          <MoreArrow width={22} height={22} />
        </Pressable>

        <View style={styles.versionRow}>
          <AppText variant="bodyMedium" style={styles.linkRowText}>
            현재버전
          </AppText>
          <AppText variant="smallRegular" style={styles.versionMeta}>
            V.{APP_VERSION} 최신버전
          </AppText>
        </View>
      </View>

      {renderConfirmModal({
        visible: logoutModalVisible,
        onClose: () =>
          !logoutMutation.isPending && setLogoutModalVisible(false),
        title: "로그아웃 하시겠어요?",
        description: LOGOUT_SUB,
        confirmLabel: "로그아웃",
        onConfirm: () => logoutMutation.mutate(),
        pending: logoutMutation.isPending,
      })}

      {renderConfirmModal({
        visible: withdrawModalVisible,
        onClose: () =>
          !withdrawMutation.isPending && setWithdrawModalVisible(false),
        title: "정말 탈퇴하시겠어요?",
        description: WITHDRAW_SUB,
        confirmLabel: "회원탈퇴",
        onConfirm: () => withdrawMutation.mutate(),
        pending: withdrawMutation.isPending,
      })}
    </SafeAreaView>
  );
};

export default ProfileSettingScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  section: {
    marginVertical: 20,
    marginHorizontal: 25,
    gap: 13,
  },
  sectionTitle: {
    lineHeight: 24.5,
    marginBottom: 4,
  },
  pushCard: {
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  pushLoadingWrap: {
    minHeight: 164,
    alignItems: "center",
    justifyContent: "center",
  },
  pushItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 58,
  },
  pushItemDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  pushItemTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  pushItemTitle: {
    color: "#FFFFFF",
    lineHeight: 22,
  },
  pushItemDescription: {
    color: "rgba(228, 228, 228, 0.50)",
    marginTop: 2,
    lineHeight: 17,
  },
  pushToggleTrack: {
    width: PUSH_TOGGLE_W,
    height: PUSH_TOGGLE_H,
    borderRadius: PUSH_TOGGLE_H / 2,
    padding: PUSH_TOGGLE_PAD,
    justifyContent: "center",
  },
  pushToggleTrackOff: {
    backgroundColor: "rgba(172, 172, 172, 0.20)",
  },
  pushToggleTrackOn: {
    backgroundColor: "#34C759",
  },
  pushToggleInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  pushToggleThumb: {
    width: PUSH_TOGGLE_THUMB,
    height: PUSH_TOGGLE_THUMB,
    borderRadius: PUSH_TOGGLE_THUMB / 2,
    backgroundColor: "#FFFFFF",
  },
  accountRow: {
    alignSelf: "stretch",
    minHeight: 44,
    paddingVertical: 4,
    justifyContent: "center",
  },
  menuItemText: {
    lineHeight: 21.8,
    color: "rgba(228, 228, 228, 0.50)",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
    width: "100%",
    minHeight: 44,
    paddingVertical: 4,
  },
  linkRowText: {
    flex: 1,
    marginRight: 12,
    lineHeight: 21.8,
    color: "rgba(228, 228, 228, 0.50)",
  },
  versionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
    width: "100%",
    minHeight: 44,
    paddingVertical: 4,
  },
  versionMeta: {
    flexShrink: 0,
    lineHeight: 13.6,
    color: "rgba(228, 228, 228, 0.45)",
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowDisabled: {
    opacity: 0.45,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  modalCard: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#202325",
    paddingTop: 28,
    paddingBottom: 8,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  modalTitle: {
    color: "#E5E5E5",
    marginBottom: 8,
    textAlign: "center",
  },
  modalDesc: {
    color: "rgba(228, 228, 228, 0.50)",
    textAlign: "center",
    marginBottom: 24,
  },
  dangerBtn: {
    width: "100%",
    backgroundColor: "#FF5050",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 15,
  },
  dangerBtnText: {
    color: "#F9F9F9",
    lineHeight: 22,
  },
  cancelBtn: {
    width: "100%",
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 15,
  },
  cancelBtnText: {
    color: "#1E1E1E",
    lineHeight: 22,
    fontWeight: "bold",
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
