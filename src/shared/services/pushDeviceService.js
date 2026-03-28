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

/** OS 알림 권한 허용 여부 (설정 화면 토글 표시용) */
export async function getNotificationPermissionGranted() {
  return ensureNotificationPermission({ requestPermission: false });
}

async function getFcmToken() {
  if (Platform.OS === "ios") {
    await messaging().registerDeviceForRemoteMessages();
  }

  return messaging().getToken();
}

/**
 * PATCH 푸시 알림 활성화/비활성화 토글
 */
async function patchDevicePushEnabled(accessToken, deviceId, pushEnabled) {
  const { data } = await api.patch(
    "/api/v1/devices/push-enabled",
    { deviceId, pushEnabled },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (data && data.success === false) {
    const err = new Error(data.message || "push-enabled rejected");
    err.apiPayload = data;
    throw err;
  }
  return data;
}

/**
 * PUT FCM 토큰 + 푸시 활성화
 */
async function putDevicePushSettings(accessToken, deviceId, pushEnabled, fcmToken) {
  const { data } = await api.put(
    "/api/v1/devices/push-settings",
    {
      deviceId,
      pushEnabled,
      fcmToken: fcmToken ?? "",
    },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (data && data.success === false) {
    const err = new Error(data.message || "push-settings rejected");
    err.apiPayload = data;
    throw err;
  }
  return data;
}

/**
 * 설정 화면 토글
 * - 끔: push-enabled 만 호출
 * - 켬: 권한/FCM 토큰 확보 후 push-settings 호출 (토큰 등록 + 활성화)
 */
export async function submitPushEnabledToServer(pushEnabled) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return { skipped: true, reason: "NO_ACCESS_TOKEN" };
  }

  const deviceId = await getDeviceId();

  if (!pushEnabled) {
    await patchDevicePushEnabled(accessToken, deviceId, false);
    return { ok: true };
  }

  const granted = await ensureNotificationPermission({
    requestPermission: true,
  });
  if (!granted) {
    return { skipped: true, reason: "NOTIFICATION_PERMISSION_NOT_GRANTED" };
  }

  let fcmToken;
  try {
    fcmToken = await getFcmToken();
  } catch (error) {
    return { skipped: true, reason: "FCM_TOKEN_ERROR", error };
  }

  await putDevicePushSettings(
    accessToken,
    deviceId,
    true,
    fcmToken ?? "",
  );

  return { ok: true };
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

  await putDevicePushSettings(accessToken, deviceId, pushEnabled, fcmToken);

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
