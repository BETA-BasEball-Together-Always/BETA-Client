import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AppText } from "../../../../shared/theme/components/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AppHeader from "../../../../shared/component/AppHeader";

import BackIcon from "../../../../shared/assets/svg/chevrons/back.svg";
import MenuIcon from "../../assets/svg/TopBar/menuIcon.svg";

import PostReactions from "../../component/PostReactions";
import CommentList from "./components/CommentList";
import CommentInput from "./components/CommentInput";

const { width } = Dimensions.get("window");

const currentUser = {
  userId: 10,
  nickName: "왕밤빵",
  teamCode: "LG",
};
const initialComments = {
  comments: [
    {
      commentId: 1,
      content: "진짜 7회 말 소름 😭",
      likeCount: 3,
      isLiked: false,
      createdAt: "2025-11-25T10:35:00",
      author: {
        userId: 2,
        nickName: "엘지사랑해",
        teamCode: "LG",
      },
      replies: [
        {
          commentId: 2,
          content: "그쵸ㅠㅠ 직관 최고",
          likeCount: 1,
          isLiked: false,
          createdAt: "2025-11-25T10:40:00",
          author: {
            userId: 10,
            nickName: "siswe",
            teamCode: "LG",
          },
        },
      ],
    },
  ],
  hasNext: false,
  nextCursorId: null,
};

const PostDetailScreen = ({ route, navigation }) => {
  const { post, onSelectReaction } = route.params; // PostDetailScreen으로 navigation할 때 post 데이터를 전달받는다고 가정
  const imageList = post.images ?? (post.image ? [post.image] : []);

  const scrollRef = useRef(null);

  const [commentData, setCommentData] = useState(initialComments);
  const [replyTarget, setReplyTarget] = useState(null);

  useEffect(() => {
    console.log("처음 진입 시 post:", post);
  }, []);

  const handleMorePress = () => {
    if (post.isMine) {
      console.log("수정/삭제 모달");
    } else {
      console.log("신고 모달");
    }
  };

  const handleCreateComment = (content) => {
    if (!content.trim()) return;

    const newComment = {
      commentId: Date.now(),
      content,
      likeCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      author: currentUser,
      replies: [],
    };

    const scrollToBottom = () => {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollToEnd({ animated: true });
        }
      });
    };

    if (replyTarget) {
      setCommentData((prev) => ({
        ...prev,
        comments: prev.comments.map((c) =>
          c.commentId === replyTarget
            ? { ...c, replies: [...c.replies, newComment] }
            : c,
        ),
      }));
      setReplyTarget(null);
      scrollToBottom();
    } else {
      setCommentData((prev) => ({
        ...prev,
        comments: [...prev.comments, newComment],
      }));
      scrollToBottom();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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

        <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
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
            <CommentList
              comments={commentData.comments}
              onReplyPress={(commentId) => setReplyTarget(commentId)}
              setCommentData={setCommentData}
            />
          </View>
        </ScrollView>
        <CommentInput
          onSubmit={handleCreateComment}
          replyTarget={replyTarget}
          cancelReply={() => setReplyTarget(null)}
        />
      </KeyboardAvoidingView>
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
    marginBottom: 13,
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
    marginBottom: 10,
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
    marginBottom: 16,
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
    marginBottom: 13,
  },
});
