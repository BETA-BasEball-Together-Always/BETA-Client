import React from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "../../../../../shared/theme/components/AppText";
import { getRelativeTime } from "../utils/relativeTime";

export default function ReplyItem({ reply }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <AppText variant="middle" className="text-white">
              {reply.author.nickName?.[0] ?? "유"}
            </AppText>
          </View>
          <AppText variant="bodyMedium" style={styles.nickname}>
            {reply.author.nickName}
          </AppText>
        </View>
        <AppText variant="numMediumRegular" style={styles.timeText}>
          {getRelativeTime(reply.createdAt)}
        </AppText>
      </View>
      <AppText variant="caption" style={styles.content}>
        {reply.content}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 42,
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
  },
  nickname: {
    color: "#D4D4D4",
    marginLeft: 8,
  },
  timeText: {
    color: "rgba(228, 228, 228, 0.50)",
    marginLeft: 8,
  },
  content: {
    color: "#F9F9F9",
    marginTop: 6,
    marginLeft: 36,
    flex: 1,
  },
});
