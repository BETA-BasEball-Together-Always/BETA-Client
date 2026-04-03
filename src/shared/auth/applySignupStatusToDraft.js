import { useSignupDraftStore } from "@features/auth/stores/useSignupDraftStore";

/**
 * GET /api/v1/auth/signup/status (SignupStatusResponse) 결과를 draft에 반영.
 * 스키마: email, signupStep, teamList — nickname 등은 백엔드 확장 필드일 수 있어 optional 처리.
 * @see https://beta-app.kr/api/swagger-ui/index.html#/Auth/getSignupStatus
 */
export function applySignupStatusToDraft(status) {
  if (!status || typeof status !== "object") return;

  const step = status.signupStep;
  const store = useSignupDraftStore.getState();
  const prevTerms = store.terms ?? {};

  if (typeof status.email === "string" && status.email.trim()) {
    store.setEmail(status.email.trim());
  }

  // 약관 단계를 지난 경우: 약관 화면 뒤로가기 시 체크 UI 복원
  if (step && step !== "SOCIAL_AUTHENTICATED") {
    store.setTerms({
      all: true,
      over14: true,
      tos: true,
      privacyRequired: true,
      privacyMarketing: !!prevTerms.privacyMarketing,
    });
  }

  const nick =
    status.nickname ?? status.nickName ?? status.profileNickname ?? null;
  if (typeof nick === "string" && nick.trim()) {
    store.hydrateNickname(nick.trim(), true);
  } else if (step === "PROFILE_COMPLETED" || step === "TEAM_SELECTED") {
    if (store.nickname?.trim()) {
      store.setNicknameChecked(true);
    }
  }
}
