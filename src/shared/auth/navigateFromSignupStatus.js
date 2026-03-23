/**
 * GET /auth/signup/status 응답 기준으로 회원가입 다음 화면으로 이동
 * @returns {boolean} 라우팅을 수행했으면 true
 */
export function navigateFromSignupStatus(status, navigation) {
  const step = status?.signupStep;
  const email = status?.email ?? null;
  const teamList = status?.teamList ?? [];

  switch (step) {
    case "SOCIAL_AUTHENTICATED":
      navigation.navigate("TermsDetail");
      return true;
    case "CONSENT_AGREED":
      navigation.navigate("SocialSignup", {
        signup: { email: email ?? "" },
      });
      return true;
    case "PROFILE_COMPLETED":
      navigation.navigate("SignupFavoriteTeam", {
        signup: {},
        teamList,
      });
      return true;
    case "TEAM_SELECTED":
      navigation.navigate("SignupGenderAge", { signup: {} });
      return true;
    default:
      return false;
  }
}
