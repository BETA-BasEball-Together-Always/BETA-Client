import { TEAM_DATA } from "../../../shared/constants/teams";

/**
 * 디자인 컨펌 전이므로 롤백 시 이 값만 false로 바꾸면 기존 TEAM_DATA.MainIcon 로고로 복귀!!
 */
export const USE_KBO_RABBIT_RANK_LOGO = true;

/**
 * 브랜드 색상에 가깝게 두되 서로 겹치기 쉬운 그룹(LG/SSG/롯데/KIA/키움/NC/두산)의
 * 색상 차를 키우도록 잡은 임시 색상 코드
 * 추후 디자인팀 의견에 따라 삭제 또는 조정할 것!
 */
export const KBO_RABBIT_HAT_OVERRIDES = {
  KT: { main: "#6E6E6E", shade: "#2D2D2D" },
  LG: { main: "#C30052", shade: "#7A0034" },
  SAMSUNG: { main: "#1B64C6", shade: "#0A3D82" },
  KIA: { main: "#EA0029", shade: "#8E0018" },
  DOOSAN: { main: "#141B4B", shade: "#070B24" },
  HANWHA: { main: "#FF7A00", shade: "#C55A00" },
  KIWOOM: { main: "#7A0A3E", shade: "#3D051F" },
  LOTTE: { main: "#002F6C", shade: "#C40021" },
  NC: { main: "#4F8AD4", shade: "#2A5588" },
  SSG: { main: "#D81E35", shade: "#FF7A2E" },
};

/**
 * @param {string} teamKey — TEAM_DATA 키 (LG, KT, …)
 * @returns {{ main: string, shade: string } | null}
 */
export function getKboRankRabbitHatColors(teamKey) {
  if (!teamKey || !TEAM_DATA[teamKey]) return null;

  const override = KBO_RABBIT_HAT_OVERRIDES[teamKey];
  if (override?.main && override?.shade) {
    return { main: override.main, shade: override.shade };
  }

  const cols = TEAM_DATA[teamKey].gradient?.colors;
  if (!Array.isArray(cols) || cols.length === 0) return null;
  const main = cols[Math.min(1, cols.length - 1)] ?? cols[0];
  const shade = cols[Math.min(2, cols.length - 1)] ?? cols[0];
  return { main, shade };
}
