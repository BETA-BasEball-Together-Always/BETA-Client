import LG from "../assets/svg/teams/LG.svg";
import DOOSAN from "../assets/svg/teams/Doosan.svg";
import HANWHA from "../assets/svg/teams/Hanhwa.svg";
import KIA from "../assets/svg/teams/KIA.svg";
import KIWOOM from "../assets/svg/teams/Kiwoom.svg";
import KT from "../assets/svg/teams/KT.svg";
import LOTTE from "../assets/svg/teams/Lotte.svg";
import NC from "../assets/svg/teams/NC.svg";
import SAMSUNG from "../assets/svg/teams/Samsung.svg";
import SSG from "../assets/svg/teams/SSG.svg";

import PROFILE_DOOSAN from "../assets/svg/profile/profileDoosan.svg";
import PROFILE_HANWHA from "../assets/svg/profile/profileHanhwa.svg";
import PROFILE_KIA from "../assets/svg/profile/profileKia.svg";
import PROFILE_KIWOOM from "../assets/svg/profile/profileKiwoom.svg";
import PROFILE_KT from "../assets/svg/profile/profileKT.svg";
import PROFILE_LG from "../assets/svg/profile/profileLG.svg";
import PROFILE_LOTTE from "../assets/svg/profile/profileLotte.svg";
import PROFILE_NC from "../assets/svg/profile/profileNC.svg";
import PROFILE_SAMSUNG from "../assets/svg/profile/profileSamsung.svg";
import PROFILE_SSG from "../assets/svg/profile/profileSSG.svg";

/**
 * 가입 구단 선택/야구네컷 팀 카드 등에서만 사용(생략 시 1)
 * 동일 박스 안 시각적 크기를 맞추기 위해 1 미만(축소)/1 초과(확대) 모두 가능!!
 */
