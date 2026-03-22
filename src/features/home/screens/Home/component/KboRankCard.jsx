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
        {year} KBO 랭크
      </AppText>
      <AppText variant="smallRegular" style={styles.dateRange}>
        *KBO 리그 공식 데이터를 기반으로 제공합니다
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

/**
 * ── 카드 전체 높이·내부 간격을 줄이고 싶을 때 (수정 위치 안내) ──
 *
 * • 이 파일(styles): 카드 바깥·안쪽 여백과 블록 사이 간격
 *   - `card`: paddingTop / paddingBottom / paddingHorizontal → 카드 테두리 안쪽 전체 패딩
 *   - `card.marginTop` → 위쪽 콘텐츠(인사 문구 등)와 카드 사이
 *   - `title.lineHeight` → 제목 줄 높이
 *   - `dateRange`: marginTop / marginBottom → 제목↔날짜↔표 사이
 *   - `tableWrap.marginTop` → 날짜↔순위 표 사이
 *   - `footer`: paddingTop / paddingBottom → 표↔전체보기 버튼 사이
 *
 * • `KboRankTable.jsx`: 표 한 줄 높이·로고 크기
 *   - 상단 `LOGO_SIZE`, 행 `dataRow.paddingVertical`, 헤더 `headerRow.paddingBottom`
 *
 * • 홈에서 카드와 배너 사이: `HomeScreen.jsx` 의 `KboRankCard` 위쪽 레이아웃(margin 등)
 */
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
