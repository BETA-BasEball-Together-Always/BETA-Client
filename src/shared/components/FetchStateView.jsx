import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { AppText } from "../theme/components/AppText";
import CommunityLoadingSpinner from "./CommunityLoadingSpinner";

/** 앱 공통: API 실패 시 문구 */
export const DATA_FETCH_ERROR_MESSAGE_LINE1 = "데이터를 불러오지 못했습니다.";
export const DATA_FETCH_ERROR_MESSAGE_LINE2 = "잠시 후 다시 시도해 주세요.";

/**
 * 데이터 영역만 로딩/에러 처리
 * @param {boolean} isLoading
 * @param {boolean} isError
 * @param {() => void} onRetry — refetch
 */
export default function FetchStateView({
  isLoading = false,
  isError = false,
  onRetry,
  children,
  style,
  contentStyle,
}) {
  if (isError) {
    return (
      <View style={[styles.center, style]}>
        <View style={[styles.errorBlock, contentStyle]}>
          <AppText variant="bodyRegular" style={styles.errorLine}>
            {DATA_FETCH_ERROR_MESSAGE_LINE1}
          </AppText>
          <AppText variant="bodyRegular" style={styles.errorLine}>
            {DATA_FETCH_ERROR_MESSAGE_LINE2}
          </AppText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetry}
            disabled={!onRetry}
            accessibilityRole="button"
            accessibilityLabel="다시 시도"
          >
            <AppText variant="middle" style={styles.retryButtonLabel}>
              다시 시도
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.center, style]}>
        <CommunityLoadingSpinner size={44} />
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    minHeight: 120,
  },
  errorBlock: {
    alignItems: "center",
    maxWidth: 320,
  },
  errorLine: {
    color: "#F9F9F9",
    textAlign: "center",
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
    minWidth: 120,
    alignItems: "center",
  },
  retryButtonLabel: {
    color: "#121212",
    fontWeight: "600",
  },
});
