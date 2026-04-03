import React, { useEffect } from "react";
import messaging from "@react-native-firebase/messaging";

import {
  flushPendingPushNavigation,
  queuePushOpen,
} from "../services/pushOpenService";
import { useUserStore } from "../store/userStore";

const PushOpenBootstrap = () => {
  const accessToken = useUserStore((state) => state.accessToken);
  const userId = useUserStore((state) => state.user?.id ?? null);

  useEffect(() => {
    let cancelled = false;

    const handlePushOpen = (remoteMessage, source) => {
      const result = queuePushOpen(remoteMessage);
      if (!result.queued) {
        return;
      }

      flushPendingPushNavigation();
    };

    const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
      handlePushOpen(remoteMessage, "background");
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (cancelled || !remoteMessage) {
          return;
        }
        handlePushOpen(remoteMessage, "quit");
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    flushPendingPushNavigation();
  }, [accessToken, userId]);

  return null;
};

export default PushOpenBootstrap;
