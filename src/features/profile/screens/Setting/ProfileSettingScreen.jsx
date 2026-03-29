import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
  notice:
    "https://bouncy-bush-b08.notion.site/BETA-331226b7125d80a8ae64c093d74c3744?source=copy_link",
  faq: "https://bouncy-bush-b08.notion.site/BETA-FAQ-331226b7125d8055bf31f19cad978c6e?source=copy_link",
  termsOfService:
    "https://bouncy-bush-b08.notion.site/29b226b7125d800c92c9e2d4fca7696e?source=copy_link",
  privacyPolicy:
    "https://bouncy-bush-b08.notion.site/29b226b7125d800c92c9e2d4fca7696e?source=copy_link",
};

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";
const PUSH_TOGGLE_W = 54;
const PUSH_TOGGLE_H = 33;
const PUSH_TOGGLE_THUMB = 28;
const PUSH_TOGGLE_PAD = 2.5;

// 푸시 설정 기본값
const EMPTY_PUSH_SETTINGS = {
  pushEnabled: false,
  postCommentPushEnabled: false,
  postEmotionPushEnabled: false,
};

function LinkMenuRow({ onPress, label }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.linkRow}
    >
      <View style={styles.linkRowLabel}>
        <AppText variant="bodyMedium" style={styles.linkRowText}>
          {label}
        </AppText>
      </View>
      <View style={styles.linkRowChevron}>
        <MoreArrow width={22} height={22} />
      </View>
    </TouchableOpacity>
  );
}

function PushSettingToggle({ value, onValueChange, busy, disabled }) {
  const isDisabled = Boolean(busy || disabled);
  return (
    <TouchableOpacity
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: isDisabled }}
      activeOpacity={0.9}
      disabled={isDisabled}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
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
    </TouchableOpacity>
  );
}

