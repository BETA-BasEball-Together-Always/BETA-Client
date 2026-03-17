import React from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "../theme/components/AppText";
import { TEAM_DATA } from "../constants/teams";

const UserProfileSummary = ({ user }) => {
  if (!user) return null;

  const { nickname, favoriteTeamCode, favoriteTeamName } = user;
  const teamMeta = favoriteTeamCode ? TEAM_DATA[favoriteTeamCode] : null;
  const ProfileIcon = teamMeta?.ProfileIcon;

  return (
    <View style={styles.container}>
      {/* 프로필 이미지 (구단별 공통 형태) */}
      <View style={styles.avatarWrapper}>
        <View style={styles.teamAvatar}>
          {ProfileIcon && <ProfileIcon height={38} />}
        </View>
      </View>

      {/* 닉네임 + 팀 정보 (가로 배치) */}
      <View style={styles.textArea}>
        <AppText variant="bodyMedium" style={styles.nickname}>
          {nickname}
        </AppText>

        {favoriteTeamName && (
          <View style={styles.teamChip}>
            <AppText variant="labelSmall" style={styles.teamChipText}>
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
    color: "#d504ff",
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
