import { create } from "zustand";
import { persist } from "zustand/middleware";
import { signupDraftJSONStorage } from "./signupDraftPersistStorage";

const emptyTerms = {
  all: false,
  over14: false,
  tos: false,
  privacyRequired: false,
  privacyMarketing: false,
};

/**
 * 회원가입 진행 중 입력값을 "이탈/재진입"에도 유지하기 위한 draft store
 * - 민감정보(비밀번호/소셜토큰)는 별도 메모리 store(`useSignupSecretStore`)에 남긴다
 */
export const useSignupDraftStore = create(
  persist(
    (set, get) => ({
      email: "",
      nickname: "",
      nicknameChecked: false,
      terms: emptyTerms,
      favoriteTeamCode: null,
      favoriteTeamLabel: null,
      gender: null, // "F" | "M" | null
      age: "", // string to match input

      setEmail: (email) => set({ email: email ?? "" }),
      /** 닉네임 문자열이 바뀔 때만 중복확인 플래그 초기화(동일 문자열 재저장으로 리셋되는 레이스 방지) */
      setNickname: (nickname) =>
        set((state) => {
          const next = nickname ?? "";
          if (state.nickname === next) {
            return { nickname: next };
          }
          return { nickname: next, nicknameChecked: false };
        }),
      /** 서버 상태/재진입 복원용 — 중복확인 플래그를 함께 설정 */
      hydrateNickname: (nickname, nicknameChecked = true) =>
        set({
          nickname: nickname ?? "",
          nicknameChecked: !!nicknameChecked,
        }),
      setNicknameChecked: (checked) => set({ nicknameChecked: !!checked }),
      setTerms: (terms) => set({ terms: terms ?? emptyTerms }),
      setFavoriteTeam: ({ code, label }) =>
        set({
          favoriteTeamCode: code ?? null,
          favoriteTeamLabel: label ?? null,
        }),
      setGender: (gender) => set({ gender: gender ?? null }),
      setAge: (age) => set({ age: age ?? "" }),

      /** navigation params로 내려보낼 signup payload */
      buildSignupParams: () => {
        const s = get();
        return {
          email: s.email ?? "",
          nickname: s.nickname ?? "",
          favoriteTeamCode: s.favoriteTeamCode ?? undefined,
          favoriteTeamLabel: s.favoriteTeamLabel ?? undefined,
          gender: s.gender ?? undefined,
          age: s.age ? Number(s.age) : undefined,
          terms: s.terms ?? emptyTerms,
        };
      },

      clearDraft: () =>
        set({
          email: "",
          nickname: "",
          nicknameChecked: false,
          terms: emptyTerms,
          favoriteTeamCode: null,
          favoriteTeamLabel: null,
          gender: null,
          age: "",
        }),
    }),
    {
      name: "auth-signup-draft",
      storage: signupDraftJSONStorage,
      partialize: (state) => ({
        email: state.email,
        nickname: state.nickname,
        nicknameChecked: state.nicknameChecked,
        terms: state.terms,
        favoriteTeamCode: state.favoriteTeamCode,
        favoriteTeamLabel: state.favoriteTeamLabel,
        gender: state.gender,
        age: state.age,
      }),
    },
  ),
);

export function getSignupDraftSnapshot() {
  return useSignupDraftStore.getState();
}

export async function hydrateSignupDraftFromStorage() {
  try {
    await useSignupDraftStore.persist.rehydrate();
  } catch {
    /* ignore */
  }
}

export async function clearPersistedSignupDraft() {
  useSignupDraftStore.getState().clearDraft();
  try {
    await useSignupDraftStore.persist.clearStorage();
  } catch {
    /* ignore */
  }
}
