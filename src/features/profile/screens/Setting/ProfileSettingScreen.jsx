import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
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
  getNotificationPermissionGranted,
  submitPushEnabledToServer,
} from "../../../../shared/services/pushDeviceService";
import MoreArrow from "@features/auth/assets/common/svg/more_arrow.svg";

/**
 * 노션 페이지 URL — 실제 공개 링크로 교체하세요.
 * (노션 페이지 우측 상단 공유 → 웹에 게시 → 링크 복사)
 */
const NOTION_URLS = {
  /** 공지사항: 노션 '공지사항' 페이지 URL */
  notice: "",
  /** FAQ: 노션 FAQ 페이지 URL */
  faq: "",
  /** 서비스 이용 약관: 노션 약관 페이지 URL */
  termsOfService: "",
  /** 개인정보 처리방침: 노션 개인정보 처리방침 페이지 URL */
  privacyPolicy: "",
};

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

const LOGOUT_SUB =
  "계정에서 로그아웃됩니다.\n언제든 다시 로그인하실 수 있어요.";
const WITHDRAW_SUB =
  "탈퇴 후에는 계정을 다시 되돌릴 수 없어요.\n작성한 정보도 복구되지 않아요.";

const ProfileSettingScreen = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const clearAuth = useUserStore((s) => s.clearAuth);

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [pushSwitchOn, setPushSwitchOn] = useState(false);
  const [pushToggleBusy, setPushToggleBusy] = useState(false);
  /** 서버에 마지막으로 반영한 푸시 on/off (앱에서 끈 뒤 재진입 시 OS 권한만으로 다시 켜져 보이는 현상 완화) */
  const lastServerPushEnabledRef = useRef(null);

  const refreshPushSwitchFromOs = useCallback(async () => {
    try {
      if (lastServerPushEnabledRef.current === false) {
        setPushSwitchOn(false);
        return;
      }
      const granted = await getNotificationPermissionGranted();
      setPushSwitchOn(granted);
    } catch {
      setPushSwitchOn(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshPushSwitchFromOs();
    }, [refreshPushSwitchFromOs]),
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
    onError: (e) => {
      logAxiosError("logout", e);
      const msg = getApiErrorUserMessage(
        e,
        "로그아웃에 실패했습니다. 다시 시도해 주세요.",
      );
      Alert.alert("오류", String(msg));
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
    onError: (e) => {
      logAxiosError("withdrawAccount", e);
      const msg = getApiErrorUserMessage(
        e,
        "회원 탈퇴 요청에 실패했습니다. 다시 시도해 주세요.",
      );
      Alert.alert("오류", String(msg));
    },
  });

  const isAuthBusy = logoutMutation.isPending || withdrawMutation.isPending;

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
                result.error?.message ??
                result.error?.nativeErrorMessage ??
                "";
              Alert.alert(
                "알림",
                hint
                  ? `푸시 알림을 다시 켜는 중 오류가 났습니다.\n${hint}`
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
            <View style={styles.switchSlot}>
              <Switch
                style={styles.switchShape}
                value={pushSwitchOn}
                onValueChange={onPushSwitchChange}
                trackColor={{
                  false: "rgba(172, 172, 172, 0.20)",
                  true: "#34C759",
                }}
                thumbColor="#FFF"
                ios_backgroundColor="rgba(172, 172, 172, 0.20)"
              />
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <AppText
          variant="semi18"
          className="text-white"
          style={{ lineHeight: 24.5 }}
        >
          계정
        </AppText>
        <Pressable
          onPress={() => setLogoutModalVisible(true)}
          disabled={isAuthBusy}
          style={({ pressed }) => [
            styles.rowPressable,
            pressed && styles.rowPressed,
            isAuthBusy && styles.rowDisabled,
          ]}
        >
          <AppText
            variant="bodyMedium"
            className="text-gray-400"
            style={styles.accountMenuText}
          >
            로그아웃
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => setWithdrawModalVisible(true)}
          disabled={isAuthBusy}
          style={({ pressed }) => [
            styles.rowPressable,
            pressed && styles.rowPressed,
            isAuthBusy && styles.rowDisabled,
          ]}
        >
          <AppText
            variant="bodyMedium"
            className="text-gray-400"
            style={styles.accountMenuText}
          >
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
          <AppText
            variant="bodyMedium"
            className="text-gray-400"
            style={styles.accountMenuText}
          >
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
          <AppText
            variant="bodyMedium"
            className="text-gray-400"
            style={styles.accountMenuText}
          >
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
          <AppText
            variant="bodyMedium"
            className="text-gray-400"
            style={styles.accountMenuText}
          >
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
          <AppText
            variant="bodyMedium"
            className="text-gray-400"
            style={styles.accountMenuText}
          >
            개인정보 처리방침
          </AppText>
          <MoreArrow width={22} height={22} />
        </Pressable>

        <View style={styles.versionRow}>
          <AppText
            variant="bodyMedium"
            className="text-gray-400"
            style={styles.accountMenuText}
          >
            현재버전
          </AppText>
          <AppText variant="bodyMedium" style={styles.versionMeta}>
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
  pushRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
  pushLabel: {
    lineHeight: 24.5,
    flex: 1,
    marginRight: 12,
  },

  // 푸시 알람 토글 스위치
  switchSlot: {
    width: 56,
    height: 38,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  switchShape: {
    transform: [{ scaleX: 0.9 }, { scaleY: 1.14 }],
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
  accountMenuText: {
    lineHeight: 21.8,
    flex: 1,
    marginRight: 8,
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
    color: "rgba(228, 228, 228, 0.45)",
    lineHeight: 21.8,
  },
  rowPressable: {
    alignSelf: "flex-start",
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
