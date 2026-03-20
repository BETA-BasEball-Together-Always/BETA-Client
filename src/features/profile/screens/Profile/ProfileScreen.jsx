import { Image, StyleSheet, View, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../../../../shared/theme/components/AppText";
import SettingsIcon from "../../assets/svg/Settings.svg";
import FeedTabContent from "./components/FeedTabContent";
import EmptyState from "./components/EmptyState";

const mockUser = {
  nickname: "김야구",
  teamName: "LG 트윈스",
  teamColor: "#C30452",
  teamLogo: require("../../assets/png/ProfileLG.png"),
};

const mockData = {
  feed: [],
  like: [],
  comment: [],
};

const ProfileScreen = ({ navigation }) => {
  const handlePressSetting = () => {
    navigation.navigate("ProfileSetting");
  };
  const [activeTab, setActiveTab] = useState("feed");

  const renderTabContent = () => {
    switch (activeTab) {
      case "feed":
        return mockData.feed.length > 0 ? (
          <FeedTabContent posts={mockData.feed} />
        ) : (
          <EmptyState message="작성된 게시물이 없습니다" />
        );
      case "like":
        return mockData.like.length > 0 ? (
          <FeedTabContent posts={mockData.like} />
        ) : (
          <EmptyState message="좋아요를 남긴 게시물이 없습니다" />
        );

      case "comment":
        return mockData.comment.length > 0 ? (
          <FeedTabContent posts={mockData.comment} />
        ) : (
          <EmptyState message="댓글을 남긴 게시물이 없습니다" />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <AppText
          variant="displayTitle2"
          className="text-white"
          style={{ lineHeight: 29 }}
        >
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
          <AppText
            variant="heading"
            className="text-white"
            style={{ lineHeight: 24.5 }}
          >
            {mockUser.nickname}
          </AppText>
          <AppText
            variant="middle"
            className="text-white"
            style={styles.bioText}
          >
            한 줄 소개를 작성해 보세요 :)
          </AppText>
        </View>
      </View>

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
              <AppText
                variant="semi14"
                className="text-white"
                style={{ lineHeight: 19 }}
              >
                {tab.label}
              </AppText>

              {isActive && <View style={styles.activeUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.contentContainer}>{renderTabContent()}</View>
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
    height: 89,
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
    marginTop: 7,
    lineHeight: 17.7,
  },
  tabContainer: {
    flexDirection: "row",
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
    zIndex: 10,
  },
  contentContainer: {
    flex: 1,
  },
});