// 개별 푸시 설정 행
function PushSettingRow({
  title,
  description,
  value,
  onValueChange,
  busy,
  showDivider = true,
  toggleDisabled = false,
}) {
  return (
    <View style={[styles.pushItem, showDivider && styles.pushItemDivider]}>
      <View style={styles.pushItemTextWrap}>
        <AppText variant="bodyMedium" style={styles.pushItemTitle}>
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
        disabled={toggleDisabled}
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

  // 세부 토글 PATCH 시 다른 쪽 값은 항상 최신 state에서 읽기
  const pushSettingsRef = useRef(pushSettings);
  pushSettingsRef.current = pushSettings;
  // 첫 진입만 푸시 카드 전체 로딩; 이후 포커스 재조회는 백그라운드로 해서 스피너/ isPushBusy 로 토글 터치가 막히지 않게 함
  const pushSettingsInitialFetchDoneRef = useRef(false);

  const refreshPushSettings = useCallback(async (opts) => {
    const showLoading =
      typeof opts?.showLoading === "boolean"
        ? opts.showLoading
        : !pushSettingsInitialFetchDoneRef.current;
    try {
      if (showLoading) {
        setPushSettingsLoading(true);
      }
      const result = await fetchCurrentDevicePushSettings();
      setPushSettings(result.settings ?? EMPTY_PUSH_SETTINGS);
    } catch (error) {
      logAxiosError("fetchDevicePushSettings", error);
      setPushSettings(EMPTY_PUSH_SETTINGS);
    } finally {
      if (showLoading) {
        setPushSettingsLoading(false);
      }
      pushSettingsInitialFetchDoneRef.current = true;
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshPushSettings({
        showLoading: !pushSettingsInitialFetchDoneRef.current,
      });
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

  // 전체 푸시 토글: 서비스에서 push-detail-settings까지 맞추므로 성공 시 반환 settings로 댓글/공감 UI도 동기화
  const onPushSwitchChange = useCallback(
    async (nextOn) => {
      if (pushToggleBusy) return;
      setPushToggleBusy(true);
      try {
        const result = await submitPushEnabledToServer(nextOn);
        // 디버그: 전체 토글 후 서비스 레이어가 조합한 결과(위 pushDeviceService에서 PATCH/PUT 응답도 별도 로그) (안정화 후 제거 가능)
        console.log("[푸시설정] 전체 토글 — submitPushEnabledToServer 반환", {
          nextOn,
          skipped: result.skipped,
          reason: result.reason,
          ok: result.ok,
          settings: result.settings,
          tokenSync: result.tokenSync,
          hasFcmToken: Boolean(result.fcmToken),
        });
        if (result.skipped) {
          if (result.reason === "NOTIFICATION_PERMISSION_NOT_GRANTED") {
            Alert.alert(
              "알림 권한 필요",
              Platform.select({
                ios: "설정 > 알림에서 이 앱의 알림을 허용해 주세요.",
                default: "설정에서 이 앱의 알림 권한을 허용해 주세요.",
              }),
            );
          }
          await refreshPushSettings({ showLoading: false });
          return;
        }
        if (result.settings) {
          setPushSettings((prev) => ({
            ...prev,
            ...result.settings,
          }));
        } else {
          setPushSettings((prev) => ({ ...prev, pushEnabled: nextOn }));
        }
      } catch (e) {
        logAxiosError("pushSettingsToggle", e);
        Alert.alert(
          "오류",
          getApiErrorUserMessage(e, "푸시 설정을 변경하지 못했습니다."),
        );
        await refreshPushSettings({ showLoading: false });
      } finally {
        setPushToggleBusy(false);
      }
    },
    [pushToggleBusy, refreshPushSettings],
  );

  // 세부 푸시 토글 — API는 postComment/postEmotion 둘 다 필수; 변경하지 않은 쪽은 ref의 최신 값 사용
  const onPushDetailChange = useCallback(
    async (key, value) => {
      if (pushToggleBusy) return;
      setPushToggleBusy(true);
      const prev = pushSettingsRef.current;
      const nextComment =
        key === "postCommentPushEnabled"
          ? value
          : Boolean(prev.postCommentPushEnabled);
      const nextEmotion =
        key === "postEmotionPushEnabled"
          ? value
          : Boolean(prev.postEmotionPushEnabled);
      try {
        const result = await submitPushDetailSettingsToServer({
          postCommentPushEnabled: nextComment,
          postEmotionPushEnabled: nextEmotion,
        });
        // 디버그: 세부 토글 후 서비스 반환값 (실제 HTTP 응답 본문은 pushDeviceService PATCH 로그 참고) (안정화 후 제거 가능)
        console.log(
          "[푸시설정] 세부 토글 — submitPushDetailSettingsToServer 반환",
          {
            key,
            requested: { nextComment, nextEmotion },
            skipped: result.skipped,
            reason: result.reason,
            ok: result.ok,
            settings: result.settings,
          },
        );
        if (result.skipped) {
          await refreshPushSettings({ showLoading: false });
          return;
        }
        if (result.settings) {
          setPushSettings((s) => ({ ...s, ...result.settings }));
        } else {
          setPushSettings((s) => ({
            ...s,
            postCommentPushEnabled: nextComment,
            postEmotionPushEnabled: nextEmotion,
          }));
        }
      } catch (e) {
        logAxiosError("pushDetailChange", e);
        Alert.alert(
          "오류",
          getApiErrorUserMessage(e, "푸시 설정을 변경하지 못했습니다."),
        );
        await refreshPushSettings({ showLoading: false });
      } finally {
        setPushToggleBusy(false);
      }
    },
    [pushToggleBusy, refreshPushSettings],
  );

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
      Alert.alert("안내", `${labelForEmpty} 링크가 비어 있습니다.`);
      return;
    }
    Linking.openURL(trimmed).catch(() => {
      Alert.alert("오류", "링크를 열 수 없습니다.");
    });
  }, []);

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
      <ScrollView>
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
                  toggleDisabled={!pushSettings.pushEnabled}
                />
                <PushSettingRow
                  title="공감 알림"
                  value={pushSettings.postEmotionPushEnabled}
                  onValueChange={(value) =>
                    onPushDetailChange("postEmotionPushEnabled", value)
                  }
                  busy={isPushBusy}
                  showDivider={false}
                  toggleDisabled={!pushSettings.pushEnabled}
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
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setLogoutModalVisible(true)}
            disabled={isAuthBusy}
            style={[styles.accountRow, isAuthBusy && styles.rowDisabled]}
          >
            <AppText variant="bodyMedium" style={styles.menuItemText}>
              로그아웃
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setWithdrawModalVisible(true)}
            disabled={isAuthBusy}
            style={[styles.accountRow, isAuthBusy && styles.rowDisabled]}
          >
            <AppText variant="bodyMedium" style={styles.menuItemText}>
              계정 탈퇴
            </AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <AppText
            variant="semi18"
            className="text-white"
            style={styles.sectionTitle}
          >
            안내
          </AppText>
          <LinkMenuRow
            label="공지사항"
            onPress={() => openNotionLink(NOTION_URLS.notice, "공지사항")}
          />
          <LinkMenuRow
            label="FAQ"
            onPress={() => openNotionLink(NOTION_URLS.faq, "FAQ")}
          />
        </View>

        <View style={styles.section}>
          <AppText
            variant="semi18"
            className="text-white"
            style={styles.sectionTitle}
          >
            서비스 정보
          </AppText>
          <LinkMenuRow
            label="서비스 이용약관"
            onPress={() =>
              openNotionLink(NOTION_URLS.termsOfService, "서비스 이용약관")
            }
          />
          <LinkMenuRow
            label="개인정보 처리방침"
            onPress={() =>
              openNotionLink(NOTION_URLS.privacyPolicy, "개인정보 처리방침")
            }
          />
          <View style={styles.versionRow}>
            <View style={styles.versionRowLabel}>
              <AppText variant="bodyMedium" style={styles.linkRowText}>
                현재버전
              </AppText>
            </View>
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
      </ScrollView>
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
    alignSelf: "stretch",
    width: "100%",
    paddingVertical: 4,
  },
  linkRowLabel: {
    flex: 1,
    marginRight: 12,
    minWidth: 0,
    justifyContent: "center",
  },
  linkRowText: {
    lineHeight: 21.8,
    color: "rgba(228, 228, 228, 0.50)",
  },
  linkRowChevron: {
    flexShrink: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  // 작은 글씨(버전)가 세로 가운데 정렬일 때 위로 떠 보여서, 행 하단 기준으로 맞춤
  versionRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    alignSelf: "stretch",
    width: "100%",
    paddingBottom: 2,
  },
  versionRowLabel: {
    flex: 1,
    marginRight: 12,
    minWidth: 0,
    paddingBottom: 1,
  },
  versionMeta: {
    flexShrink: 0,
    lineHeight: 13.6,
    color: "rgba(228, 228, 228, 0.45)",
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
