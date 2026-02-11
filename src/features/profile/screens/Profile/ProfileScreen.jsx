import { Image, StyleSheet, View, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../../../../shared/theme/components/AppText";
import SettingsIcon from "../../assets/svg/Settings.svg";

const mockUser = {
  nickname: "김야구",
  teamName: "LG 트윈스",
  teamColor: "#C30452",
  teamLogo: require("../../assets/png/ProfileLG.png"),
};

const ProfileScreen = ({ navigation }) => {
  const handlePressSetting = () => {
    navigation.navigate("ProfileSetting");
  };
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <AppText variant="displayTitle2" className="text-white">
          마이스타디움
        </AppText>
        <TouchableOpacity onPress={handlePressSetting} activeOpacity={0.7}>
          <SettingsIcon
            width={24}
            height={24}
            color="#FFFFFF"
            stroke="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.userProfile}>
        <Image source={mockUser.teamLogo} style={styles.teamImage} />
        <View style={styles.userInfoContainer}>
          <View style={styles.userNameContainer}>
            <AppText variant="heading" className="text-white">
              {mockUser.nickname}
            </AppText>
            <AppText
              variant="bodyRegular"
              className="text-white"
              style={{ color: mockUser.teamColor }}
            >
              {mockUser.teamName} 팬
            </AppText>
          </View>
          <AppText
            variant="middle"
            className="text-white"
            style={styles.bioText}
          >
            한 줄 소개를 작성해 보세요 :)
          </AppText>
        </View>
      </View>

      <View style={styles.tabDivider} />

      <View style={styles.tabContainer}>
        {[
          { key: "feed", label: "내 피드" },
          { key: "like", label: "좋아요" },
          { key: "comment", label: "댓글" },
        ].map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <AppText variant="semi14" className="text-white">
                {tab.label}
              </AppText>

              {isActive && <View style={styles.activeUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.contentContainer}>
        {/* 컴포넌트 추가할 것 */}
        {/* {activeTab === "feed" && <FeedComponent />}
        {activeTab === "like" && <LikeComponent />}
        {activeTab === "comment" && <CommentComponent />} */}
        {activeTab === "feed" && (
          <AppText className="text-white">내 피드 목록</AppText>
        )}
        {activeTab === "like" && (
          <AppText className="text-white">내 좋아요 목록</AppText>
        )}
        {activeTab === "comment" && (
          <AppText className="text-white">내 댓글 목록</AppText>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  userProfile: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 35,
    marginTop: 12,
  },
  teamImage: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  userInfoContainer: {
    marginLeft: 16,
    justifyContent: "center",
  },
  userNameContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  bioText: {
    color: "#E4E4E480",
    marginTop: 8,
  },
  tabDivider: {
    height: 1,
    backgroundColor: "#383838",
    marginTop: 50,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 45,
    alignItems: "center",
    marginVertical: 13,
    marginHorizontal: 45,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 15,
  },
  activeUnderline: {
    position: "absolute",
    bottom: 0,
    height: 2,
    width: 78,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
    alignSelf: "center",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    // marginTop: -15,
  },
});
