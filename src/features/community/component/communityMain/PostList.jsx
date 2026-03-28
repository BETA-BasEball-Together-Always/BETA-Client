import React from "react";
import { StyleSheet, FlatList, View, TouchableOpacity } from "react-native";
import CommunityLoadingSpinner from "../../../../shared/components/CommunityLoadingSpinner";
import PostCard from "./PostCard";
import { AppText } from "../../../../shared/theme/components/AppText";
import { useNavigation } from "@react-navigation/native";
import PlusIcon from "../../assets/svg/plusIcon.svg";
import SortTabs from "./SortTabs";
import QuestionCard from "./QuestionCard";

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

  // const handleEndReached = () => {
  //   // sort 탭 변경/리렌더 직후 FlatList가 바로 endReached를 트리거하는 경우가 있어
  //   // 그때 불필요한 fetchNextPage가 연쇄로 발생하며 스피너가 깜빡일 수 있습니다.
  //   if (typeof onEndReached !== "function") return;
  //   if (isFeedBusy || isLoading) return;
  //   if (!posts || posts.length === 0) return;
  //   onEndReached();
  // };

  const showPopularEmpty =
    sort === "popular" && posts.length === 0 && !isFeedBusy && !isLoading;

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        removeClippedSubviews={removeClippedSubviews}
        keyExtractor={(item, index) =>
          item?.postId != null ? `${item.postId}-${index}` : `post-${index}`
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <SortTabs sort={sort} onChange={onSortChange} />
            <QuestionCard user={user} />
          </View>
        }
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
