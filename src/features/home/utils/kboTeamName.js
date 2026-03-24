import { TEAM_DATA, TEAM_LIST } from "../../../shared/constants/teams";

/**
 * Swagger 기준 teamName(짧은 한글/영문) -> TEAM_DATA 키
 * 응원팀 비교는 favoriteTeamCode와 동일한 키로 맞춘 뒤 사용
 */
const API_TEAM_NAME_TO_KEY = {
  LG: "LG",
  삼성: "SAMSUNG",
  Samsung: "SAMSUNG",
  KT: "KT",
  SSG: "SSG",
  NC: "NC",
  두산: "DOOSAN",
  롯데: "LOTTE",
  키움: "KIWOOM",
  한화: "HANWHA",
  KIA: "KIA",
  기아: "KIA",
};

/**
 * @param {string | undefined} teamName
 * @returns {keyof typeof TEAM_DATA | null}
 */
export function resolveTeamKeyFromApiTeamName(teamName) {
  if (teamName == null || typeof teamName !== "string") return null;
  const t = teamName.trim();
  if (!t) return null;
  if (TEAM_DATA[t]) return t;
  const mapped = API_TEAM_NAME_TO_KEY[t];
  if (mapped && TEAM_DATA[mapped]) return mapped;

  for (const { key, label } of TEAM_LIST) {
    if (!label) continue;
    if (label === t) return key;
    const firstWord = label.split(/\s+/)[0];
    if (firstWord && (t === firstWord || label.startsWith(t))) return key;
  }
  return null;
}

/** 기획 예시(2026.03.28 ~ 09.06)와 동일한 형식 — 연도만 동적 */
export function getKboSeasonDateRangeLabel(year) {
  const y = Number(year) || new Date().getFullYear();
  return `${y}.03.28 ~ 09.06`;
}
