import React, { useRef, useCallback, useMemo, useState } from "react";
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  Platform,
  Animated,
  Easing,
} from "react-native";
import CommunityLoadingSpinner from "../../../../shared/components/CommunityLoadingSpinner";
import PostCard from "./PostCard";
import { AppText } from "../../../../shared/theme/components/AppText";
import { useNavigation } from "@react-navigation/native";
import PlusIcon from "../../assets/svg/plusIcon.svg";
import SortTabs from "./SortTabs";
import QuestionCard from "./QuestionCard";

/** 이 이상 스크롤 내려갔을 때(탭이 화면 밖) 멈추면 플로팅 탭 노출 */
const SCROLL_Y_SHOW_FLOATING_TABS = 44;

const PostList = ({
  posts,
  onEndReached,
  isLoading,
  isFeedBusy = false,
  showTeam = false,
  createPostBoardId,
  removeClippedSubviews,
  stabilizePostBodyMeasure = false,
  sort,
  onSortChange,
  user,
}) => {
  const navigation = useNavigation();

  const scrollYRef = useRef(0);
  const scrollIdleTimer = useRef(null);
  const floatAnim = useRef(new Animated.Value(0)).current;

  const [floatingTabsMounted, setFloatingTabsMounted] = useState(false);
  const [sortNavCompact, setSortNavCompact] = useState(false);

  const hideFloatingTabs = useCallback(() => {
    clearTimeout(scrollIdleTimer.current);
    if (!floatingTabsMounted) return;
    floatAnim.stopAnimation();
    Animated.timing(floatAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setFloatingTabsMounted(false);
    });
  }, [floatingTabsMounted, floatAnim]);

  const showFloatingTabs = useCallback(() => {
    const y = scrollYRef.current;
    if (y < SCROLL_Y_SHOW_FLOATING_TABS) {
      hideFloatingTabs();
      return;
    }
    if (floatingTabsMounted) return;
    floatAnim.stopAnimation();
    floatAnim.setValue(0);
    setFloatingTabsMounted(true);
    requestAnimationFrame(() => {
      Animated.timing(floatAnim, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  }, [floatingTabsMounted, hideFloatingTabs, floatAnim]);

  const scheduleShowFloatingOnScrollIdle = useCallback(() => {
    clearTimeout(scrollIdleTimer.current);
    scrollIdleTimer.current = setTimeout(() => {
      setSortNavCompact(false);
      showFloatingTabs();
    }, 110);
  }, [showFloatingTabs]);

  const handleScrollBegin = useCallback(() => {
    clearTimeout(scrollIdleTimer.current);
    setSortNavCompact(true);
    hideFloatingTabs();
  }, [hideFloatingTabs]);

  const onScroll = useCallback(
    (e) => {
      const y = e.nativeEvent.contentOffset.y;
      scrollYRef.current = y;
      if (y < SCROLL_Y_SHOW_FLOATING_TABS) {
        setSortNavCompact(false);
        if (floatingTabsMounted) {
          hideFloatingTabs();
        }
      }
    },
    [floatingTabsMounted, hideFloatingTabs],
  );

  const postCount = (posts ?? []).length;
  const showPopularEmpty =
    sort === "popular" && postCount === 0 && !isFeedBusy && !isLoading;

  const clipSubviews =
    removeClippedSubviews === undefined ? false : removeClippedSubviews;

  const listHeader = useMemo(
    () => (
      <View style={styles.header}>
        <SortTabs
          sort={sort}
          onChange={onSortChange}
          compact={sortNavCompact}
        />
        <QuestionCard
          user={user}
          onPress={() =>
            navigation.navigate("Community", {
              screen: "CreatePost",
              params:
                createPostBoardId != null
                  ? { initialBoardId: createPostBoardId }
                  : undefined,
            })
          }
        />
      </View>
    ),
    [sort, onSortChange, user, sortNavCompact, createPostBoardId, navigation],
  );

  return (
    <View style={styles.container}>
      {floatingTabsMounted ? (
        <Animated.View
          style={[
            styles.floatingSortWrap,
            {
              opacity: floatAnim,
              transform: [
                {
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.floatingSortInner} pointerEvents="auto">
            <SortTabs
              sort={sort}
              onChange={onSortChange}
              compact={sortNavCompact}
            />
          </View>
        </Animated.View>
      ) : null}

      <FlatList
        data={posts ?? []}
        removeClippedSubviews={clipSubviews}
        keyExtractor={(item, index) =>
          item?.postId != null ? `${item.postId}-${index}` : `post-${index}`
        }
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => (
          <View style={styles.postListCard}>
            <PostCard
              post={item}
              showTeam={showTeam}
              stabilizeBodyMeasure={stabilizePostBodyMeasure}
            />
          </View>
        )}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={handleScrollBegin}
        onMomentumScrollBegin={handleScrollBegin}
        onMomentumScrollEnd={scheduleShowFloatingOnScrollIdle}
        onScrollEndDrag={scheduleShowFloatingOnScrollIdle}
        contentContainerStyle={[styles.listContent]}
        ListEmptyComponent={
          showPopularEmpty ? (
            <View style={styles.popularEmpty}>
              <AppText variant="caption" style={styles.popularEmptyText}>
                인기글이 없습니다
              </AppText>
            </View>
          ) : null
        }
      />
      {isLoading ? (
        <View style={styles.footerLoadingOverlay} pointerEvents="none">
          <CommunityLoadingSpinner size={36} />
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.fabButton}
        onPress={() =>
          navigation.navigate("Community", {
            screen: "CreatePost",
            params:
              createPostBoardId != null
                ? { initialBoardId: createPostBoardId }
                : undefined,
          })
        }
      >
        <PlusIcon width={16} height={16} />
      </TouchableOpacity>
    </View>
  );
};

export default PostList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 0,
  },
  /** 리스트 헤더에 있는 탭과 동일 UI — 스크롤 멈춤 후에만 위에서 슬라이드 인 */
  floatingSortWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 20,
    backgroundColor: "#020408",
    paddingBottom: 6,
    ...Platform.select({
      android: { elevation: 6 },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
    }),
  },
  floatingSortInner: {
    paddingHorizontal: 17,
  },
  listContent: {
    paddingHorizontal: 17,
    paddingBottom: 16,
    flexGrow: 1,
  },
  popularEmpty: {
    flex: 1,
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  popularEmptyText: {
    color: "rgba(228, 228, 228, 0.55)",
  },
  postListCard: {
    backgroundColor: "rgba(63, 63, 63, 0.30)",
    borderRadius: 5,
    borderColor: "rgba(127, 127, 127, 0.28)",
    borderWidth: 1,
    marginVertical: 5,
    paddingVertical: 10,
    paddingHorizontal: 13,
  },
  footerLoadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 72,
    alignItems: "center",
    paddingVertical: 8,
  },
  fabButton: {
    position: "absolute",
    bottom: 16,
    right: 17,
    backgroundColor: "#313131",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 19,
    paddingHorizontal: 20,
  },
});
