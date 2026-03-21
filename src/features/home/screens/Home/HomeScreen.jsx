import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import React from "react";
import AlarmIcon from "../../../community/assets/svg/TopBar/alarmIcon.svg";
import { AppText } from "../../../../shared/theme/components/AppText";
import { useNavigation } from "@react-navigation/native";

import AllCommunityBackground from "../../../community/assets/svg/AllCommunityBackground/all_background.svg";
import Banner from "../../assets/png/banner.png";
import { useUserStore } from "../../../../shared/store/userStore";
import PopularPostCard from "./component/PopularPostCard";

import { useMyLikedPostsInfiniteQuery } from "../../../profile/hooks/useMypagePosts";
import useHomePopularFeed from "../../hooks/useHomePopularFeed";

const HomeScreen = () => {
  const user = useUserStore((state) => state.user);
  const navigation = useNavigation();

  // 홈의 PopularPostCard에서도 heart fill 복원을 위해 liked 목록을 hydrate
  useMyLikedPostsInfiniteQuery({
    enabled: !!user,
    hydrateSelection: true,
  });

  const {
    dailyPopular,
    refetch,
    isLoading: popularLoading,
    isError: popularError,
    isFetchingNextPage,
  } = useHomePopularFeed();

  const popularBusy =
    !popularError &&
    dailyPopular.length === 0 &&
    (popularLoading || isFetchingNextPage);
  const popularEmpty =
    !popularError &&
    !popularLoading &&
    !isFetchingNextPage &&
    dailyPopular.length === 0;

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
              navigation.navigate({
                name: "AllCommunity",
                params: { initialSort: "popular" },
                merge: true,
              })
            }
          >
            <AppText variant="middle" className="text-[#D4D4D4]">
              더보기
            </AppText>
          </TouchableOpacity>
        </View>

        {popularError ? (
          <View style={styles.popularFallback}>
            <AppText variant="caption" style={styles.popularFallbackText}>
              피드를 불러올 수 없습니다
            </AppText>
            <TouchableOpacity
              onPress={() => refetch()}
              style={styles.popularRetry}
              accessibilityRole="button"
            >
              <AppText variant="middle" style={styles.popularRetryLabel}>
                다시 시도
              </AppText>
            </TouchableOpacity>
          </View>
        ) : popularBusy ? (
          <View style={styles.popularLoading}>
            <ActivityIndicator color="#F9F9F9" />
          </View>
        ) : popularEmpty ? (
          <View style={styles.popularEmpty}>
            <AppText variant="caption" style={styles.popularEmptyText}>
              아직 인기 게시물이 없어요
            </AppText>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {dailyPopular.map((post) => (
              <PopularPostCard key={String(post.postId)} post={post} />
            ))}
          </ScrollView>
        )}
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
  popularLoading: {
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  popularEmpty: {
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  popularEmptyText: {
    color: "rgba(249, 249, 249, 0.65)",
  },
  popularFallback: {
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  popularFallbackText: {
    color: "rgba(249, 249, 249, 0.75)",
  },
  popularRetry: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  popularRetryLabel: {
    color: "#F9F9F9",
  },
});
