import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import CommunityLoadingSpinner from "@shared/components/CommunityLoadingSpinner";
import SearchHashtagListItem from "../components/SearchHashtagListItem";
import SearchInputHeader from "../components/SearchInputHeader";
import SearchPostCard from "../components/SearchPostCard";
import SearchResultTabs from "../components/SearchResultTabs";
import SearchSuggestionsSection from "../components/SearchSuggestionsSection";
import SearchUserListItem from "../components/SearchUserListItem";
import RecentSearchSection from "../components/RecentSearchSection";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { searchKeys } from "../services/searchKeys";
import { useDeleteSearchLogMutation } from "../services/useDeleteSearchLogMutation";
import { useSearchHashtagsInfiniteQuery } from "../services/useSearchHashtagsInfiniteQuery";
import { useSearchMyLogsQuery } from "../services/useSearchMyLogsQuery";
import { useSearchPostsInfiniteQuery } from "../services/useSearchPostsInfiniteQuery";
import { useSearchSuggestionsQuery } from "../services/useSearchSuggestionsQuery";
import { useSearchUsersInfiniteQuery } from "../services/useSearchUsersInfiniteQuery";
import { getErrorMessage } from "../utils/formatters";
import { isPureChoseongQuery } from "../utils/queryGuards";

const flattenPages = (pages, idKey) => {
  if (!pages?.length) {
    return [];
  }

  const mergedItems = pages.flatMap((page) => page.items ?? []);

  if (!idKey) {
    return mergedItems;
  }

  const seen = new Set();

  return mergedItems.filter((item) => {
    const id = item?.[idKey];

    if (id == null) {
      return true;
    }

    if (seen.has(id)) {
      return false;
    }

    seen.add(id);
    return true;
  });
};

