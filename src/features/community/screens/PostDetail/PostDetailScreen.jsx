import React from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { AppText } from "../../../../shared/theme/components/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const PostDetailScreen = ({ route }) => {
  const { post } = route.params; // PostDetailScreen으로 navigation할 때 post 데이터를 전달받는다고 가정
  console.log("PostDetailScreen에서 받은 post 데이터:", post);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <AppText variant="middle" className="text-white">
              {post.nickname?.[0] ?? "유"}
            </AppText>
          </View>

          <View style={styles.headerText}>
            <AppText
              variant="semi14"
              className="text-gray-400"
              style={styles.nickname}
            >
              {post.nickname}
            </AppText>
            <AppText variant="bodyRegular" className="text-gray-500">
              {post.timeAgo}
            </AppText>
          </View>
        </View>

        {/* 본문 내용 */}
        {post.image ? (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: post.image }}
              style={styles.postImage}
              resizeMode="cover"
            />
          </View>
        ) : (
          <View style={styles.textWrapper}>
            <AppText variant="bodyRegular" className="text-white">
              {post.content}
            </AppText>
          </View>
        )}
        {post.image && (
          <View style={styles.textWrapper}>
            <AppText variant="bodyRegular" className="text-white">
              {post.content}
            </AppText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PostDetailScreen;

const CARD_BG = "#1C1C1E";
const TEXT_MAIN = "#F4F4F5";
const TEXT_SUB = "#A1A1AA";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },

  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },

  /* 상단 작성자 영역 */
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarInitial: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  headerText: {
    marginLeft: 10,
  },

  nickname: {
    color: TEXT_MAIN,
    fontSize: 14,
    fontWeight: "600",
  },

  timeAgo: {
    color: TEXT_SUB,
    fontSize: 11,
    marginTop: 2,
  },

  /* 이미지 */
  imageWrapper: {
    width: "100%",
    aspectRatio: 3 / 2,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  /* 텍스트 */
  textWrapper: {
    marginTop: 4,
  },

  content: {
    color: TEXT_MAIN,
    fontSize: 15,
    lineHeight: 22,
  },
  postImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
});
