import { PermissionsAndroid, Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import messaging from "@react-native-firebase/messaging";

import api from "../libs/api";
import { useUserStore } from "../store/userStore";
import { getDeviceId } from "@features/auth/libs/Login/deviceUtils";

const ANDROID_NOTIFICATION_PERMISSION =
  PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;

const isAndroid13OrAbove = () =>
  Platform.OS === "android" && Number(Platform.Version) >= 33;

const isAuthorizedStatus = (status) =>
  status === messaging.AuthorizationStatus.AUTHORIZED ||
  status === messaging.AuthorizationStatus.PROVISIONAL;

const getErrorMessage = (error) =>
  error?.message ?? error?.nativeErrorMessage ?? String(error ?? "");

async function getAccessToken() {
  const storeToken = useUserStore.getState().accessToken;

  if (storeToken) {
    return storeToken;
  }

  return SecureStore.getItemAsync("accessToken");
}

async function ensureAndroidNotificationPermission({ requestPermission }) {
  if (!isAndroid13OrAbove()) {
    return true;
  }

  if (!ANDROID_NOTIFICATION_PERMISSION) {
    return true;
  }

  if (requestPermission) {
    const result = await PermissionsAndroid.request(
      ANDROID_NOTIFICATION_PERMISSION,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  return PermissionsAndroid.check(ANDROID_NOTIFICATION_PERMISSION);
}

async function ensureIosNotificationPermission({ requestPermission }) {
  const status = requestPermission
    ? await messaging().requestPermission()
    : await messaging().hasPermission();

  return isAuthorizedStatus(status);
}

async function ensureNotificationPermission({ requestPermission }) {
  if (Platform.OS === "ios") {
    return ensureIosNotificationPermission({ requestPermission });
  }

  if (Platform.OS === "android") {
    return ensureAndroidNotificationPermission({ requestPermission });
  }

  return false;
}

async function getFcmToken() {
  if (Platform.OS === "ios") {
    await messaging().registerDeviceForRemoteMessages();
  }

  return messaging().getToken();
}

export async function syncCurrentDevicePushSettings({
  requestPermission = false,
  overrideFcmToken = null,
} = {}) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { skipped: true, reason: "NO_ACCESS_TOKEN" };
  }

  const deviceId = await getDeviceId();
  const hasPermission = await ensureNotificationPermission({ requestPermission });

  let fcmToken = null;
  let pushEnabled = false;
  let skippedReason = null;

  if (hasPermission) {
    try {
      fcmToken = overrideFcmToken ?? (await getFcmToken());
      pushEnabled = Boolean(fcmToken);
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      if (
        Platform.OS === "ios" &&
        errorMessage.includes("aps-environment")
      ) {
        skippedReason = "MISSING_APNS_ENTITLEMENT";
        console.warn(
          "[푸시] iOS 푸시 entitlement가 없어 FCM 토큰을 발급할 수 없습니다.",
        );
      } else {
        skippedReason = "FCM_TOKEN_ERROR";
        console.warn("[푸시] FCM 토큰 발급에 실패했습니다.", error);
      }
    }
  } else {
    skippedReason = "NOTIFICATION_PERMISSION_NOT_GRANTED";
  }

  if (!fcmToken) {
    return {
      skipped: true,
      reason: skippedReason ?? "FCM_TOKEN_UNAVAILABLE",
      deviceId,
      pushEnabled: false,
    };
  }

  await api.put(
    "/api/v1/devices/push-settings",
    {
      deviceId,
      fcmToken,
      pushEnabled,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return {
    deviceId,
    fcmToken,
    pushEnabled,
  };
}

export function subscribePushTokenRefresh() {
  return messaging().onTokenRefresh(async (token) => {
    try {
      await syncCurrentDevicePushSettings({
        requestPermission: false,
        overrideFcmToken: token,
      });
    } catch (error) {
      console.warn("[푸시] 갱신된 FCM 토큰 동기화에 실패했습니다.", error);
    }
  });
}
