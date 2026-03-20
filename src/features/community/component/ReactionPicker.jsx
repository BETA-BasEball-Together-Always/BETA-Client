import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { AppText } from "../../../shared/theme/components/AppText";

/**
 * 백드롭은 부모(PostReactions)에서 reaction 블록 전체를 덮도록 처리.
 * 이 컴포넌트는 액션 바 바로 위(요약 영역과 겹치게) 떠 있는 바만 담당.
 *
 * @param {number} anchorBottom — 부모(액션 슬롯) 기준, 피커 하단을 부모 하단에서 위로 올릴 px (= 액션 바 높이)
 */
const ReactionPicker = ({
  reactions,
  selectedReaction,
  onSelect,
  anchorBottom = 52,
}) => {
  return (
    <View
      pointerEvents="box-none"
      style={[styles.floater, { bottom: anchorBottom }]}
    >
      <View style={styles.reactionBar}>
        {reactions.map((reaction) => {
          const isSelected = selectedReaction?.id === reaction.id;

          return (
            <TouchableOpacity
              key={reaction.id}
              onPress={() => onSelect(reaction)}
            >
              <View
                style={[
                  styles.reactionCircle,
                  { backgroundColor: reaction.bgColor },
                  selectedReaction && !isSelected && styles.dimmed,
                ]}
              >
                <AppText style={styles.emoji}>{reaction.emoji}</AppText>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default ReactionPicker;

const styles = StyleSheet.create({
  floater: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 30,
    alignItems: "flex-start",
    paddingLeft: 4,
  },
  reactionBar: {
    flexDirection: "row",
    backgroundColor: "#D9D9D9",
    borderRadius: 30,
    paddingVertical: 5.5,
  },
  reactionCircle: {
    width: 50,
    height: 48,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  dimmed: {
    opacity: 0.3,
  },
  emoji: {
    fontSize: 18,
    lineHeight: 37,
  },
});
