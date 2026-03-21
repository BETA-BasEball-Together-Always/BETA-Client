/**
 * GET /auth/signup/status 응답 기준으로 회원가입 다음 화면으로 이동 (replace)
 * @returns {boolean} 라우팅을 수행했으면 true
 */
export function navigateFromSignupStatus(status, navigation) {
  const step = status?.signupStep;
  const email = status?.email ?? null;
  const teamList = status?.teamList ?? [];

  switch (step) {
    case "SOCIAL_AUTHENTICATED":
      navigation.replace("TermsDetail");
      return true;
    case "CONSENT_AGREED":
      navigation.replace("SocialSignup", {
        signup: { email: email ?? "" },
      });
      return true;
    case "PROFILE_COMPLETED":
      navigation.replace("SignupFavoriteTeam", {
        signup: {},
        teamList,
      });
      return true;
    case "TEAM_SELECTED":
      navigation.replace("SignupGenderAge", { signup: {} });
      return true;
    default:
      return false;
  }
}
