import React from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "../theme/components/AppText";
import { TEAM_DATA } from "../constants/teams";

// 팀별 배경/텍스트 컬러 매핑
const TEAM_CHIP_STYLES = {
  Hanhwa: {
    textColor: "#E95C28",
    backgroundColor: "rgba(233, 92, 40, 0.17)",
  },
  KT: {
    textColor: "#D5D5D5",
    backgroundColor: "rgba(36, 36, 36, 0.80)",
  },
  NC: {
    textColor: "#947465",
    backgroundColor: "rgba(40, 69, 121, 0.70)",
  },
  KIA: {
    textColor: "rgba(221, 27, 30, 0.81)",
    backgroundColor: "rgba(3, 3, 3, 0.58)",
  },
  LG: {
    textColor: "rgba(255, 247, 248, 0.80)",
    backgroundColor: "rgba(176, 41, 60, 0.56)",
  },
  LOTTE: {
    textColor: "rgba(211, 31, 69, 0.86)",
    backgroundColor: "rgba(3, 35, 69, 0.81)",
  },
  SSG: {
    textColor: "rgba(247, 181, 41, 0.91)",
    backgroundColor: "rgba(238, 45, 61, 0.53)",
  },
  KIWOOM: {
    textColor: "#A8485E",
    backgroundColor: "rgba(79, 10, 26, 0.47)",
  },
  DOOSAN: {
    textColor: "#E8345E",
    backgroundColor: "rgba(27, 39, 117, 0.44)",
  },
  SAMSUNG: {
    textColor: "#E3E3E3",
    backgroundColor: "rgba(0, 101, 178, 0.29)",
  },
};

const UserProfileSummary = ({ user }) => {
  if (!user) return null;

  const { nickname, favoriteTeamCode, favoriteTeamName } = user;
  const teamMeta = favoriteTeamCode ? TEAM_DATA[favoriteTeamCode] : null;
  const ProfileIcon = teamMeta?.ProfileIcon;

  const chipStyle =
    favoriteTeamCode && TEAM_CHIP_STYLES[favoriteTeamCode]
      ? TEAM_CHIP_STYLES[favoriteTeamCode]
      : null;

  return (
    <View style={styles.container}>
      {/* 프로필 이미지 (구단별 공통 형태) */}
      <View style={styles.avatarWrapper}>
        <View style={styles.teamAvatar}>
          {ProfileIcon && <ProfileIcon height={50} />}
        </View>
      </View>

      {/* 닉네임 + 팀 정보 (가로 배치) */}
      <View style={styles.textArea}>
        <AppText variant="bodyMedium" style={styles.nickname}>
          {nickname}
        </AppText>

        {favoriteTeamName && (
          <View
            style={[
              styles.teamChip,
              chipStyle && { backgroundColor: chipStyle.backgroundColor },
            ]}
          >
            <AppText
              variant="labelSmall"
              style={[
                styles.teamChipText,
                chipStyle && { color: chipStyle.textColor },
              ]}
            >
              {favoriteTeamName}
            </AppText>
          </View>
        )}
      </View>
    </View>
  );
};

export default UserProfileSummary;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrapper: {
    width: 44,
    height: 44,
  },
  teamAvatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    // backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    // padding: 4,
  },
  initialAvatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  initialText: {
    color: "#111111",
  },
  textArea: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  nickname: {
    color: "#F9F9F9",
  },
  teamChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgb(238, 0, 255)",
  },
  teamChipText: {
    color: "#FFFFFF",
  },
});
