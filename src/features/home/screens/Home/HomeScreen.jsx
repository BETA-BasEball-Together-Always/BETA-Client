import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ImageBackground,
} from "react-native";
import React from "react";
import AlarmIcon from "../../../community/assets/svg/TopBar/alarmIcon.svg";
import { AppText } from "../../../../shared/theme/components/AppText";
import { useNavigation } from "@react-navigation/native";

import AllCommunityBackground from "../../../community/assets/svg/AllCommunityBackground/all_background.svg";
import Banner from "../../assets/png/banner.png";
import { useUserStore } from "../../../../shared/store/userStore";
import PopularPostCard from "./component/PopularPostCard";

import useCommunityPosts from "../../../community/hooks/useCommunityPosts";

const HomeScreen = () => {
  const user = useUserStore((state) => state.user);
  const navigation = useNavigation();

  const { posts: allPosts } = useCommunityPosts({
    channel: user?.favoriteTeamCode || "ALL",
    sort: "popular",
  });

  const popularPosts = allPosts?.slice(0, 5) || [];

  return (
    <SafeAreaView style={styles.container}>
      <AllCommunityBackground
        width="100%"
        height="100%"
        preserveAspectRatio="xxMidYMid slice"
        style={styles.bgSvg}
      />
      <View style={styles.bgOverlay} />

      <View style={styles.topBar}>
        <Text style={styles.appName}>BETA</Text>

        {/* 나중에 알림 페이지 만들면 여기에 연결할 것! */}
        <TouchableOpacity style={styles.alarmButton} onPress={() => {}}>
          <AlarmIcon width={24} height={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AppText variant="displayTitle" style={styles.header}>
          {user?.nickname} 님
        </AppText>
        <AppText variant="heading" style={styles.subText}>
          오늘도 BETA와 함께 응원해봐요 🔥
        </AppText>

        <View style={styles.bannerWrapper}>
          <ImageBackground
            source={Banner}
            style={styles.bannerImage}
            imageStyle={{ borderRadius: 10 }}
          >
            <TouchableOpacity
              style={styles.bannerButton}
              onPress={() => navigation.navigate("PhotoBooth")}
            >
              <Text style={styles.bannerButtonText}>직관 추억 남기기</Text>
            </TouchableOpacity>
          </ImageBackground>
        </View>

        <View style={styles.popularHeader}>
          <AppText variant="semi18" style={styles.popularHeading}>
            인기 피드 ✨️
          </AppText>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("AllCommunity", { initialSort: "popular" })
            }
          >
            <AppText variant="middle" className="text-[#D4D4D4]">
              더보기
            </AppText>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {popularPosts.slice(0, 5).map((post) => (
            <PopularPostCard
              key={post.postId}
              post={post}
              onPress={() =>
                navigation.navigate("AllCommunity", {
                  initialSort: "popular",
                  initialPostId: post.postId,
                })
              }
            />
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
  },
  bgSvg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bgOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(2, 4, 8, 0.25)",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  appName: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 28.606,
    fontStyle: "italic",
  },
  alarmButton: {
    alignItems: "flex-end",
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    color: "#F9F9F9",
    marginTop: 17,
    lineHeight: 32.7,
  },
  subText: {
    color: "#F9F9F9",
    lineHeight: 24.5,
    marginTop: 13,
  },

  //배너
  bannerWrapper: {
    marginTop: 30,
    alignItems: "center",
  },
  bannerImage: {
    width: "100%",
    height: 155,
    justifyContent: "flex-end",
    paddingBottom: 11,
  },
  bannerButton: {
    backgroundColor: "#FFF",
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 17,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  bannerButtonText: {
    color: "#373737",
    fontSize: 14,
    fontWeight: "800",
    fontStyle: "italic",
  },

  popularHeader: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 45,
    marginBlock: 7,
  },
  popularHeading: {
    color: "#F9F9F9",
  },
});
