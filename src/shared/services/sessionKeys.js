// src/shared/api/sessionKeys.js

export const sessionKeys = {
  // 전체 세션/토큰 namespace
  all: ["session"],

  tokens: () => [...sessionKeys.all, "tokens"],

  // 토큰 재발급
  refresh: () => [...sessionKeys.tokens(), "refresh"],
};
export default sessionKeys;
