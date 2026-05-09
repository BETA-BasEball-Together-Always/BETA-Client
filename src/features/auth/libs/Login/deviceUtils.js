import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import * as Application from "expo-application";
import * as Crypto from "expo-crypto";

// todo: expo-secure-store, expo-application

const DEVICE_ID_KEY = "DEVICE_ID";

/**
 * 기기 고유 ID 반환!
 * (1) 최고 1회 UUID 생성 후 SecureStore에 저장
 * (2) 이후 호출 시 저장된 UUID 재사용
 */

export const getDeviceId = async () => {
  try {
    // 이미 저장된 deviceId 확인
    const storedDeviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (storedDeviceId) {
      return storedDeviceId;
    }

    let deviceId = null;

    // 플랫폼별 고유 ID 가져오기
    if (Platform.OS === "ios") {
      deviceId = Application.getIosIdForVendorAsync
        ? await Application.getIosIdForVendorAsync()
        : null;
    } else if (Platform.OS === "android") {
      deviceId = Application.androidId || null;
    }

    // 고유 ID를 못 가져왔으면 UUID 생성
    if (!deviceId) {
      deviceId = Crypto.randomUUID();
    }

    // SecureStore에 저장
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);

    return deviceId;
  } catch (error) {
    console.warn("getDeviceId error:", error);
    return Crypto.randomUUID();
  }
};
