import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "../../../../shared/theme/components/AppText";
import AuthBackground from "../../components/AuthBackground";
import CompleteIcon from "../../assets/common/svg/signupComplete.svg";
import { runSignupPushPermissionFlow } from "../../../../shared/services/pushDeviceService";
import { clearPersistedSignupDraft } from "../../stores/useSignupDraftStore";

const SignupCompleteScreen = ({ navigation, route }) => {
  const [favoriteTeamLabel, setFavoriteTeamLabel] = useState("팬");
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [permissionBusy, setPermissionBusy] = useState(false);

  useEffect(() => {
    const labelFromParams = route?.params?.signup?.favoriteTeamLabel;
    if (labelFromParams) {
      setFavoriteTeamLabel(labelFromParams);
    } else {
      SecureStore.getItemAsync("favoriteTeamLabel").then((stored) => {
        if (stored) {
          setFavoriteTeamLabel(stored);
        }
      });
    }
  }, [route?.params]);

  useEffect(() => {
    setPermissionModalVisible(true);
  }, []);

  const moveToMain = () => {
    clearPersistedSignupDraft();
    navigation.replace("Main");
  };

  const handleLater = () => {
    setPermissionModalVisible(false);
    moveToMain();
  };

  const handleAllowNotifications = async () => {
    if (permissionBusy) {
      return;
    }

    setPermissionBusy(true);
    try {
      const result = await runSignupPushPermissionFlow();
      if (result?.skipped) {
        console.warn("[푸시] 회원가입 직후 푸시 권한 처리 건너뜀:", result.reason);
      }
    } catch (error) {
      console.warn("[푸시] 회원가입 직후 푸시 권한 처리 실패:", error);
    } finally {
      setPermissionBusy(false);
      setPermissionModalVisible(false);
      moveToMain();
    }
  };

  return (
    <View style={styles.root}>
      <AuthBackground />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.container}>
          <CompleteIcon width={273.721} height={251.031} />
          <AppText variant="displayTitle2" style={styles.mainText}>
            회원가입이 완료되었습니다!
          </AppText>
          <AppText variant="semi14" style={styles.subText}>
            {favoriteTeamLabel} 팬 일환이 된 것을 축하합니다~
          </AppText>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setPermissionModalVisible(true)}
            >
              <AppText variant="heading" style={styles.btnText}>
                응원하러 가기
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <Modal
        transparent
        visible={permissionModalVisible}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} />
          <View style={styles.sheetCard}>
            <View style={styles.sheetHandle} />
            <AppText variant="displayTitle" style={styles.sheetTitle}>
              알림을 받아보시겠어요?
            </AppText>
            <AppText variant="middle" style={styles.sheetDescription}>
              댓글, 감정 리액션, 공지 알림을 빠르게 받아볼 수 있어요.
            </AppText>

            <TouchableOpacity
              style={[styles.primaryButton, permissionBusy && styles.buttonDisabled]}
              disabled={permissionBusy}
              onPress={handleAllowNotifications}
            >
              {permissionBusy ? (
                <ActivityIndicator color="#111111" />
              ) : (
                <AppText variant="heading" style={styles.primaryButtonText}>
                  알림 받기
                </AppText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, permissionBusy && styles.buttonDisabled]}
              disabled={permissionBusy}
              onPress={handleLater}
            >
              <AppText variant="semi16" style={styles.secondaryButtonText}>
                나중에 설정할게요
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SignupCompleteScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000000" },
  safeArea: { flex: 1, backgroundColor: "transparent" },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  mainText: {
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  subText: {
    color: "rgba(255,255,255,0.7)",
    marginBottom: 32,
    textAlign: "center",
  },
  buttonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  button: {
    width: "100%",
    height: 52,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    color: "#111111",
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheetCard: {
    backgroundColor: "#202325",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 14,
    paddingHorizontal: 24,
    paddingBottom: 38,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignSelf: "center",
    marginBottom: 18,
  },
  sheetTitle: {
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  sheetDescription: {
    color: "rgba(228,228,228,0.70)",
    textAlign: "center",
    marginBottom: 26,
    lineHeight: 22,
  },
  primaryButton: {
    width: "100%",
    height: 52,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#111111",
  },
  secondaryButton: {
    width: "100%",
    height: 52,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#F9F9F9",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
