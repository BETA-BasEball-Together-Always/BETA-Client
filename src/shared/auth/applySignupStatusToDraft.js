import { useSignupDraftStore } from "@features/auth/stores/useSignupDraftStore";

/**
 * GET /api/v1/auth/signup/status (SignupStatusResponse) 결과를 draft에 반영
 * @see https://beta-app.kr/api/swagger-ui/index.html#/Auth/getSignupStatus
 */
export function applySignupStatusToDraft(status) {
  if (!status || typeof status !== "object") return;

  let step;
  try {
    step = String(status.signupStep ?? "")
      .trim()
      .toUpperCase();
  } catch {
    step = "";
  }
  const store = useSignupDraftStore.getState();
  const prevTerms = store.terms ?? {};

  if (typeof status.email === "string" && status.email.trim()) {
    store.setEmail(status.email.trim());
  }

  if (step && step !== "SOCIAL_AUTHENTICATED") {
    const privacyMarketing = !!prevTerms.privacyMarketing;
    store.setTerms({
      all: true,
      over14: true,
      tos: true,
      privacyRequired: true,
      privacyMarketing,
    });
  }

  if (step === "PROFILE_COMPLETED" || step === "TEAM_SELECTED") {
    if (store.nickname?.trim()) {
      store.setNicknameChecked(true);
    }
  }
}
