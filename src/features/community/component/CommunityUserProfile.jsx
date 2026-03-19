import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppText } from "../../../shared/theme/components/AppText";
import { TEAM_DATA } from "../../../shared/constants/teams";
import { getRelativeTime } from "../screens/PostDetail/utils/relativeTime";

const CommunityUserProfile = ({ nickname, teamCode, createdAt, size = 38 }) => {
  const team = teamCode ? TEAM_DATA[teamCode] : null;
  const ProfileIcon = team?.ProfileIcon;
  const timeLabel = createdAt ? getRelativeTime(createdAt) : "";

  return (
    <View style={styles.authorRow}>
      <LinearGradient
        colors={team?.gradient?.colors || ["#3A3D44", "#3A3D44"]}
        locations={team?.gradient?.locations}
        start={team?.gradient?.start}
        end={team?.gradient?.end}
        style={[
          styles.avatarCircle,
          { width: size, height: size, borderRadius: size },
        ]}
      >
        {ProfileIcon ? (
          <ProfileIcon width={size * 0.74} height={size * 0.74} />
        ) : (
          <AppText style={styles.avatarInitial}>
            {(nickname?.trim()?.[0] ?? "유").toUpperCase()}
          </AppText>
        )}
      </LinearGradient>

      <View style={styles.textColumn}>
        <AppText variant="caption" style={styles.nickname}>
          {nickname}
        </AppText>
        {!!timeLabel && (
          <AppText variant="numMediumRegular" style={styles.timeText}>
            {timeLabel}
          </AppText>
        )}
      </View>
    </View>
  );
};

export default CommunityUserProfile;

const styles = StyleSheet.create({
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginRight: 10,
  },
  avatarInitial: {
    color: "#FFF",
  },
  textColumn: {
    justifyContent: "center",
  },
  nickname: {
    color: "#F9F9F9",
  },
  timeText: {
    marginTop: 2,
    color: "rgba(228, 228, 228, 0.50)",
  },
});
