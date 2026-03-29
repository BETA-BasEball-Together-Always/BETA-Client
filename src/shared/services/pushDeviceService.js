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

/** UI/직렬화에서 true|false 외 타입이 섞여도 PATCH 본문은 boolean으로 고정 (typeof 검증 실패로 요청 자체가 안 나가는 경우 방지) */
function coercePushDetailBool(value) {
  if (value === true || value === false) {
    return value;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return Boolean(value);
}

const normalizePushSettings = (settings) => {
  const postCommentPushEnabled = Boolean(settings?.postCommentPushEnabled);
  const postEmotionPushEnabled = Boolean(settings?.postEmotionPushEnabled);
  const anySubOn = postCommentPushEnabled || postEmotionPushEnabled;
  const hasExplicitMaster = typeof settings?.pushEnabled === "boolean";

  // GET/일부 응답에서 pushEnabled가 (댓글∧공감)로만 계산되면 한쪽만 켠 상태에서 전체 OFF로 보이고 세부 토글이 막힘 → 명시값 OR 세부 한 개라도 ON이면 전체 ON으로 해석
  const pushEnabled = hasExplicitMaster
    ? Boolean(settings.pushEnabled) || anySubOn
    : anySubOn;

  return {
    deviceId: settings?.deviceId ?? null,
    pushEnabled,
    postCommentPushEnabled,
    postEmotionPushEnabled,
  };
};

async function getAccessToken() {
  const storeToken = useUserStore.getState().accessToken;

  if (storeToken) {
    return storeToken;
  }

  return SecureStore.getItemAsync("accessToken");
}

async function getAndroidNotificationPermissionStatus() {
  if (!isAndroid13OrAbove() || !ANDROID_NOTIFICATION_PERMISSION) {
    return {
      granted: true,
      canRequest: false,
      status: "AUTHORIZED",
    };
  }

  const granted = await PermissionsAndroid.check(
    ANDROID_NOTIFICATION_PERMISSION,
  );

  return {
    granted,
    canRequest: !granted,
    status: granted ? "AUTHORIZED" : "DENIED",
  };
}

async function requestAndroidNotificationPermission() {
  if (!isAndroid13OrAbove() || !ANDROID_NOTIFICATION_PERMISSION) {
    return {
      granted: true,
      status: "AUTHORIZED",
    };
  }

  const result = await PermissionsAndroid.request(
    ANDROID_NOTIFICATION_PERMISSION,
  );

  return {
    granted: result === PermissionsAndroid.RESULTS.GRANTED,
    status: result,
  };
}

async function getIosNotificationPermissionStatus() {
  const status = await messaging().hasPermission();

  return {
    granted: isAuthorizedStatus(status),
    canRequest: status === messaging.AuthorizationStatus.NOT_DETERMINED,
    status,
  };
}

async function requestIosNotificationPermission() {
  const status = await messaging().requestPermission();

  return {
    granted: isAuthorizedStatus(status),
    status,
  };
}

export async function getNotificationPermissionStatus() {
  if (Platform.OS === "ios") {
    return getIosNotificationPermissionStatus();
  }

  if (Platform.OS === "android") {
    return getAndroidNotificationPermissionStatus();
  }

  return {
    granted: false,
    canRequest: false,
    status: "UNSUPPORTED",
  };
}

/** OS 알림 권한 허용 여부 (설정 화면/온보딩 판단용) */
export async function getNotificationPermissionGranted() {
  const permissionStatus = await getNotificationPermissionStatus();
  return permissionStatus.granted;
}

async function ensureNotificationPermissionForEnable() {
  const currentStatus = await getNotificationPermissionStatus();

  if (currentStatus.granted) {
    return {
      granted: true,
      requested: false,
      status: currentStatus.status,
    };
  }

  if (!currentStatus.canRequest) {
    return {
      granted: false,
      requested: false,
      status: currentStatus.status,
      shouldOpenSettings: true,
    };
  }

  const requestResult =
    Platform.OS === "ios"
      ? await requestIosNotificationPermission()
      : await requestAndroidNotificationPermission();

  const nextStatus = await getNotificationPermissionStatus();

  return {
    granted: requestResult.granted,
    requested: true,
    status: nextStatus.status,
    shouldOpenSettings: !requestResult.granted && !nextStatus.canRequest,
  };
}

async function getFcmToken() {
  if (Platform.OS === "ios") {
    await messaging().registerDeviceForRemoteMessages();
  }

  return messaging().getToken();
}

async function obtainFcmTokenReliable() {
  const readNonEmpty = async () => {
    const token = await getFcmToken();
    const normalizedToken = token && String(token).trim();

    if (!normalizedToken) {
      throw new Error("FCM token is empty");
    }

    return normalizedToken;
  };

  try {
    return await readNonEmpty();
  } catch (firstError) {
    try {
      await messaging().deleteToken();
    } catch {
      /* ignore */
    }

    try {
      return await readNonEmpty();
    } catch {
      throw firstError;
    }
  }
}

async function patchDevicePushEnabled(accessToken, deviceId, pushEnabled) {
  const { data } = await api.patch(
    "/api/v1/devices/push-enabled",
    { deviceId, pushEnabled },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (data && data.success === false) {
    const error = new Error(data.message || "push-enabled rejected");
    error.apiPayload = data;
    throw error;
  }

  // 디버그: 전체 푸시 토글 시 서버 응답 확인용 (안정화 후 제거 가능)
  console.log(
    "[푸시설정] PATCH /api/v1/devices/push-enabled 서버 응답",
    JSON.stringify(data ?? null, null, 2),
  );

  return data;
}

async function patchDevicePushDetailSettings(
  accessToken,
  deviceId,
  postCommentPushEnabled,
  postEmotionPushEnabled,
) {
  const { data } = await api.patch(
    "/api/v1/devices/push-detail-settings",
    {
      deviceId,
      postCommentPushEnabled,
      postEmotionPushEnabled,
    },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (data && data.success === false) {
    const error = new Error(data.message || "push-detail-settings rejected");
    error.apiPayload = data;
    throw error;
  }

  // 디버그: 댓글/공감 세부 토글 시 서버 응답 확인용 (안정화 후 제거 가능)
  console.log(
    "[푸시설정] PATCH /api/v1/devices/push-detail-settings 서버 응답",
    JSON.stringify(data ?? null, null, 2),
  );

  return data;
}

async function putDevicePushSettings(accessToken, deviceId, fcmToken) {
  const { data } = await api.put(
    "/api/v1/devices/push-settings",
    {
      deviceId,
      fcmToken: fcmToken ?? "",
    },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (data && data.success === false) {
    const error = new Error(data.message || "push-settings rejected");
    error.apiPayload = data;
    throw error;
  }

  // 디버그: 전체 푸시 ON 직후 FCM 동기화(put) 응답 — 토글 직접 응답은 아니나 흐름 추적용 (안정화 후 제거 가능)
  console.log(
    "[푸시설정] PUT /api/v1/devices/push-settings 서버 응답",
    JSON.stringify(data ?? null, null, 2),
  );

  return data;
}

async function getDevicePushSettings(accessToken, deviceId) {
  const { data } = await api.get("/api/v1/devices/push-settings", {
    params: { deviceId },
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return normalizePushSettings(data);
}

export async function submitPushEnabledToServer(pushEnabled) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return { skipped: true, reason: "NO_ACCESS_TOKEN" };
  }

  const deviceId = await getDeviceId();

  if (!pushEnabled) {
    await patchDevicePushEnabled(accessToken, deviceId, false);
    return {
      ok: true,
      settings: normalizePushSettings({
        deviceId,
        pushEnabled: false,
        postCommentPushEnabled: false,
        postEmotionPushEnabled: false,
      }),
    };
  }

  const permissionResult = await ensureNotificationPermissionForEnable();
  if (!permissionResult.granted) {
    return {
      skipped: true,
      reason: "NOTIFICATION_PERMISSION_NOT_GRANTED",
      shouldOpenSettings: permissionResult.shouldOpenSettings === true,
      permissionStatus: permissionResult.status,
    };
  }

  await patchDevicePushEnabled(accessToken, deviceId, true);

  // 전체 푸시 ON 시 댓글/공감 세부 토글도 함께 켜져야 하므로, push-detail-settings에 둘 다 true로 맞춤
  await patchDevicePushDetailSettings(accessToken, deviceId, true, true);

  let fcmToken = null;
  let tokenSync = null;
  try {
    fcmToken = await obtainFcmTokenReliable();
    await putDevicePushSettings(accessToken, deviceId, fcmToken);
    tokenSync = { ok: true };
  } catch (error) {
    tokenSync = { skipped: true, reason: "FCM_TOKEN_ERROR", error };
  }

  return {
    ok: true,
    fcmToken,
    tokenSync,
    settings: normalizePushSettings({
      deviceId,
      pushEnabled: true,
      postCommentPushEnabled: true,
      postEmotionPushEnabled: true,
    }),
  };
}

export async function submitPushDetailSettingsToServer({
  postCommentPushEnabled,
  postEmotionPushEnabled,
}) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return { skipped: true, reason: "NO_ACCESS_TOKEN" };
  }

  const commentOn = coercePushDetailBool(postCommentPushEnabled);
  const emotionOn = coercePushDetailBool(postEmotionPushEnabled);

  const deviceId = await getDeviceId();

  await patchDevicePushDetailSettings(
    accessToken,
    deviceId,
    commentOn,
    emotionOn,
  );

  return {
    ok: true,
    // 세부만 PATCH했을 때 pushEnabled를 AND로 넣으면 한쪽만 켠 경우 전체 스위치가 꺼진 것처럼 normalize됨 → 명시하지 않고 세부 기준으로만 정규화
    settings: normalizePushSettings({
      deviceId,
      postCommentPushEnabled: commentOn,
      postEmotionPushEnabled: emotionOn,
    }),
  };
}

export async function fetchCurrentDevicePushSettings() {
  const accessToken = await getAccessToken();
  const deviceId = await getDeviceId();

  if (!accessToken) {
    return {
      skipped: true,
      reason: "NO_ACCESS_TOKEN",
      settings: normalizePushSettings({ deviceId }),
    };
  }

  try {
    const settings = await getDevicePushSettings(accessToken, deviceId);
    return { ok: true, settings };
  } catch (error) {
    if (error?.response?.status === 404) {
      return {
        skipped: true,
        reason: "DEVICE_NOT_FOUND",
        settings: normalizePushSettings({ deviceId }),
      };
    }

    throw error;
  }
}

export async function runSignupPushPermissionFlow() {
  const permissionResult = await ensureNotificationPermissionForEnable();
  if (!permissionResult.granted) {
    return {
      skipped: true,
      reason: "NOTIFICATION_PERMISSION_NOT_GRANTED",
      shouldOpenSettings: permissionResult.shouldOpenSettings === true,
      permissionStatus: permissionResult.status,
    };
  }

  const accessToken = await getAccessToken();
  const deviceId = await getDeviceId();

  if (!accessToken) {
    return { skipped: true, reason: "NO_ACCESS_TOKEN" };
  }

  await patchDevicePushEnabled(accessToken, deviceId, true);

  const syncResult = await syncCurrentDevicePushSettings({
    requestPermission: false,
  });

  return {
    ok: true,
    fcmToken: syncResult.skipped ? null : syncResult.fcmToken,
    tokenSync: syncResult.skipped ? syncResult : { ok: true },
    settings: normalizePushSettings({
      deviceId,
      pushEnabled: true,
      postCommentPushEnabled: true,
      postEmotionPushEnabled: true,
    }),
  };
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
  const hasPermission = requestPermission
    ? (await ensureNotificationPermissionForEnable()).granted
    : await getNotificationPermissionGranted();

  let fcmToken = null;
  let skippedReason = null;

  if (hasPermission) {
    try {
      fcmToken = overrideFcmToken ?? (await getFcmToken());
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      if (Platform.OS === "ios" && errorMessage.includes("aps-environment")) {
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
    };
  }

  await putDevicePushSettings(accessToken, deviceId, fcmToken);

  return {
    deviceId,
    fcmToken,
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
