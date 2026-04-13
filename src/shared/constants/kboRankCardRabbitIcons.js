import DOOSAN_RABBIT from "../assets/svg/kbocard/doosanRabbit.svg";
import HANWHA_RABBIT from "../assets/svg/kbocard/hanhwaRabbit.svg";
import KIA_RABBIT from "../assets/svg/kbocard/kiaRabbit.svg";
import KIWOOM_RABBIT from "../assets/svg/kbocard/kiwoomRabbit.svg";
import KT_RABBIT from "../assets/svg/kbocard/ktRabbit.svg";
import LG_RABBIT from "../assets/svg/kbocard/lgRabbit.svg";
import LOTTE_RABBIT from "../assets/svg/kbocard/lotteRabbit.svg";
import NC_RABBIT from "../assets/svg/kbocard/ncRabbit.svg";
import SAMSUNG_RABBIT from "../assets/svg/kbocard/samsungRabbit.svg";
import SSG_RABBIT from "../assets/svg/kbocard/ssgRabbit.svg";

/** @type {Record<string, import("react").ComponentType<{ width?: number, height?: number }>>} */
export const KBO_RANK_CARD_RABBIT_BY_TEAM = {
  KT: KT_RABBIT,
  LG: LG_RABBIT,
  SAMSUNG: SAMSUNG_RABBIT,
  KIA: KIA_RABBIT,
  DOOSAN: DOOSAN_RABBIT,
  HANWHA: HANWHA_RABBIT,
  KIWOOM: KIWOOM_RABBIT,
  LOTTE: LOTTE_RABBIT,
  NC: NC_RABBIT,
  SSG: SSG_RABBIT,
};

/**
 * KBO 순위표 행에 쓸 구단별 토끼 캐릭터! (SVG 컴포넌트)
 * @param {string | null | undefined} teamKey — TEAM_DATA 키 (LG, KT, …)
 * @returns {import("react").ComponentType<{ width?: number, height?: number }> | null}
 */
export function getKboRankCardRabbitIcon(teamKey) {
  if (!teamKey) return null;
  return KBO_RANK_CARD_RABBIT_BY_TEAM[teamKey] ?? null;
}
