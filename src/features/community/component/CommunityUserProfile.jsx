// import React from "react";
// import { View, StyleSheet } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { AppText } from "../../../shared/theme/components/AppText";
// import { TEAM_DATA } from "../../../shared/constants/teams";
// import { getRelativeTime } from "../screens/PostDetail/utils/relativeTime";
// import TeamLabel from "./communityMain/TeamLabel";

// const CommunityUserProfile = ({
//   nickname,
//   teamCode,
//   createdAt,
//   size = 38,
//   showTeam = false,
// }) => {
//   const team = teamCode ? TEAM_DATA[teamCode] : null;
//   const ProfileIcon = team?.ProfileIcon;
//   const timeLabel = createdAt ? getRelativeTime(createdAt) : "";

//   return (
//     <View style={styles.authorRow}>
//       <LinearGradient
//         colors={team?.gradient?.colors || ["#3A3D44", "#3A3D44"]}
//         locations={team?.gradient?.locations}
//         start={team?.gradient?.start}
//         end={team?.gradient?.end}
//         style={[
//           styles.avatarCircle,
//           { width: size, height: size, borderRadius: size },
//         ]}
//       >
//         {ProfileIcon ? (
//           <ProfileIcon width={size * 0.74} height={size * 0.74} />
//         ) : (
//           <AppText style={styles.avatarInitial}>
//             {(nickname?.trim()?.[0] ?? "유").toUpperCase()}
//           </AppText>
//         )}
//       </LinearGradient>

//       <View style={styles.textColumn}>
//         <View style={styles.nameRow}>
//           <AppText variant="caption" style={styles.nickname}>
//             {nickname}
//           </AppText>
//           {showTeam && team?.name && <TeamLabel teamCode={teamCode} />}
//         </View>

//         {!!timeLabel && (
//           <AppText variant="numMediumRegular" style={styles.timeText}>
//             {timeLabel}
//           </AppText>
//         )}
//       </View>
//     </View>
//   );
// };

// export default CommunityUserProfile;

// const styles = StyleSheet.create({
//   authorRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   avatarCircle: {
//     justifyContent: "center",
//     alignItems: "center",
//     overflow: "hidden",
//     marginRight: 10,
//   },
//   avatarInitial: {
//     color: "#FFF",
//   },
//   textColumn: {
//     justifyContent: "center",
//   },
//   nickname: {
//     color: "#F9F9F9",
//   },
//   timeText: {
//     color: "rgba(228, 228, 228, 0.50)",
//   },
// });
import React from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "../../../shared/theme/components/AppText";
import { LinearGradient } from "expo-linear-gradient";
import { TEAM_DATA } from "../../../shared/constants/teams";
import TeamLabel from "./communityMain/TeamLabel";
import { getRelativeTime } from "../screens/PostDetail/utils/relativeTime"; // 네가 만든거

const CommunityUserProfile = ({
  nickname,
  teamCode,
  createdAt,
  showTeam = false,
}) => {
  const team = TEAM_DATA[teamCode];
  const ProfileIcon = team?.ProfileIcon;

  return (
    <View style={styles.container}>
      {/* 프로필 */}
      <LinearGradient
        colors={team?.gradient?.colors || ["#3A3D44", "#3A3D44"]}
        locations={team?.gradient?.locations}
        start={team?.gradient?.start}
        end={team?.gradient?.end}
        style={styles.avatarCircle}
      >
        {ProfileIcon ? (
          <ProfileIcon width={28} height={28} />
        ) : (
          <AppText style={{ color: "#FFF" }}>{nickname?.[0]}</AppText>
        )}
      </LinearGradient>

      {/* 텍스트 영역 */}
      <View style={styles.textWrapper}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <AppText variant="caption" style={styles.nickname}>
            {nickname}
          </AppText>

          {showTeam && teamCode && <TeamLabel teamCode={teamCode} />}
        </View>

        {createdAt && (
          <AppText style={styles.timeAgo}>{getRelativeTime(createdAt)}</AppText>
        )}
      </View>
    </View>
  );
};

export default CommunityUserProfile;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  textWrapper: {
    justifyContent: "center",
  },
  nickname: {
    color: "#D4D4D4",
    marginRight: 4,
  },
  timeAgo: {
    color: "#A1A1AA",
    fontSize: 11,
    marginTop: 2,
  },
});
