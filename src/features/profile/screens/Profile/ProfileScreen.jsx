import { StyleSheet, View, TouchableOpacity } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../../../../shared/theme/components/AppText";
import SettingsIcon from "../../assets/svg/Settings.svg";
import FeedTabContent from "./components/FeedTabContent";
import EmptyState from "./components/EmptyState";
import { TEAM_DATA } from "../../../../shared/constants/teams";
import { LinearGradient } from "expo-linear-gradient";

import { useUserStore } from "../../../../shared/store/userStore";
import {
  useMyCommentedPostsInfiniteQuery,
  useMyLikedPostsInfiniteQuery,
  useMyPostsInfiniteQuery,
  useFlattenMypagePosts,
  useUserFromUserPostsQuery,
  useUserPostsInfiniteQuery,
} from "../../hooks/useMypagePosts";
import TeamLabel from "../../../community/component/communityMain/TeamLabel";
import {
  pickEmotionTypeFromPostCoalesced,
  resolveSelectedEmotionForPost,
} from "../../../community/constants/communityReactions";
import { getUserEmotionSelection } from "../../../community/store/userEmotionSelectionStore";

const BIO_PLACEHOLDER = "한 줄 소개를 작성해 보세요 :)";

/** 팀 프로필 SVG — avatarCircle(70) + overflow:hidden 안에서 잘리지 않도록 여유 있게 */
const PROFILE_HEADER_TEAM_ICON_SIZE = 40;

