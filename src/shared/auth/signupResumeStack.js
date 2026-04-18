import { CommonActions } from "@react-navigation/native";
import { useSignupDraftStore } from "@features/auth/stores/useSignupDraftStore";

/**
 * 네비게이션 reset에 넣을 params를 JSON 직렬화 가능한 순수 데이터로만!
 */
function sanitizeRouteParams(params) {
  if (params == null || typeof params !== "object") return undefined;
  try {
    const parsed = JSON.parse(
      JSON.stringify(params, (_, v) => {
        if (typeof v === "function" || typeof v === "symbol") return undefined;
        if (typeof v === "number" && !Number.isFinite(v)) return undefined;
        return v;
      }),
    );
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function mergeSignupForNavigation(draftSignup, resumeSignup) {
  const d = draftSignup && typeof draftSignup === "object" ? draftSignup : {};
  const r = resumeSignup && typeof resumeSignup === "object" ? resumeSignup : {};
  return sanitizeRouteParams({ ...d, ...r }) ?? {};
}

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
    case "SocialSignup": {
      const mergedSignup = mergeSignupForNavigation(
        useSignupDraftStore.getState().buildSignupParams?.() ?? {},
        resume.params?.signup,
      );
      push("TermsDetail");
      push(
        "SocialSignup",
        sanitizeRouteParams({
          ...(resume.params ?? {}),
          signup: mergedSignup,
        }),
      );
      break;
    }
    case "SignupFavoriteTeam": {
      const email = resume.params?.signup?.email ?? null;
      const draftSignup =
        useSignupDraftStore.getState().buildSignupParams?.() ?? {};
      const resumeSignup =
        resume.params?.signup && typeof resume.params.signup === "object"
          ? resume.params.signup
          : {};
      const mergedSignup = mergeSignupForNavigation(draftSignup, resumeSignup);
      push("TermsDetail");
      push(
        "SocialSignup",
        sanitizeRouteParams({
          signup: {
            ...mergedSignup,
            email: email ?? mergedSignup.email ?? "",
          },
        }),
      );
      push(
        "SignupFavoriteTeam",
        sanitizeRouteParams({
          signup: mergedSignup,
        }),
      );
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
      const mergedSignup = mergeSignupForNavigation(draftSignup, resumeSignup);
      push("TermsDetail");
      push(
        "SocialSignup",
        sanitizeRouteParams({
          signup: {
            ...mergedSignup,
            email: email ?? mergedSignup.email ?? "",
          },
        }),
      );
      push(
        "SignupFavoriteTeam",
        sanitizeRouteParams({
          signup: mergedSignup,
        }),
      );
      const raw =
        resume.params && typeof resume.params === "object" ? resume.params : {};
      const { teamList: _omitTeamList, ...genderAgeParams } = raw;
      push(
        "SignupGenderAge",
        sanitizeRouteParams(genderAgeParams),
      );
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
          type: "stack",
          stale: true,
          index: inner.index,
          routes: inner.routes,
        },
      },
    ],
  });
}
