import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppText } from "@shared/theme/components/AppText";
import { TEAM_DATA, getFeedProfileIconSize } from "@shared/constants/teams";
import TeamLabel from "@features/community/component/communityMain/TeamLabel";

const SearchUserRow = ({
  user,
  onPress,
  showBio = true,
  avatarSize = 48,
  style,
}) => {
  const team = TEAM_DATA[user?.teamCode];
  const ProfileIcon = team?.ProfileIcon;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      disabled={!onPress}
      onPress={() => onPress?.(user)}
      style={[styles.container, style]}
    >
      <LinearGradient
        colors={team?.gradient?.colors || ["#3A3D44", "#3A3D44"]}
        locations={team?.gradient?.locations}
        start={team?.gradient?.start}
        end={team?.gradient?.end}
        style={[
          styles.avatarCircle,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          },
        ]}
      >
        {ProfileIcon ? (
          <ProfileIcon
            width={getFeedProfileIconSize(user?.teamCode, avatarSize * 0.7)}
            height={getFeedProfileIconSize(user?.teamCode, avatarSize * 0.7)}
          />
        ) : (
          <AppText variant="semi16" style={styles.avatarFallback}>
            {user?.nickname?.[0] ?? "?"}
          </AppText>
        )}
      </LinearGradient>

      <View style={styles.textBlock}>
        <View style={styles.titleRow}>
          <AppText variant="caption" style={styles.nickname}>
            {user?.nickname ?? "알 수 없음"}
          </AppText>
          {user?.teamCode ? <TeamLabel teamCode={user.teamCode} /> : null}
        </View>

        {showBio && user?.bio ? (
          <AppText numberOfLines={2} variant="middle" style={styles.bio}>
            {user.bio}
          </AppText>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default SearchUserRow;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  avatarCircle: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarFallback: {
    color: "#FFFFFF",
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  nickname: {
    color: "#D4D4D4",
    lineHeight: 19,
  },
  bio: {
    color: "#A1A1AA",
    lineHeight: 19,
  },
});
