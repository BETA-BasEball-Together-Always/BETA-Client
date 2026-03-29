import React, { useEffect, useRef } from "react";
import { AppState } from "react-native";

import { useUserStore } from "../store/userStore";
import {
  subscribePushTokenRefresh,
  syncCurrentDevicePushSettings,
} from "../services/pushDeviceService";

const PushDeviceBootstrap = () => {
  const accessToken = useUserStore((state) => state.accessToken);
  const syncedTokenRef = useRef(null);

  useEffect(() => {
    if (!accessToken) {
      syncedTokenRef.current = null;
      return;
    }

    if (syncedTokenRef.current === accessToken) {
      return;
    }

    syncedTokenRef.current = accessToken;

    syncCurrentDevicePushSettings({ requestPermission: false }).catch(
      (error) => {
        console.warn(
          "[푸시] 로그인 후 디바이스 푸시 설정 동기화에 실패했습니다.",
          error,
        );
      },
    );
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      return undefined;
    }

    const unsubscribe = subscribePushTokenRefresh();
    return unsubscribe;
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      return undefined;
    }

    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        return;
      }

      syncCurrentDevicePushSettings({ requestPermission: false }).catch(
        (error) => {
          console.warn(
            "[푸시] 앱 활성화 후 디바이스 푸시 설정 동기화에 실패했습니다.",
            error,
          );
        },
      );
    });

    return () => {
      subscription.remove();
    };
  }, [accessToken]);

  return null;
};

export default PushDeviceBootstrap;
