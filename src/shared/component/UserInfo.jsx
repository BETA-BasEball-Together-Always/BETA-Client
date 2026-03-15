import React from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "../theme/components/AppText";

const UserInfo = ({ user, channel }) => {
  const nickname = user?.nickname ?? "사용자";

  // 목업 팀
  const teamName = "LG";

  return (
    <View style={styles.container}>
      <View style={styles.avatarCircle}>
        <AppText variant="semi13" style={{ color: "#FFF" }}>
          {nickname[0]}
        </AppText>
      </View>

      <View style={styles.nameRow}>
        <View style={styles.nicknameRow}>
          <AppText variant="semi13" style={styles.nickname}>
            {nickname}
          </AppText>

          {channel === "TEAM" && (
            <View style={styles.teamBadge}>
              <AppText variant="caption" style={styles.teamText}>
                {teamName}
              </AppText>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default UserInfo;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3A3D44",
    justifyContent: "center",
    alignItems: "center",
  },
  nameRow: {
    marginLeft: 12,
  },
  nicknameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  nickname: {
    color: "#FFF",
  },

  teamBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#E11D48",
    borderRadius: 4,
  },

  teamText: {
    color: "#FFF",
  },
});