const ResultFeedback = ({ message, actionLabel, onActionPress, loading }) => {
  return (
    <View style={styles.resultFeedbackContainer}>
      {loading ? <CommunityLoadingSpinner size={42} /> : null}
      <Text style={styles.resultFeedbackText}>{message}</Text>
      {actionLabel ? (
        <TouchableOpacity activeOpacity={0.8} onPress={onActionPress}>
          <Text style={styles.resultFeedbackAction}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const SearchScreen = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [isResultMode, setIsResultMode] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [postChannel, setPostChannel] = useState("ALL");
  const [postSort, setPostSort] = useState("RECOMMENDED");

  const trimmedKeyword = keyword.trim();
  const debouncedKeyword = useDebouncedValue(trimmedKeyword, 300);
  const isChoseongOnlyKeyword = isPureChoseongQuery(debouncedKeyword);

  const showRecentLogs = trimmedKeyword.length === 0;
  const showSuggestions =
    debouncedKeyword.length > 0 &&
    !isResultMode &&
    !isChoseongOnlyKeyword;
  const showResults = trimmedKeyword.length > 0 && isResultMode;

  const recentLogsQuery = useSearchMyLogsQuery({
    enabled: showRecentLogs,
  });

  const suggestionsQuery = useSearchSuggestionsQuery({
    keyword: debouncedKeyword,
    enabled: showSuggestions,
  });

  const usersQuery = useSearchUsersInfiniteQuery({
    keyword: submittedKeyword,
    enabled: showResults && activeTab === "users",
  });

  const postsQuery = useSearchPostsInfiniteQuery({
    keyword: submittedKeyword,
    channel: postChannel,
    sort: postSort,
    enabled: showResults && activeTab === "posts",
  });

  const hashtagsQuery = useSearchHashtagsInfiniteQuery({
    keyword: submittedKeyword,
    enabled: showResults && activeTab === "hashtags",
  });

  const deleteSearchLogMutation = useDeleteSearchLogMutation();
  const [deletingLogId, setDeletingLogId] = useState(null);

  const resultQueries = {
    users: usersQuery,
    posts: postsQuery,
    hashtags: hashtagsQuery,
  };

  const activeResultQuery = resultQueries[activeTab];

  const userItems = useMemo(
    () => flattenPages(usersQuery.data?.pages, "userId"),
    [usersQuery.data?.pages],
  );
  const postItems = useMemo(
    () => flattenPages(postsQuery.data?.pages, "postId"),
    [postsQuery.data?.pages],
  );
  const hashtagItems = useMemo(
    () => flattenPages(hashtagsQuery.data?.pages, "hashtagId"),
    [hashtagsQuery.data?.pages],
  );

  useEffect(() => {
    if (!showResults || !activeResultQuery?.isSuccess) {
      return;
    }

    queryClient.invalidateQueries({
      queryKey: searchKeys.logs(),
    });
  }, [
    activeResultQuery?.dataUpdatedAt,
    activeResultQuery?.isSuccess,
    queryClient,
    showResults,
  ]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleClearPress = () => {
    setKeyword("");
    setSubmittedKeyword("");
    setIsResultMode(false);
    setActiveTab("posts");
    setPostChannel("ALL");
    setPostSort("RECOMMENDED");
  };

  const handleChangeKeyword = (value) => {
    setKeyword(value);

    if (isResultMode) {
      setIsResultMode(false);
    }
  };

  const submitSearch = (nextKeyword, options = {}) => {
    const trimmed = nextKeyword?.trim();

    if (!trimmed) {
      return;
    }

    setKeyword(trimmed);
    setSubmittedKeyword(trimmed);
    setIsResultMode(true);
    setActiveTab(options.activeTab ?? "posts");
    setPostChannel(options.postChannel ?? "ALL");
    setPostSort(options.postSort ?? "RECOMMENDED");
  };

  const handleDeleteLog = (logId) => {
    if (!logId) return;
    if (deletingLogId != null && String(deletingLogId) === String(logId)) {
      return;
    }
    setDeletingLogId(logId);
    deleteSearchLogMutation.mutate(logId, {
      onSettled: () => {
        setDeletingLogId((prev) =>
          prev != null && String(prev) === String(logId) ? null : prev,
        );
      },
    });
  };

  const handlePressSuggestedUser = (user) => {
    if (!user?.userId) {
      return;
    }

    navigation.navigate("Main", {
      screen: "Profile",
      params: {
        screen: "ProfileMain",
        params: { userId: user.userId },
      },
    });
  };

  const handleLoadMore = () => {
    if (
      !showResults ||
      !activeResultQuery?.hasNextPage ||
      activeResultQuery?.isFetchingNextPage
    ) {
      return;
    }

    activeResultQuery.fetchNextPage();
  };

  const renderResultListFooter = () => {
    if (!activeResultQuery?.isFetchingNextPage) {
      return <View style={styles.listFooterSpacing} />;
    }

    return (
      <View style={styles.listFooterLoading}>
        <CommunityLoadingSpinner size={32} />
      </View>
    );
  };

  const renderResultEmpty = () => {
    if (activeResultQuery?.isPending) {
      return (
        <ResultFeedback
          loading
          message="검색 결과를 불러오고 있어요."
        />
      );
    }

    if (activeResultQuery?.isError) {
      return (
        <ResultFeedback
          actionLabel="다시 시도"
          message={getErrorMessage(
            activeResultQuery.error,
            "검색 결과를 불러오지 못했습니다.",
          )}
          onActionPress={() => activeResultQuery.refetch()}
        />
      );
    }

    return <ResultFeedback message="검색 결과가 없습니다." />;
  };

  const renderResults = () => {
    if (!showResults) {
      return null;
    }

    if (activeTab === "users") {
      return (
        <FlatList
          contentContainerStyle={styles.resultListContent}
          data={userItems}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => `${item.userId}`}
          ListEmptyComponent={renderResultEmpty}
          ListFooterComponent={renderResultListFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => <SearchUserListItem user={item} />}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    if (activeTab === "posts") {
      return (
        <FlatList
          contentContainerStyle={styles.resultListContent}
          data={postItems}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => `${item.postId}`}
          ListEmptyComponent={renderResultEmpty}
          ListFooterComponent={renderResultListFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          renderItem={({ item }) => <SearchPostCard post={item} />}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    return (
      <FlatList
        contentContainerStyle={styles.resultListContent}
        data={hashtagItems}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => `${item.hashtagId}`}
        ListEmptyComponent={renderResultEmpty}
        ListFooterComponent={renderResultListFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        renderItem={({ item }) => <SearchHashtagListItem hashtag={item} />}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <SearchInputHeader
          onBackPress={handleBackPress}
          onChangeText={handleChangeKeyword}
          onClearPress={handleClearPress}
          onSubmitEditing={() => submitSearch(keyword)}
          value={keyword}
        />

        {showResults ? (
          <SearchResultTabs
            activePostChannel={postChannel}
            activePostSort={postSort}
            activeTab={activeTab}
            onPostChannelChange={setPostChannel}
            onPostSortChange={setPostSort}
            onTabChange={setActiveTab}
          />
        ) : null}

        {showRecentLogs ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <RecentSearchSection
              errorMessage={getErrorMessage(
                recentLogsQuery.error,
                "최근 검색어를 불러오지 못했습니다.",
              )}
              isError={recentLogsQuery.isError}
              isLoading={recentLogsQuery.isPending}
              deletingLogId={deletingLogId}
              logs={recentLogsQuery.data?.logs ?? []}
              onDeletePress={handleDeleteLog}
              onKeywordPress={(value) => submitSearch(value)}
              onRetryPress={() => recentLogsQuery.refetch()}
            />
          </ScrollView>
        ) : null}

        {showSuggestions ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <SearchSuggestionsSection
              errorMessage={getErrorMessage(
                suggestionsQuery.error,
                "추천 결과를 불러오지 못했습니다.",
              )}
              isError={suggestionsQuery.isError}
              isLoading={suggestionsQuery.isPending}
              onKeywordPress={(value) => submitSearch(value)}
              onRetryPress={() => suggestionsQuery.refetch()}
              onUserPress={handlePressSuggestedUser}
              suggestions={suggestionsQuery.data}
            />
          </ScrollView>
        ) : null}

        {renderResults()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#09090A",
  },
  container: {
    flex: 1,
    backgroundColor: "#09090A",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  resultListContent: {
    flexGrow: 1,
    paddingTop: 6,
    paddingBottom: 28,
  },
  resultFeedbackContainer: {
    flex: 1,
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 24,
  },
  resultFeedbackText: {
    color: "#76767C",
    fontSize: 15,
    fontFamily: "NotoSansKR_Regular",
    textAlign: "center",
  },
  resultFeedbackAction: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "NotoSansKR_Medium",
  },
  listFooterLoading: {
    paddingVertical: 20,
  },
  listFooterSpacing: {
    height: 20,
  },
});
