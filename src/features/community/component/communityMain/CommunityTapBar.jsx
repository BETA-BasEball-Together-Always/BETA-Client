import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { AppText } from "../../../../shared/theme/components/AppText";
// 다음 버전 알림
// import AlarmIcon from "../../assets/svg/TopBar/alarmIcon.svg";

const CommunityTopBar = ({ isTeam = false, teamName = "" }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.appName, { opacity: isTeam ? 1 : 0 }]}>BETA</Text>

      {isTeam ? (
        <AppText variant="displayTitle2" style={styles.centerTitle}>
          {teamName} 채널
        </AppText>
      ) : (
        <Text style={[styles.centerTitle, styles.appNameCenter]}>BETA</Text>
      )}

      {/* 다음 버전 알림 — 레이아웃 유지용 빈 영역(기존 알림 버튼 폭)
      <TouchableOpacity style={styles.alarmButton} onPress={() => {}}>
        <AlarmIcon width={24} height={24} />
      </TouchableOpacity>
      */}
      <View style={styles.alarmButton} />
    </View>
  );
};

export default CommunityTopBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  appName: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 19,
    lineHeight: 26,
    fontStyle: "italic",
    width: 60,
    opacity: 0,
  },
  centerTitle: {
    color: "#FFF",
    flex: 1,
    textAlign: "center",
  },
  alarmButton: {
    width: 60,
    alignItems: "flex-end",
  },
  appNameCenter: {
    fontSize: 28,
    fontStyle: "italic",
    fontWeight: "800",
    lineHeight: 38,

  },
});
