import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { AppText } from "../../../../shared/theme/components/AppText";
import AlarmIcon from "../../assets/svg/TopBar/alarmIcon.svg";

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

      {/* 나중에 알림 페이지 만들면 여기에 연결할 것! */}
      <TouchableOpacity style={styles.alarmButton} onPress={() => {}}>
        <AlarmIcon width={24} height={24} />
      </TouchableOpacity>
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
  },
});