const ProfileScreen = ({ navigation, route }) => {
  const user = useUserStore((s) => s.user);
  const favoriteTeamCode = user?.favoriteTeamCode;
  const nickname = user?.nickname;

  const viewedUserId = route?.params?.userId ?? null;
  const isSelf =
    viewedUserId == null || String(viewedUserId) === String(user?.id);

  const handlePressSetting = () => {
    navigation.navigate("ProfileSetting");
  };

  const [activeTab, setActiveTab] = useState("feed");
  const safeActiveTab = isSelf ? activeTab : "feed";

  useEffect(() => {
    if (!isSelf) setActiveTab("feed");
  }, [isSelf]);

  // heart fill 복원을 위해 liked 목록은 항상 hydrate
  useMyLikedPostsInfiniteQuery({
    enabled: !!user,
    hydrateSelection: true,
  });

  const myPostsQuery = useMyPostsInfiniteQuery({ enabled: !!user && isSelf });
  const myCommentedQuery = useMyCommentedPostsInfiniteQuery({
    enabled: !!user && isSelf,
  });
  const myLikedQuery = useMyLikedPostsInfiniteQuery({
    enabled: !!user && isSelf,
    hydrateSelection: false,
  });

  const userPostsQuery = useUserPostsInfiniteQuery({
    userId: viewedUserId,
    enabled: !!user && !isSelf,
  });

  const userFromQuery = useUserFromUserPostsQuery(userPostsQuery);

  const myPosts = useFlattenMypagePosts(myPostsQuery.data);
  const myLikedPosts = useFlattenMypagePosts(myLikedQuery.data);
  const myCommentedPosts = useFlattenMypagePosts(myCommentedQuery.data);

  const userPosts = useFlattenMypagePosts(userPostsQuery.data);

  const prevActiveTabRef = useRef(activeTab);

  /** 좋아요 탭: API vs 스토어 vs UI 병합 — 빈 하트 원인 추적용 */
  useEffect(() => {
    if (!isSelf || activeTab !== "like") {
      prevActiveTabRef.current = activeTab;
      return;
    }

    const justSwitchedToLike = prevActiveTabRef.current !== "like";
    prevActiveTabRef.current = activeTab;

    const rows = myLikedPosts.map((post) => {
      const id = post?.postId;
      const store = getUserEmotionSelection(id);
      return {
        postId: id,
        rawPostEmotionType: post?.emotionType,
        rawEmotionsEmotionType: post?.emotions?.emotionType,
        pickEmotionTypeFromPost: pickEmotionTypeFromPostCoalesced(post),
        storeSelection: store,
        resolveForUiHeart: resolveSelectedEmotionForPost(post, store),
      };
    });

    const payload = {
      trigger: justSwitchedToLike
        ? "tab_switch_to_like"
        : "data_update_while_like",
      postCount: rows.length,
      query: {
        isLoading: myLikedQuery.isLoading,
        isFetching: myLikedQuery.isFetching,
        isFetched: myLikedQuery.isFetched,
        isError: myLikedQuery.isError,
      },
      posts: rows,
      rawFirstPageKeys:
        myLikedQuery.data?.pages?.[0] != null
          ? Object.keys(myLikedQuery.data.pages[0])
          : [],
      sampleFirstPostFromApi: myLikedQuery.data?.pages?.[0]?.posts?.[0] ?? null,
    };

    if (__DEV__) {
      console.log("[Profile liked tab] 감정 반응 게시글 스냅샷", payload);
    }
  }, [
    isSelf,
    activeTab,
    myLikedPosts,
    myLikedQuery.data,
    myLikedQuery.isLoading,
    myLikedQuery.isFetching,
    myLikedQuery.isFetched,
    myLikedQuery.isError,
  ]);

  const renderTabContent = () => {
    switch (safeActiveTab) {
      case "feed":
        return (
          <FeedTabContent
            posts={isSelf ? myPosts : userPosts}
            emptyMessage={
              isSelf ? "작성된 게시물이 없습니다" : "작성된 게시물이 없습니다"
            }
            onEndReached={
              isSelf ? myPostsQuery.fetchNextPage : userPostsQuery.fetchNextPage
            }
            isLoading={
              isSelf ? myPostsQuery.isLoading : userPostsQuery.isLoading
            }
            isFetching={
              isSelf ? myPostsQuery.isFetching : userPostsQuery.isFetching
            }
            isFetchingNextPage={
              isSelf
                ? myPostsQuery.isFetchingNextPage
                : userPostsQuery.isFetchingNextPage
            }
            hasNext={
              !!(isSelf ? myPostsQuery.hasNextPage : userPostsQuery.hasNextPage)
            }
            isError={isSelf ? myPostsQuery.isError : userPostsQuery.isError}
            onRetry={() => (isSelf ? myPostsQuery : userPostsQuery).refetch()}
          />
        );
      case "like":
        if (!isSelf) {
          return <EmptyState message="잘못된 탭입니다" />;
        }
        return (
          <FeedTabContent
            posts={myLikedPosts}
            emptyMessage="좋아요를 남긴 게시물이 없습니다"
            onEndReached={myLikedQuery.fetchNextPage}
            isLoading={myLikedQuery.isLoading}
            isFetching={myLikedQuery.isFetching}
            isFetchingNextPage={myLikedQuery.isFetchingNextPage}
            hasNext={!!myLikedQuery.hasNextPage}
            isError={myLikedQuery.isError}
            onRetry={() => myLikedQuery.refetch()}
          />
        );
      case "comment":
        if (!isSelf) {
          return <EmptyState message="잘못된 탭입니다" />;
        }
        return (
          <FeedTabContent
            posts={myCommentedPosts}
            emptyMessage="댓글을 남긴 게시물이 없습니다"
            onEndReached={myCommentedQuery.fetchNextPage}
            isLoading={myCommentedQuery.isLoading}
            isFetching={myCommentedQuery.isFetching}
            isFetchingNextPage={myCommentedQuery.isFetchingNextPage}
            hasNext={!!myCommentedQuery.hasNextPage}
            isError={myCommentedQuery.isError}
            onRetry={() => myCommentedQuery.refetch()}
            profileCommentHighlight
          />
        );
      default:
        return <EmptyState message="잘못된 탭입니다" />;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {isSelf && (
        <View style={styles.header}>
          <AppText
            variant="displayTitle2"
            className="text-white"
            style={styles.profileHeaderTitle}
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
      )}
      <View style={styles.userProfile}>
        {(() => {
          const displayTeamCode = isSelf
            ? favoriteTeamCode
            : userFromQuery?.teamCode;
          const displayTeam = TEAM_DATA[displayTeamCode];
          const DisplayProfileIcon = displayTeam?.ProfileIcon;
          const displayNickname = isSelf ? nickname : userFromQuery?.nickname;
          const otherBio = userFromQuery?.bio;
          return (
            <>
              <LinearGradient
                colors={displayTeam?.gradient?.colors || ["#3A3D44", "#3A3D44"]}
                locations={displayTeam?.gradient?.locations}
                start={displayTeam?.gradient?.start}
                end={displayTeam?.gradient?.end}
                style={styles.avatarCircle}
              >
                <View style={styles.avatarIconCenter}>
                  {DisplayProfileIcon ? (
                    <DisplayProfileIcon
                      width={PROFILE_HEADER_TEAM_ICON_SIZE}
                      height={PROFILE_HEADER_TEAM_ICON_SIZE}
                    />
                  ) : (
                    <AppText style={{ color: "#FFF" }}>
                      {displayNickname?.[0]}
                    </AppText>
                  )}
                </View>
              </LinearGradient>
              <View style={styles.userInfoContainer}>
                <View style={styles.userNameContainer}>
                  <AppText
                    variant="heading"
                    className="text-white"
                    style={styles.profileNickname}
                  >
                    {displayNickname}
                  </AppText>
                  {!isSelf && displayTeamCode && (
                    <TeamLabel teamCode={displayTeamCode} />
                  )}
                </View>
                {isSelf ? (
                  <TouchableOpacity
                    onPress={() => navigation.navigate("EditBio")}
                    activeOpacity={0.75}
                    style={styles.bioTouchable}
                  >
                    <AppText
                      variant="middle"
                      style={[
                        styles.bioText,
                        !(user?.bio && String(user.bio).trim()) &&
                          styles.bioPlaceholder,
                      ]}
                    >
                      {user?.bio?.trim() ? user.bio : BIO_PLACEHOLDER}
                    </AppText>
                  </TouchableOpacity>
                ) : (
                  <AppText
                    variant="middle"
                    className="text-white"
                    style={styles.bioText}
                  >
                    {otherBio?.trim() ? otherBio : ""}
                  </AppText>
                )}
              </View>
            </>
          );
        })()}
      </View>

      <View style={styles.tabContainer}>
        {(isSelf
          ? [
              { key: "feed", label: "내 피드" },
              { key: "like", label: "좋아요" },
              { key: "comment", label: "댓글" },
            ]
          : [{ key: "feed", label: "피드" }]
        ).map((tab) => {
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
                style={styles.tabLabel}
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
  profileHeaderTitle: {
    lineHeight: 29,
  },
  profileNickname: {
    lineHeight: 24.5,
  },
  tabLabel: {
    lineHeight: 19,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 15,
  },
  userProfile: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 35,
    paddingVertical: 8,
    minHeight: 89,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarIconCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfoContainer: {
    marginLeft: 16,
    justifyContent: "center",
    flex: 1,
    minWidth: 0,
  },
  userNameContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  bioTouchable: {
    marginTop: 7,
    alignSelf: "stretch",
  },
  bioText: {
    color: "rgba(228, 228, 228, 0.88)",
    lineHeight: 17.7,
  },
  bioPlaceholder: {
    color: "rgba(228, 228, 228, 0.45)",
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
