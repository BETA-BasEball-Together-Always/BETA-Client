import React from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "../../../../shared/theme/components/AppText";

const QuestionCard = ({ posts }) => {
  const user = posts?.[0]?.author;

  return (
    <View style={styles.questionCard}>
      <View style={styles.avatarCircle}>
        <AppText variant="semi13" style={{ color: "#FFF" }}>
          {user?.nickname?.[0] ?? "?"}
        </AppText>
      </View>

      <View style={{ marginLeft: 12 }}>
        <AppText variant="semi13" style={{ color: "#FFF" }}>
          {user?.nickname ?? "사용자"}
        </AppText>

        <AppText variant="caption" style={styles.questionSubtitle}>
          오늘은 어떤 마음으로 응원하고 계신가요?
        </AppText>
      </View>
    </View>
  );
};

export default QuestionCard;

const styles = StyleSheet.create({
  questionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(63, 63, 63, 0.30)",
    borderRadius: 5,
    borderColor: "rgba(127, 127, 127, 0.28)",
    borderWidth: 1,
    marginVertical: 12,
    paddingVertical: 17,
    paddingHorizontal: 13,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3A3D44",
    justifyContent: "center",
    alignItems: "center",
  },
  questionSubtitle: {
    color: "#9CA3AF",
    marginTop: 4,
  },
});
