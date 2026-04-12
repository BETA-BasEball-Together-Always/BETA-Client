import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "../../../../../shared/theme/components/AppText";
import { TEAM_DATA } from "../../../../../shared/constants/teams";
import { resolveTeamKeyFromApiTeamName } from "../../../utils/kboTeamName";
import {
  USE_KBO_RABBIT_RANK_LOGO,
  getKboRankRabbitHatColors,
} from "../../../constants/kboRankRabbitConfig";
import KboRabbitRankLogo from "./KboRabbitRankLogo";

const LOGO_SIZE = 30;
/** 토끼 캐릭터 크기 */
const RABBIT_LOGO_W = 22;
const RABBIT_LOGO_H = Math.round((RABBIT_LOGO_W * 95) / 91);
const RANK_W = 40;
const STAT_W = 35;
const WINRATE_W = 52;

function formatWinRate(raw) {
  if (raw == null || raw === "") return "-";
  const n = Number(String(raw));
  if (Number.isNaN(n)) return String(raw);
  return n.toFixed(3);
}

function rowShouldHighlight({
  rank,
  teamName,
  favoriteTeamCode,
  onlyHighlightTopFive,
}) {
  if (!favoriteTeamCode) return false;
  const key = resolveTeamKeyFromApiTeamName(teamName);
  if (key !== favoriteTeamCode) return false;
  if (onlyHighlightTopFive) return rank <= 5;
  return true;
}

/**
 * @param {{ rows: Array<{ rank: number, teamName: string, wins: number, draws: number, losses: number, winRate: string }>, favoriteTeamCode?: string | null, onlyHighlightTopFive?: boolean }} props
 */
export default function KboRankTable({
  rows,
  favoriteTeamCode,
  onlyHighlightTopFive = false,
}) {
  const safeRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);

  return (
    <View style={styles.table}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <AppText
            variant="smallRegular"
            style={[styles.headerCell, styles.hRank]}
          >
            순위
          </AppText>
          <AppText
            variant="smallRegular"
            style={[styles.headerCell, styles.hTeam]}
          >
            팀명
          </AppText>
        </View>
        <View style={styles.statsGroup}>
          <AppText
            variant="smallRegular"
            style={[styles.headerCell, styles.statHeader]}
          >
            승
          </AppText>
          <AppText
            variant="smallRegular"
            style={[styles.headerCell, styles.statHeader]}
          >
            무
          </AppText>
          <AppText
            variant="smallRegular"
            style={[styles.headerCell, styles.statHeader]}
          >
            패
          </AppText>
          <AppText
            variant="smallRegular"
            style={[styles.headerCell, styles.winRateHeader]}
          >
            승률
          </AppText>
        </View>
      </View>

      {safeRows.map((row, idx) => {
        const teamKey = resolveTeamKeyFromApiTeamName(row.teamName);
        const MainIcon = teamKey ? TEAM_DATA[teamKey]?.MainIcon : null;
        const rabbitHat =
          USE_KBO_RABBIT_RANK_LOGO && teamKey
            ? getKboRankRabbitHatColors(teamKey)
            : null;
        const highlight = rowShouldHighlight({
          rank: row.rank,
          teamName: row.teamName,
          favoriteTeamCode,
          onlyHighlightTopFive,
        });

        return (
          <View
            key={`kbo-r-${row.rank}-${String(row.teamName)}-${idx}`}
            style={[styles.dataRow, highlight && styles.dataRowHighlight]}
          >
            <View style={styles.leftCluster}>
              <AppText
                variant="spaced"
                style={[styles.rankText, { width: RANK_W }]}
              >
                {row.rank}
              </AppText>
              <View style={styles.teamCell}>
                {rabbitHat ? (
                  <View style={styles.logoWrapRabbit}>
                    <KboRabbitRankLogo
                      width={RABBIT_LOGO_W}
                      height={RABBIT_LOGO_H}
                      hatMain={rabbitHat.main}
                      hatShade={rabbitHat.shade}
                      maskSuffix={`${idx}-${row.rank}`}
                    />
                  </View>
                ) : MainIcon ? (
                  <View style={styles.logoWrap}>
                    <MainIcon width={LOGO_SIZE} height={LOGO_SIZE} />
                  </View>
                ) : null}
                <AppText
                  variant="spaced"
                  style={styles.teamNameText}
                  numberOfLines={1}
                >
                  {row.teamName}
                </AppText>
              </View>
            </View>
            <View style={styles.statsGroup}>
              <AppText
                variant="spaced"
                style={[styles.statText, { width: STAT_W }]}
              >
                {row.wins ?? "-"}
              </AppText>
              <AppText
                variant="spaced"
                style={[styles.statText, { width: STAT_W }]}
              >
                {row.draws ?? "-"}
              </AppText>
              <AppText
                variant="spaced"
                style={[styles.statText, { width: STAT_W }]}
              >
                {row.losses ?? "-"}
              </AppText>
              <AppText
                variant="spaced"
                style={[styles.statText, { width: WINRATE_W }]}
              >
                {formatWinRate(row.winRate)}
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 4,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(139, 196, 90, 0.15)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    marginRight: 6,
  },
  headerCell: {
    color: "#8E8E8E",
  },
  hRank: {
    width: RANK_W,
    textAlign: "center",
  },
  hTeam: {
    flex: 1,
    marginLeft: 4,
  },
  statsGroup: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  statHeader: {
    width: STAT_W,
    textAlign: "right",
  },
  winRateHeader: {
    width: WINRATE_W,
    textAlign: "right",
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 3,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(139, 196, 90, 0.15)",
  },
  dataRowHighlight: {
    backgroundColor: "#EEF6E6",
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderBottomWidth: 0,
  },
  leftCluster: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    marginRight: 6,
  },
  rankText: {
    color: "#121212",
    textAlign: "center",
  },
  teamCell: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 2,
  },
  logoWrap: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  /** 토끼는 상단 귀·모자 stroke가 viewBox 밖으로 나와 원형 overflow에 잘리므로, 동일 슬롯(30) 안에 여백 두고 표시 */
  logoWrapRabbit: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  teamNameText: {
    color: "#121212",
    flex: 1,
  },
  statText: {
    color: "#121212",
    textAlign: "right",
  },
});
