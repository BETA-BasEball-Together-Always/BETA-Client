// src/features/auth/services/authKeys.js

export const authKeys = {
  // 전체 auth 네임스페이스
  all: ["auth"],

  // 로그인 관련
  login: () => [...authKeys.all, "login"],

  emailLogin: () => [...authKeys.login(), "email"],
  socialLogin: (provider) => [...authKeys.login(), "social", { provider }],

  // 회원가입 관련
  signup: () => [...authKeys.all, "signup"],
  signupComplete: () => [...authKeys.signup(), "complete"],

  // 닉네임 중복 확인
  nickname: () => [...authKeys.all, "nickname"],
  nicknameDuplicate: (nickname) => [
    ...authKeys.nickname(),
    "duplicate-check",
    { nickname },
  ],

  // 이메일 중복 확인
  email: () => [...authKeys.all, "email"],
  emailDuplicate: (email) => [
    ...authKeys.email(),
    "duplicate-check",
    { email },
  ],
};

export default authKeys;
