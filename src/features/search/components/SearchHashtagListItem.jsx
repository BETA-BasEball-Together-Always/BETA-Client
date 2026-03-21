import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SearchHashtagListItem = ({ hashtag, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      disabled={!onPress}
      onPress={() => onPress?.(hashtag)}
      style={styles.container}
    >
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>#</Text>
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.tagName}>#{hashtag.tagName}</Text>
        <Text style={styles.metaText}>{hashtag.usageCount}개</Text>
      </View>
    </TouchableOpacity>
  );
};

export default SearchHashtagListItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#202024",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "NotoSansKR_SemiBold",
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  tagName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "NotoSansKR_SemiBold",
  },
  metaText: {
    color: "#97979E",
    fontSize: 13,
    fontFamily: "NotoSansKR_Regular",
  },
});
