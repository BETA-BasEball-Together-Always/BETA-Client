import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "../../../../shared/theme/components/AppText";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const CreatePostScreen = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.communitySelectSection}>
          <AppText variant="middle">게시판 선택</AppText>
        </View>
      </ScrollView>
    </View>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
