import { useSignupDraftStore } from "@features/auth/stores/useSignupDraftStore";

/**
 * GET /auth/signup/status 응답 기준으로 회원가입 다음 화면으로 이동
 * @returns {boolean} 라우팅을 수행했으면 true
 */
export function navigateFromSignupStatus(status, navigation) {
  const step = status?.signupStep;
  const email = status?.email ?? null;
  const teamList = status?.teamList ?? [];
  const draftSignup =
    useSignupDraftStore.getState().buildSignupParams?.() ?? {};

  switch (step) {
    case "SOCIAL_AUTHENTICATED":
      navigation.navigate("TermsDetail");
      return true;
    case "CONSENT_AGREED":
      navigation.navigate("SocialSignup", {
        signup: { ...draftSignup, email: email ?? draftSignup.email ?? "" },
      });
      return true;
    case "PROFILE_COMPLETED":
      navigation.navigate("SignupFavoriteTeam", {
        signup: { ...draftSignup, email: email ?? draftSignup.email ?? "" },
        teamList,
      });
      return true;
    case "TEAM_SELECTED":
      navigation.navigate("SignupGenderAge", {
        signup: { ...draftSignup, email: email ?? draftSignup.email ?? "" },
      });
      return true;
    default:
      return false;
  }
}
