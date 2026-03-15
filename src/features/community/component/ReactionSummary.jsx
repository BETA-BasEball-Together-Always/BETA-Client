import React from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "../../../shared/theme/components/AppText";

const ReactionSummary = ({
  reactions,
  reactionCounts,
  totalReactions,
  commentCount,
}) => {
  return (
    <View style={styles.reactionSummary}>
      <View style={styles.reactionIconRow}>
        {reactions.map((reaction) =>
          reactionCounts[reaction.id] > 0 ? (
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

      <AppText variant="numMediumRegular" className="text-gray-400">
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
  },
  reactionIconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
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
