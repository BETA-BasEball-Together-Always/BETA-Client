import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { AppText } from "../../../../shared/theme/components/AppText";
import { TEAM_DATA } from "../../../../shared/constants/teams";

const TeamLabel = ({ teamCode }) => {
  const team = TEAM_DATA[teamCode];
  if (!team) return null;

  const { label, labelStyle } = team;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: labelStyle?.backgroundColor ?? "rgba(60,60,60,0.5)",
        },
        Platform.OS === "ios" ? styles.shadowIOS : styles.shadowAndroid,
      ]}
    >
      <AppText
        variant="smallRegular"
        style={[styles.text, { color: labelStyle?.color ?? "#CCC" }]}
      >
        {label}
      </AppText>
    </View>
  );
};

export default TeamLabel;

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    lineHeight: 16,
  },
  shadowIOS: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  shadowAndroid: {
    elevation: 3,
  },
});
