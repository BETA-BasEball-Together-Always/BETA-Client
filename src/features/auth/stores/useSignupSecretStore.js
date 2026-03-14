import {create} from "zustand";

/**
 * 회원가입 중 민감정보(비밀번호 등)를 params에 싣지 않고
 * 메모리에서만 임시로 보관하는 store (persist 사용 X)
 */
export const useSignupSecretStore = create((set) => ({
  password: "",
  socialToken: "",
  socialProvider: null, // "KAKAO" | "NAVER"

  setPassword: (password) => set({password}),
  setSocialAuth: ({provider, token}) =>
    set({socialProvider: provider, socialToken: token}),
  clearSecrets: () =>
    set({password: "", socialToken: "", socialProvider: null}),
}));
