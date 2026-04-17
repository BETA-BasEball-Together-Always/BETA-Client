import { CommonActions } from "@react-navigation/native";
import { useSignupDraftStore } from "@features/auth/stores/useSignupDraftStore";

function buildInnerAuthRoutes(resume) {
  if (!resume?.name || typeof resume.name !== "string") return null;

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
      push("SocialSignup", {
        ...(resume.params ?? {}),
        signup: {
          ...(useSignupDraftStore.getState().buildSignupParams?.() ?? {}),
          ...(resume.params?.signup ?? {}),
        },
      });
      break;
    case "SignupFavoriteTeam": {
      const email = resume.params?.signup?.email ?? null;
      const draftSignup =
        useSignupDraftStore.getState().buildSignupParams?.() ?? {};
      const resumeSignup =
        resume.params?.signup && typeof resume.params.signup === "object"
          ? resume.params.signup
          : {};
      const mergedSignup = { ...draftSignup, ...resumeSignup };
      push("TermsDetail");
      push("SocialSignup", {
        signup: {
          ...mergedSignup,
          email: email ?? mergedSignup.email ?? "",
        },
      });
      push("SignupFavoriteTeam", {
        signup: mergedSignup,
      });
      break;
    }
    case "SignupGenderAge": {
      const email = resume.params?.signup?.email ?? null;
      const draftSignup =
        useSignupDraftStore.getState().buildSignupParams?.() ?? {};
      const resumeSignup =
        resume.params?.signup && typeof resume.params.signup === "object"
          ? resume.params.signup
          : {};
      const mergedSignup = { ...draftSignup, ...resumeSignup };
      push("TermsDetail");
      push("SocialSignup", {
        signup: {
          ...mergedSignup,
          email: email ?? mergedSignup.email ?? "",
        },
      });
      push("SignupFavoriteTeam", {
        signup: mergedSignup,
      });
      const raw =
        resume.params && typeof resume.params === "object" ? resume.params : {};
      const { teamList: _omitTeamList, ...genderAgeParams } = raw;
      push("SignupGenderAge", genderAgeParams);
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
