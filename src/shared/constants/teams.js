// 사용자 프로필용 구단 이미지
import LG_Profile from "../assets/svg/profile/LG_profile.svg";
import Hanhwa_Profile from "../assets/svg/profile/Hanhwa_profile.svg";
import Doosan_Profile from "../assets/svg/profile/Doosan_profile.svg";
import Kia_Profile from "../assets/svg/profile/Kia_profile.svg";
import Kiwoom_Profile from "../assets/svg/profile/Kiwoom_profile.svg";
import KT_Profile from "../assets/svg/profile/KT_profile.svg";
import Lotte_Profile from "../assets/svg/profile/Lotte_Profile.svg";
import NC_Profile from "../assets/svg/profile/NC_profile.svg";
import Samsung_Profile from "../assets/svg/profile/Samsung_profile.svg";
import SSG_Profile from "../assets/svg/profile/SSG_profile.svg";

// team 선택용 이미지
import LG from "../assets/svg/teams/LG.svg";
import DOOSAN from "../assets/svg/teams/Doosan.svg";
import Hanhwa from "../assets/svg/teams/Hanhwa.svg";
import KIA from "../assets/svg/teams/KIA.svg";
import KIWOOM from "../assets/svg/teams/Kiwoom.svg";
import KT from "../assets/svg/teams/KT.svg";
import LOTTE from "../assets/svg/teams/Lotte.svg";
import NC from "../assets/svg/teams/NC.svg";
import SAMSUNG from "../assets/svg/teams/Samsung.svg";
import SSG from "../assets/svg/teams/SSG.svg";

export const TEAM_DATA = {
  LG: {
    label: "LG 트윈스",
    MainIcon: LG,
    ProfileIcon: LG_Profile,
  },
  Hanhwa: {
    label: "한화 이글스",
    MainIcon: Hanhwa,
    ProfileIcon: Hanhwa_Profile,
  },
  SSG: {
    label: "SSG 랜더스",
    MainIcon: SSG,
    ProfileIcon: SSG_Profile,
  },
  NC: {
    label: "NC 다이노스",
    MainIcon: NC,
    ProfileIcon: NC_Profile,
  },
  KT: {
    label: "KT 위즈",
    MainIcon: KT,
    ProfileIcon: KT_Profile,
  },
  LOTTE: {
    label: "롯데 자이언츠",
    MainIcon: LOTTE,
    ProfileIcon: Lotte_Profile,
  },
  KIWOOM: {
    label: "키움 히어로즈",
    MainIcon: KIWOOM,
    ProfileIcon: Kiwoom_Profile,
  },
  DOOSAN: {
    label: "두산 베어스",
    MainIcon: DOOSAN,
    ProfileIcon: Doosan_Profile,
  },
  KIA: {
    label: "기아 타이거즈",
    MainIcon: KIA,
    ProfileIcon: Kia_Profile,
  },
  SAMSUNG: {
    label: "삼성 라이온즈",
    MainIcon: SAMSUNG,
    ProfileIcon: Samsung_Profile,
  },
};

// 배열 형태의 팀 리스트!
export const TEAM_LIST = Object.entries(TEAM_DATA).map(([key, value]) => ({
  key,
  ...value,
}));
