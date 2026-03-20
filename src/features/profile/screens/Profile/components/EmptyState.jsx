import React from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "../../../../../shared/theme/components/AppText";

const EmptyState = ({
  message = "작성된 게시물이 없습니다",
  style,
  textStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      <AppText
        variant="middle"
        className="text-white"
        style={[styles.message, textStyle]}
      >
        {message}
      </AppText>
    </View>
  );
};

export default EmptyState;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  message: { textAlign: "center" },
});
