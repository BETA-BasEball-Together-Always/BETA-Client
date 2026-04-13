import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { AppText } from "../../../../../shared/theme/components/AppText";
import KboRankTable from "./KboRankTable";
import MoreDownIcon from "../../../assets/svg/more_down.svg";
import HiddenUpIcon from "../../../assets/svg/hidden_up.svg";

const PREVIEW_COUNT = 5;

/**
 * @param {{
 *   year: number,
 *   rows: Array,
 *   favoriteTeamCode?: string | null,
 * }} props
 */
export default function KboRankCard({ year, rows, favoriteTeamCode }) {
  const [expanded, setExpanded] = useState(false);

  const fullRows = Array.isArray(rows) ? rows : [];
  const hasRows = fullRows.length > 0;
  const canToggle = fullRows.length > PREVIEW_COUNT;

  const displayRows = expanded ? fullRows : fullRows.slice(0, PREVIEW_COUNT);

  return (
    <View style={styles.card}>
      <AppText variant="semi18" style={styles.title}>
        {year} 리그 순위
      </AppText>
      <AppText variant="smallRegular" style={styles.dateRange}>
        *KBO 리그에서 제공한 데이터를 기반으로 계산됩니다
      </AppText>

      {hasRows ? (
        <View style={styles.tableWrap}>
          <KboRankTable
            rows={displayRows}
            favoriteTeamCode={favoriteTeamCode}
            onlyHighlightTopFive={!expanded}
          />
        </View>
      ) : (
        <AppText variant="caption" style={styles.empty}>
          순위 정보가 없어요
        </AppText>
      )}

      {hasRows && canToggle ? (
        <TouchableOpacity
          style={styles.footer}
          onPress={() => setExpanded((v) => !v)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={expanded ? "순위 접기" : "전체 순위 펼치기"}
        >
          <AppText variant="labelSmall" style={styles.footerText}>
            {expanded ? "접기" : "전체보기"}
          </AppText>
          {expanded ? (
            <HiddenUpIcon width={18} height={18} />
          ) : (
            <MoreDownIcon width={18} height={18} />
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 13,
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  title: {
    color: "#121212",
    lineHeight: 21.8,
  },
  dateRange: {
    color: "#666",
    marginTop: 3,
    marginBottom: 8,
    lineHeight: 15,
  },
  tableWrap: {
    marginTop: 2,
  },
  empty: {
    color: "#8E8E8E",
    textAlign: "center",
    paddingVertical: 16,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingTop: 13,
  },
  footerText: {
    color: "#666",
    lineHeight: 16.3,
  },
});
