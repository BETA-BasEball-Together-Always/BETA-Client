import React from "react";
import { View, StyleSheet } from "react-native";
import EmptyState from "./EmptyState";
import PostList from "./PostList";
import FetchStateView from "../../../../../shared/components/FetchStateView";

const FeedTabContent = ({
  posts = [],
  emptyMessage = "작성된 게시물이 없습니다",
  onEndReached,
  /** 첫 페이지 로딩 (탭 전환·초기 진입 시 스피너) */
  isLoading = false,
  /** 다음 페이지 로딩 (목록 하단 스피너) */
  isFetchingNextPage = false,
  hasNext = false,
  isError = false,
  onRetry,
  /** 마이스타디움 댓글 탭: 댓글 아이콘 강조 */
  profileCommentHighlight = false,
}) => {
  const hasPosts = posts && posts.length > 0;

  return (
    <FetchStateView
      style={styles.fetchWrap}
      isLoading={!isError && isLoading && !hasPosts}
      isError={isError}
      onRetry={onRetry}
    >
      <View style={styles.container}>
        {hasPosts ? (
          <PostList
            posts={posts}
            onEndReached={onEndReached}
            isLoading={isFetchingNextPage}
            hasNext={hasNext}
            profileCommentHighlight={profileCommentHighlight}
          />
        ) : (
          <EmptyState message={emptyMessage} />
        )}
      </View>
    </FetchStateView>
  );
};

export default FeedTabContent;

const styles = StyleSheet.create({
  fetchWrap: { flex: 1 },
  container: { flex: 1 },
});
