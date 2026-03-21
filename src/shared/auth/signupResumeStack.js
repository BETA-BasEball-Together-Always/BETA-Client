import { CommonActions } from "@react-navigation/native";

function buildInnerAuthRoutes(resume) {
  if (!resume?.name) return null;

  const routes = [{ name: "Login" }];

  const push = (name, params) => {
    routes.push(params != null ? { name, params } : { name });
  };

  switch (resume.name) {
    case "TermsDetail":
      push("TermsDetail");
      break;
    case "SocialSignup":
      push("TermsDetail");
      push("SocialSignup", resume.params);
      break;
    case "SignupFavoriteTeam": {
      const email = resume.params?.signup?.email ?? null;
      push("TermsDetail");
      push("SocialSignup", { signup: { email } });
      push("SignupFavoriteTeam", resume.params);
      break;
    }
    case "SignupGenderAge": {
      const email = resume.params?.signup?.email ?? null;
      push("TermsDetail");
      push("SocialSignup", { signup: { email } });
      push("SignupFavoriteTeam", {
        signup: resume.params?.signup ?? {},
        teamList: resume.params?.teamList ?? [],
      });
      push("SignupGenderAge", resume.params);
      break;
    }
    default:
      return null;
  }

  if (routes.length <= 1) return null;

  return {
    index: routes.length - 1,
    routes,
  };
}

/**
 * Root Stack의 Auth 화면에 중첩 state를 넣어 재진입 시 하위 스택을 한 번에 구성
 * (AuthStack 컴포넌트에서 dispatch — useNavigation은 Root 기준으로 사용)
 */
export function buildRootResetForAuthNestedResume(resume) {
  const inner = buildInnerAuthRoutes(resume);
  if (!inner) return null;

  return CommonActions.reset({
    index: 0,
    routes: [
      {
        name: "Auth",
        state: {
          index: inner.index,
          routes: inner.routes,
        },
      },
    ],
  });
}
