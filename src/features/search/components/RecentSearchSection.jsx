import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CommunityLoadingSpinner from "@shared/components/CommunityLoadingSpinner";

const RecentSearchSection = ({
  logs,
  isLoading,
  deletingLogId,
  isError,
  errorMessage,
  onDeletePress,
  onKeywordPress,
  onRetryPress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>최근 검색어</Text>

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

      {!isLoading && !isError && logs.length === 0 ? (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>최근 검색 내역이 없습니다.</Text>
        </View>
      ) : null}

      {!isLoading && !isError && logs.length > 0
        ? logs.map((log) => (
            <View key={log.id} style={styles.row}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onKeywordPress(log.keyword)}
                style={styles.keywordButton}
              >
                <Text style={styles.keywordText}>{log.keyword}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => onDeletePress(log.id)}
                disabled={
                  deletingLogId != null &&
                  String(deletingLogId) === String(log.id)
                }
                style={[
                  styles.deleteButton,
                  deletingLogId != null &&
                    String(deletingLogId) === String(log.id) &&
                    styles.deleteButtonDisabled,
                ]}
              >
                <Text style={styles.deleteText}>×</Text>
              </TouchableOpacity>
            </View>
          ))
        : null}
    </View>
  );
};

export default RecentSearchSection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 29,
    lineHeight: 35,
    fontFamily: "NotoSansKR_SemiBold",
    marginBottom: 20,
  },
  row: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
  },
  keywordButton: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
  },
  keywordText: {
    color: "#D5D5D8",
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "NotoSansKR_Regular",
  },
  deleteButton: {
    width: 28,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonDisabled: {
    opacity: 0.35,
  },
  deleteText: {
    color: "#7A7A80",
    fontSize: 20,
    lineHeight: 20,
    marginTop: 2,
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
