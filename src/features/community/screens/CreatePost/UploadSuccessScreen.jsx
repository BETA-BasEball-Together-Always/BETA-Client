import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { AppText } from "../../../../shared/theme/components/AppText";
import { useNavigation } from "@react-navigation/native";
import BaseballCharacterIcon from "../../assets/svg/CommunityPost/baseballChar.svg";

const UploadSuccessScreen = ({ route }) => {
  const navigation = useNavigation();
  const { createdPostId } = route.params ?? {};

  const handleCompletePost = () => {
    navigation.replace("Community", {
      screen: "PostDetail",
      params: {
        postId: createdPostId,
        from: "upload",
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <BaseballCharacterIcon />
        <AppText variant="heading" style={styles.text}>
          응원글이 등록되었어요 🔥
        </AppText>
      </View>

      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={handleCompletePost}
      >
        <AppText variant="semi18" className="text-[#1E1E1E]">
          게시글 보러 가기
        </AppText>
      </TouchableOpacity>
    </View>
  );
};

export default UploadSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#F9F9F9",
    marginTop: 30,
  },
  buttonContainer: {
    backgroundColor: "#F9F9F9",
    paddingVertical: 14,
    paddingHorizontal: 8,
    width: 271,
    alignItems: "center",
    borderRadius: 10,
    position: "absolute",
    bottom: 75,
  },
});
