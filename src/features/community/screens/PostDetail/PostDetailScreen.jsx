import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { AppText } from "../../../../shared/theme/components/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AppHeader from "../../../../shared/component/AppHeader";

import BackIcon from "../../../../shared/assets/svg/chevrons/back.svg";
import MenuIcon from "../../assets/svg/TopBar/menuIcon.svg";

import PostReactions from "./components/PostReactions";

const { width } = Dimensions.get("window");

const PostDetailScreen = ({ route, navigation }) => {
  const { post, onSelectReaction } = route.params; // PostDetailScreen으로 navigation할 때 post 데이터를 전달받는다고 가정

  useEffect(() => {
    console.log("처음 진입 시 post:", post);
  }, []);

  const imageList = post.images ?? (post.image ? [post.image] : []);

  const handleMorePress = () => {
    if (post.isMine) {
      console.log("수정/삭제 모달");
    } else {
      console.log("신고 모달");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <AppHeader
        left={
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <BackIcon width={12} height={18.5} />
            <AppText variant="bodyRegular" style={styles.backLabel}>
              뒤로가기
            </AppText>
          </TouchableOpacity>
        }
        right={
          <TouchableOpacity onPress={handleMorePress}>
            <MenuIcon width={20} height={20} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.containerSection}>
          {/* 유저 프로필!! 기찬 오빠 코드에서 따왔습니다! 이 부분은 수정 예정*/}
          <View style={styles.header}>
            <View style={styles.avatarCircle}>
              <AppText variant="middle" className="text-white">
                {post.nickname?.[0] ?? "유"}
              </AppText>
            </View>

            <View style={styles.headerText}>
              <AppText variant="semi14" style={styles.nickname}>
                {post.nickname}
              </AppText>
              <AppText variant="numMediumRegular" className="text-gray-500">
                {post.timeAgo}
              </AppText>
            </View>
          </View>

          {imageList.length > 0 && (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.imageScroll}
            >
              {imageList.map((img, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image
                    source={{ uri: img }}
                    style={styles.postImage}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>
          )}
          {post.content && (
            <View style={styles.textWrapper}>
              <AppText variant="middle" style={styles.content}>
                {post.content}
              </AppText>
            </View>
          )}
          <PostReactions post={post} onSelectReaction={onSelectReaction} />
        </View>

        <View style={styles.divider} />

        <View style={styles.commentSection}>
          <AppText variant="middle" style={styles.commentTitle}>
            댓글
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PostDetailScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backLabel: {
    color: "#F9F9F9",
    marginLeft: 15,
  },

  container: {
    // flex: 1,
  },
  containerSection: {
    paddingHorizontal: 15,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  avatarCircle: {
    width: 39.38,
    height: 38,
    borderRadius: 50,
    backgroundColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
  },

  headerText: {
    marginLeft: 10,
    alignItems: "flex-start",
  },

  nickname: {
    color: "#D4D4D4",
    marginBottom: 2,
  },

  timeAgo: {
    color: "#A1A1AA",
    fontSize: 11,
    marginTop: 2,
  },

  /* 이미지 */
  imageScroll: {
    marginBottom: 16,
  },
  imageWrapper: {
    width: width - 32, // 화면 너비에서 양쪽 패딩(16 + 16)을 뺀 값
    aspectRatio: 3 / 2,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 12,
  },
  postImage: {
    width: "100%",
    height: "100%",
  },

  /* 텍스트 */
  textWrapper: {
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  content: {
    color: "#F9F9F9",
    fontSize: 15,
    lineHeight: 22,
  },
  divider: {
    width: "100%",
    height: 5,
    backgroundColor: "#191919",
    marginTop: 22,
  },
  commentSection: {
    paddingVertical: 12,
    paddingHorizontal: 13,
  },
  commentTitle: {
    color: "rgba(228, 228, 228, 0.5)",
  },
});
