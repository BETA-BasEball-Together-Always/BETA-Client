import { InteractionManager } from "react-native";
import { CommonActions } from "@react-navigation/native";
import { navigationRef } from "../../app/navigation/navigationRef";
import { useUserStore } from "../store/userStore";
import { setPendingAuthErrorMessage } from "../auth/pendingAuthResume";
import { clearPersistedSignupDraft } from "../../features/auth/stores/useSignupDraftStore";
import { setPendingAuthResume } from "../auth/pendingAuthResume";

const DEFAULT_MSG = "로그인이 필요합니다. 다시 로그인해 주세요.";

/**
 * 세션 무효 시 로그인 화면으로 전환 (API 인터셉터 등 네비게이션 컨텍스트 없을 때)
 */
export async function forceLogoutToLogin(message = DEFAULT_MSG) {
  await useUserStore.getState().clearAuth();
  // 회원가입 draft가 남아 있으면 로그아웃 후에도 가입 단계로 복귀하는 문제가 생길 수 있어 함께 정리
  await clearPersistedSignupDraft();
  // 이전 부트스트랩에서 저장된 resume가 남아 있으면 AuthStack이 다시 가입 단계로 reset할 수 있어 초기화
  setPendingAuthResume(null);
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
