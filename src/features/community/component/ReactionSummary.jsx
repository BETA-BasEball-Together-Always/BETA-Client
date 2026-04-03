import React from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import { AppText } from "../../../shared/theme/components/AppText";

/**
 * @param {boolean} [hideReactionStrip] — true면 감정 아이콘 줄 숨김(댓글 수만)
 */
const ReactionSummary = ({
  reactions,
  reactionCounts = {},
  totalReactions = 0,
  commentCount,
  style,
  hideReactionStrip = false,
  compact = false,
}) => {
  const showStrip = !hideReactionStrip && totalReactions > 0;

  return (
    <View style={[styles.reactionSummary, style]}>
      {showStrip ? (
        <View style={styles.reactionIconRow}>
          <View style={styles.iconStack}>
            {reactions.map((reaction, index) =>
              (reactionCounts?.[reaction.id] ?? 0) > 0 ? (
                <View
                  key={reaction.id}
                  style={[
                    styles.summaryCircle,
                    compact && styles.summaryCircleCompact,
                    {
                      backgroundColor: reaction.bgColor,
                      zIndex: reactions.length - index,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.emojiInCircle,
                      compact && styles.emojiInCircleCompact,
                    ]}
                  >
                    {reaction.emoji}
                  </Text>
                </View>
              ) : null,
            )}
          </View>
          <AppText
            variant="numMediumRegular"
            className="text-gray-400"
            style={[
              styles.totalText,
              compact && styles.totalTextCompact,
              styles.summaryMetricText,
            ]}
          >
            {totalReactions}
          </AppText>
        </View>
      ) : (
        <View style={styles.spacer} />
      )}

      <AppText
        variant="numMediumRegular"
        style={[
          styles.commentCountText,
          compact && styles.commentCountTextCompact,
          styles.summaryMetricText,
          !showStrip ? styles.commentOnly : undefined,
        ]}
      >
        댓글 {commentCount}
      </AppText>
    </View>
  );
};

export default ReactionSummary;

const styles = StyleSheet.create({
  reactionSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 0,
    minHeight: 22,
    marginHorizontal: 2,
  },
  spacer: {
    flex: 1,
  },
  reactionIconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentOnly: {
    marginLeft: "auto",
  },
  iconStack: {
    flexDirection: "row",
  },
  summaryCircle: {
    width: 22,
    height: 22,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: -3,
    overflow: "hidden",
  },
  summaryCircleCompact: {
    width: 17,
    height: 17,
    borderRadius: 9,
    marginRight: -2,
  },
  totalText: {
    marginLeft: 12,
  },
  totalTextCompact: {
    marginLeft: 8,
  },
  summaryMetricText: {
    lineHeight: 15,
  },
  emojiInCircle: {
    width: 22,
    height: 22,
    fontSize: 13,
    lineHeight: 22,
    textAlign: "center",
    ...Platform.select({
      ios: { paddingTop: 0 },
      android: {
        includeFontPadding: false,
        textAlignVertical: "center",
      },
    }),
  },
  emojiInCircleCompact: {
    width: 17,
    height: 17,
    fontSize: 10,
    lineHeight: 17,
  },
  commentCountText: {
    color: "#D4D4D4",
    fontSize: 11,
  },
  commentCountTextCompact: {
    fontSize: 10,
  },
});
