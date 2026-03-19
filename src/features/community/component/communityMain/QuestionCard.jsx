import React from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "../../../../shared/theme/components/AppText";
import { TEAM_DATA } from "../../../../shared/constants/teams";

import { LinearGradient } from "expo-linear-gradient";

const QuestionCard = ({ user }) => {
  if (!user) return null;

  const { nickname, favoriteTeamCode } = user;

  const team = TEAM_DATA[favoriteTeamCode];
  const ProfileIcon = team?.ProfileIcon;

  return (
    <View style={styles.questionCard}>
      <LinearGradient
        colors={team?.gradient?.colors || ["#3A3D44", "#3A3D44"]}
        locations={team?.gradient?.locations}
        start={team.gradient.start}
        end={team.gradient.end}
        style={styles.avatarCircle}
      >
        {ProfileIcon ? (
          <ProfileIcon width={28} height={28} />
        ) : (
          <AppText style={{ color: "#FFF" }}>{nickname?.[0]}</AppText>
        )}
      </LinearGradient>

      <View style={{ marginLeft: 12 }}>
        <AppText variant="semi13" style={{ color: "#FFF" }}>
          {nickname}
        </AppText>

        <AppText variant="caption" style={styles.questionSubtitle}>
          오늘은 어떤 마음으로 응원하고 계신가요?
        </AppText>
      </View>
    </View>
  );
};

export default QuestionCard;

const styles = StyleSheet.create({
  questionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(63, 63, 63, 0.30)",
    borderRadius: 5,
    borderColor: "rgba(127, 127, 127, 0.28)",
    borderWidth: 1,
    marginVertical: 12,
    paddingVertical: 17,
    paddingHorizontal: 13,

    shadowColor: "#2E2E2E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  questionSubtitle: {
    color: "#9CA3AF",
    marginTop: 4,
  },
});
