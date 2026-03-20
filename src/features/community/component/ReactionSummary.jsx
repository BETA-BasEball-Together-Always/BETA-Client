import React from "react";
import { View, StyleSheet } from "react-native";
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
                    {
                      backgroundColor: reaction.bgColor,
                      zIndex: reactions.length - index,
                    },
                  ]}
                >
                  <AppText variant="semi13" style={{ lineHeight: 20 }}>
                    {reaction.emoji}
                  </AppText>
                </View>
              ) : null,
            )}
          </View>
          <AppText
            variant="numMediumRegular"
            className="text-gray-400"
            style={styles.totalText}
          >
            {totalReactions}
          </AppText>
        </View>
      ) : (
        <View style={styles.spacer} />
      )}

      <AppText
        variant="numMediumRegular"
        className="text-gray-400"
        style={!showStrip ? styles.commentOnly : undefined}
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
  },
  totalText: {
    marginLeft: 12,
  },
});
