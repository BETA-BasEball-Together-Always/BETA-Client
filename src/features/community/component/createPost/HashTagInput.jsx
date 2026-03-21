import React from "react";
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { AppText } from "../../../../shared/theme/components/AppText";

const HashTagInput = ({
  isEditing,
  hashTagRaw,
  hashTags,
  onChangeRaw,
  onSubmit,
  onPressDisplay,
}) => {
  return (
    <>
      {isEditing && (
        <View style={styles.hashInputRow}>
          <AppText variant="caption" style={styles.prefix}>
            #
          </AppText>
          <TextInput
            value={hashTagRaw}
            onChangeText={onChangeRaw}
            style={styles.input}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            onBlur={onSubmit}
          />
        </View>
      )}

      {hashTags.length > 0 && (
        <Pressable onPress={onPressDisplay} style={styles.displayRow}>
          <AppText variant="caption" style={styles.tagText}>
            {hashTags.map((tag) => `#${tag}`).join(" ")}
          </AppText>
        </Pressable>
      )}
    </>
  );
};

export default HashTagInput;

const styles = StyleSheet.create({
  hashInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  prefix: {
    color: "#6F9D48",
  },
  input: {
    flex: 1,
    color: "#6F9D48",
    paddingVertical: 0,
    fontSize: 15,
    gap: 6,
  },
  displayRow: {
    marginTop: 4,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tagText: {
    color: "#6F9D48",
    flexShrink: 1,
  },
});
