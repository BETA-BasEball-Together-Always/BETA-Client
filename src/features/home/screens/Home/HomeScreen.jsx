import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useMemo } from "react";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { useNetInfo } from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
// 다음 버전 알림
// import AlarmIcon from "../../../community/assets/svg/TopBar/alarmIcon.svg";
import SearchIcon from "../../../community/assets/svg/TopBar/searchIcon.svg";
import { AppText } from "../../../../shared/theme/components/AppText";

import AllCommunityBackgroundLayer from "../../../community/component/AllCommunityBackgroundLayer";
import Banner from "../../assets/png/banner.png";
import { useUserStore } from "../../../../shared/store/userStore";
import PopularPostCard from "./component/PopularPostCard";
import KboRankCard from "./component/KboRankCard";

import { useMyLikedPostsInfiniteQuery } from "../../../profile/hooks/useMypagePosts";
import useHomeQuery from "../../hooks/useHomeQuery";
import FetchStateView from "../../../../shared/components/FetchStateView";
import { homeKeys } from "../../services/homeKeys";

const HOME_REFETCH_MS = 45 * 1000;

const HomeScreen = () => {
  const user = useUserStore((state) => state.user);
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const isFocused = useIsFocused();
  const netInfo = useNetInfo();
  const isOffline =
    netInfo.isConnected === false || netInfo.isInternetReachable === false;

  const year = useMemo(() => new Date().getFullYear(), []);

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: homeKeys.all });
      queryClient.invalidateQueries({ queryKey: ["community"] });
    }, [queryClient]),
  );

  const {
    data: homeData,
    isPending: isHomePending,
    isError: isHomeError,
    isFetching: isHomeFetching,
    refetch: refetchHome,
  } = useHomeQuery({
    enabled: !!user && !isOffline,
    refetchInterval: isFocused && !isOffline ? HOME_REFETCH_MS : false,
  });

  const allTeamRankings = useMemo(() => {
    const list = homeData?.teamRankings;
    return Array.isArray(list) ? list : [];
  }, [homeData?.teamRankings]);

  const popularPosts = useMemo(() => {
    const list = homeData?.popularPosts;
    return Array.isArray(list) ? list : [];
  }, [homeData?.popularPosts]);

  useMyLikedPostsInfiniteQuery({
    enabled: !!user,
    hydrateSelection: true,
  });

  const showPopularEmptyMessage =
    !isHomeError && !isHomePending && popularPosts.length === 0;

  const shouldShowHomeError = isOffline || isHomeError;

  const homeBody =
    isHomePending || shouldShowHomeError ? null : (
      <>
        <KboRankCard
          year={year}
          rows={allTeamRankings}
          favoriteTeamCode={user?.favoriteTeamCode ?? null}
        />

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

        {popularPosts.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {popularPosts.map((post) => (
              <PopularPostCard key={String(post.postId)} post={post} />
            ))}
          </ScrollView>
        ) : showPopularEmptyMessage ? (
          <View style={styles.popularEmpty}>
            <AppText variant="caption" style={styles.popularEmptyText}>
              오늘 등록된 인기 게시물이 없어요
            </AppText>
          </View>
        ) : null}
      </>
    );

  return (
    <View style={styles.screenRoot}>
      <AllCommunityBackgroundLayer />

      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.topBar}>
          {/* 네브바 균형용 */}
          <View style={styles.leftPlaceholder} />

          <Text style={styles.appName}>BETA</Text>

          <View style={styles.btnContainer}>
            {/* 검색: 기존 알림 아이콘 자리(맨 오른쪽)에 배치 */}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate("Search")}
            >
              <SearchIcon width={24} height={24} />
            </TouchableOpacity>

            {/* 다음 버전 알림
            <TouchableOpacity style={styles.iconBtn} onPress={() => {}}>
              <AlarmIcon width={24} height={24} />
            </TouchableOpacity>
            */}
          </View>
        </View>

        {isHomePending || shouldShowHomeError ? (
          <View style={styles.mainFill}>
            <FetchStateView
              isLoading={isHomePending && !shouldShowHomeError}
              isError={shouldShowHomeError}
              isFetching={isHomeFetching}
              onRetry={() => refetchHome()}
            />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <AppText variant="displayTitle" style={styles.header}>
              {user?.nickname} 님
            </AppText>
            <AppText variant="heading" style={styles.subText}>
              오늘도 BETA와 함께 응원해봐요 🔥
            </AppText>

            {homeBody}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  mainFill: {
    flex: 1,
    minHeight: 0,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 7,
  },
  leftPlaceholder: {
    width: 60,
  },
  appName: {
    flex: 1,
    textAlign: "center",
    color: "#FFF",
    fontWeight: "800",
    fontSize: 28,
    fontStyle: "italic",
  },
  btnContainer: {
    width: 60,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 14,
  },
  iconBtn: {
    alignItems: "flex-end",
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    color: "#F9F9F9",
    marginTop: 10,
    lineHeight: 32.7,
  },
  subText: {
    color: "#F9F9F9",
    lineHeight: 24.5,
    marginTop: 13,
    marginBottom: 9,
  },

  //배너
  bannerWrapper: {
    marginTop: 18,
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
    lineHeight: 18,
    fontSize: 14,
    fontWeight: "bold",
  },

  popularHeader: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    marginBlock: 10,
  },
  popularHeading: {
    color: "#F9F9F9",
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
});
