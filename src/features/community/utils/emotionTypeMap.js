/**
 * Swagger: LIKE / SAD / FUN / HYPE
 * UI(PostReactions): EMO_JOY / EMO_SAD / EMO_FUN / EMO_HYPE
 */

const UI_TO_API = {
  EMO_JOY: "LIKE",
  EMO_SAD: "SAD",
  EMO_FUN: "FUN",
  EMO_HYPE: "HYPE",
};

const API_TO_UI = {
  LIKE: "EMO_JOY",
  SAD: "EMO_SAD",
  FUN: "EMO_FUN",
  HYPE: "EMO_HYPE",
};

/** UI 리액션 id -> API 요청 emotionType */
export const toApiEmotionType = (uiOrApi) => {
  if (uiOrApi == null || uiOrApi === "") return null;
  return UI_TO_API[uiOrApi] ?? uiOrApi;
};

/** API 응답 emotionType -> UI 리액션 id */
export const toUiEmotionType = (apiOrUi) => {
  if (apiOrUi == null || apiOrUi === "") return null;
  return API_TO_UI[apiOrUi] ?? apiOrUi;
};