export const TEAM_DATA = {
  KT: {
    label: "KT위즈",
    MainIcon: KT,
    ProfileIcon: PROFILE_KT,
    mainLogoScale: 0.62,
    gradient: {
      colors: ["#4A4A4A", "#2A2A2A", "#141414", "#050505"],
      locations: [0, 0.3, 0.65, 1],
      start: { x: 0.1, y: 0.1 },
      end: { x: 1, y: 1 },
    },
    labelStyle: {
      color: "#F0F0F0",
      backgroundColor: "rgba(53, 53, 53, 0.80)",
    },
  },
  LG: {
    label: "LG 트윈스",
    MainIcon: LG,
    ProfileIcon: PROFILE_LG,
    gradient: {
      colors: ["#231F20", "#B0293C", "#EA465D", "#FF866A", "#FFB5C0"],
      locations: [0, 0.5, 0.8, 1, 1],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    labelStyle: {
      color: "#BB263B",
      backgroundColor: "rgba(176, 41, 60, 0.17)",
    },
  },

  SAMSUNG: {
    label: "삼성라이온즈",
    MainIcon: SAMSUNG,
    ProfileIcon: PROFILE_SAMSUNG,
    // mainLogoScale: 0.6,
    gradient: {
      colors: ["#7ABFFF", "#1A6FCC", "#003A80", "#001A40"],
      locations: [0, 0.3, 0.65, 1],
      start: { x: 0.1, y: 0.1 },
      end: { x: 1, y: 1 },
    },
    labelStyle: {
      color: "#E3E3E3",
      backgroundColor: "rgba(26, 156, 255, 0.55)",
    },
  },
  KIA: {
    label: "KIA타이거즈",
    MainIcon: KIA,
    ProfileIcon: PROFILE_KIA,
    mainLogoScale: 0.7,
    gradient: {
      colors: ["#FF5050", "#CC1020", "#7A0010", "#380005"],
      locations: [0, 0.35, 0.7, 1],
      start: { x: 0.1, y: 0.1 },
      end: { x: 1, y: 1 },
    },
    labelStyle: {
      color: "rgba(255, 53, 53, 0.80)",
      backgroundColor: "rgba(18, 18, 18, 0.80)",
    },
  },
  DOOSAN: {
    label: "두산베어스",
    MainIcon: DOOSAN,
    ProfileIcon: PROFILE_DOOSAN,
    gradient: {
      colors: ["#4B6FA5", "#1A2E6E", "#0A1540", "#05091F"],
      locations: [0, 0.3, 0.65, 1],
      start: { x: 0.1, y: 0.1 },
      end: { x: 1, y: 1 },
    },
    labelStyle: {
      color: "#E8345E",
      backgroundColor: "rgba(27, 39, 117, 0.44)",
    },
  },
  HANWHA: {
    label: "한화이글스",
    MainIcon: HANWHA,
    ProfileIcon: PROFILE_HANWHA,
    gradient: {
      colors: ["#FFAA50", "#E85C00", "#C24B00", "#7A2800"],
      locations: [0, 0.3, 0.65, 1],
      start: { x: 0.1, y: 0.1 },
      end: { x: 1, y: 1 },
    },
    labelStyle: {
      color: "#E95C28",
      backgroundColor: "rgba(255, 128, 82, 0.26)",
    },
  },
  KIWOOM: {
    label: "키움히어로즈",
    MainIcon: KIWOOM,
    ProfileIcon: PROFILE_KIWOOM,
    mainLogoScale: 1.1,
    gradient: {
      colors: ["#C03050", "#8C1A2E", "#4A0818", "#1A0008"],
      locations: [0, 0.35, 0.7, 1],
      start: { x: 0.1, y: 0.1 },
      end: { x: 1, y: 1 },
    },
    labelStyle: {
      color: "#A8485E",
      backgroundColor: "rgba(79, 10, 26, 0.47)",
    },
  },
  LOTTE: {
    label: "롯데자이언츠",
    MainIcon: LOTTE,
    ProfileIcon: PROFILE_LOTTE,
    mainLogoScale: 1.1,
    gradient: {
      colors: ["#C05070", "#8B1A35", "#4A0D1C", "#1A0008"],
      locations: [0, 0.35, 0.7, 1],
      start: { x: 0.1, y: 0.1 },
      end: { x: 1, y: 1 },
    },
    labelStyle: {
      color: "rgba(211, 31, 69, 0.86)",
      backgroundColor: "rgba(3, 35, 69, 0.81)",
    },
  },
  NC: {
    label: "NC다이노스",
    MainIcon: NC,
    ProfileIcon: PROFILE_NC,
    mainLogoScale: 0.62,
    gradient: {
      colors: ["#5A8FCC", "#1A3B6E", "#0D1F3C", "#060F1E"],
      locations: [0, 0.35, 0.7, 1],
      start: { x: 0.1, y: 0.1 },
      end: { x: 1, y: 1 },
    },
    labelStyle: {
      color: "#947465",
      backgroundColor: "rgba(40, 69, 121, 0.70)",
    },
  },
  SSG: {
    label: "SSG랜더스",
    MainIcon: SSG,
    ProfileIcon: PROFILE_SSG,
    mainLogoScale: 1.08,
    gradient: {
      colors: ["#FF7A3D", "#D42B2B", "#8B0000", "#5A0000"],
      locations: [0, 0.35, 0.7, 1],
      start: { x: 0.1, y: 0.1 },
      end: { x: 1, y: 1 },
    },
    labelStyle: {
      color: "rgba(247, 181, 41, 0.91)",
      backgroundColor: "rgba(238, 45, 61, 0.53)",
    },
  },
};

export function getFeedProfileIconSize(teamCode, baseSize) {
  if (teamCode === "LG" || teamCode === "KT") {
    return baseSize * 0.82;
  }
  return baseSize;
}

// 배열 형태의 팀 리스트!
export const TEAM_LIST = Object.entries(TEAM_DATA).map(([key, value]) => ({
  key,
  ...value,
}));
