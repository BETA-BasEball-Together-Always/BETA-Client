import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AppText } from "../../../../shared/theme/components/AppText";

const SortTabs = ({ sort, onChange }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onChange("latest")}
        style={[
          styles.button,
          sort === "latest" ? styles.activeBtn : styles.disabledBtn,
        ]}
      >
        <AppText variant="bodyMedium" style={styles.text}>
          최신글
        </AppText>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onChange("popular")}
        style={[
          styles.button,
          sort === "popular" ? styles.activeBtn : styles.disabledBtn,
        ]}
      >
        <AppText variant="bodyMedium" style={styles.text}>
          인기글
        </AppText>
      </TouchableOpacity>
    </View>
  );
};

export default SortTabs;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 10,
    // paddingHorizontal: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    marginRight: 10,
    borderRadius: 20,
  },
  disabledBtn: {
    borderColor: "rgba(255,255,255,0.24)",
  },
  activeBtn: {
    backgroundColor: "#FFF",
    borderColor: "rgba(228, 228, 228, 0.50)",
  },
  text: {
    color: "#4A4A4A",
  },
});
