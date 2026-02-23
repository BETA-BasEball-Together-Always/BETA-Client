import React from "react";
import { View, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { AppText } from "../../../shared/theme/components/AppText";

const ReactionPicker = ({
  visible,
  reactions,
  selectedReaction,
  onSelect,
  onClose,
  top,
}) => {
  if (!visible) return null;

  return (
    <>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <View style={[styles.overlay, { top }]}>
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
    </>
  );
};

export default ReactionPicker;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: "flex-start",
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
  },
});
