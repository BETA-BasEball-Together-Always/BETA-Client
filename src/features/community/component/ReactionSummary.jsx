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
          {reactions.map((reaction) =>
            (reactionCounts?.[reaction.id] ?? 0) > 0 ? (
              <View
                key={reaction.id}
                style={[
                  styles.summaryCircle,
                  { backgroundColor: reaction.bgColor },
                ]}
              >
                <AppText variant="semi13">{reaction.emoji}</AppText>
              </View>
            ) : null,
          )}
          <AppText variant="numMediumRegular" className="text-gray-400">
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
    marginTop: 27,
    minHeight: 26,
    marginHorizontal: 5,
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
  summaryCircle: {
    width: 26,
    height: 26,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 9,
  },
});
