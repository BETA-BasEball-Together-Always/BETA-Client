import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
            style={{ lineHeight: 21.8 }}
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
            style={{ lineHeight: 21.8 }}
          >
            계정 탈퇴
          </AppText>
        </Pressable>
      </View>

      <View style={styles.section}>
        <AppText
          variant="semi18"
          className="text-white"
          style={{ lineHeight: 24.5 }}
        >
          안내
        </AppText>
      </View>

      <View style={styles.section}>
        <AppText
          variant="semi18"
          className="text-white"
          style={{ lineHeight: 24.5 }}
        >
          서비스 정보
        </AppText>
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
    marginVertical: 25,
    marginHorizontal: 25,
    gap: 13,
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
