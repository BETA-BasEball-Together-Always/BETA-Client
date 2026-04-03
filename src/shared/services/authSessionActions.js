import { InteractionManager } from "react-native";
import { CommonActions } from "@react-navigation/native";
import { navigationRef } from "../../app/navigation/navigationRef";
import { useUserStore } from "../store/userStore";
import { setPendingAuthErrorMessage } from "../auth/pendingAuthResume";

const DEFAULT_MSG = "로그인이 필요합니다. 다시 로그인해 주세요.";

/**
 * 세션 무효 시 로그인 화면으로 전환 (API 인터셉터 등 네비게이션 컨텍스트 없을 때)
 */
export async function forceLogoutToLogin(message = DEFAULT_MSG) {
  await useUserStore.getState().clearAuth();
  const { default: api } = await import("../libs/api");
  delete api.defaults.headers.Authorization;
  setPendingAuthErrorMessage(message);

  await new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => resolve());
  });

  if (navigationRef.isReady()) {
    try {
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: "Auth",
              state: {
                routes: [
                  { name: "Login", params: { authErrorMessage: message } },
                ],
                index: 0,
              },
            },
          ],
        }),
      );
    } catch (e) {
      console.warn("[forceLogoutToLogin] navigation reset failed", e);
    }
  }
}
