import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CommunityLoadingSpinner from "@shared/components/CommunityLoadingSpinner";
import SearchUserRow from "./SearchUserRow";

const SearchSuggestionsSection = ({
  suggestions,
  isLoading,
  isError,
  errorMessage,
  onRetryPress,
  onKeywordPress,
  onUserPress,
}) => {
  const hasKeywords = (suggestions?.suggestedKeywords?.length ?? 0) > 0;
  const hasUsers = (suggestions?.suggestedUsers?.length ?? 0) > 0;
  const hasContent = hasKeywords || hasUsers;

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.feedbackContainer}>
          <CommunityLoadingSpinner size={40} />
        </View>
      ) : null}

      {!isLoading && isError ? (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>{errorMessage}</Text>
          <TouchableOpacity onPress={onRetryPress}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!isLoading && !isError && !hasContent ? (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>추천 결과가 없습니다.</Text>
        </View>
      ) : null}

      {!isLoading && !isError && hasKeywords ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>추천 검색어</Text>
          {suggestions.suggestedKeywords.map((keyword) => (
            <TouchableOpacity
              activeOpacity={0.82}
              key={keyword}
              onPress={() => onKeywordPress(keyword)}
              style={styles.keywordRow}
            >
              <Text style={styles.keywordText}>{keyword}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {!isLoading && !isError && hasUsers ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>추천 계정</Text>
          {suggestions.suggestedUsers.map((user) => (
            <SearchUserRow
              avatarSize={42}
              key={user.userId}
              onPress={onUserPress}
              style={styles.userRow}
              user={user}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default SearchSuggestionsSection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 28,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: "#9E9EA4",
    fontSize: 13,
    fontFamily: "NotoSansKR_Medium",
    lineHeight: 18,
  },
  keywordRow: {
    paddingVertical: 10,
  },
  keywordText: {
    color: "#F1F1F3",
    fontSize: 16,
    fontFamily: "NotoSansKR_Regular",
  },
  userRow: {
    paddingVertical: 2,
  },
  feedbackContainer: {
    paddingTop: 56,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  feedbackText: {
    color: "#6E6E73",
    fontSize: 15,
    fontFamily: "NotoSansKR_Regular",
    textAlign: "center",
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "NotoSansKR_Medium",
  },
});
