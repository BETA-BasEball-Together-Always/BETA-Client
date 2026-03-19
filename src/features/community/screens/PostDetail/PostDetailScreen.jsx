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
import CommunityUserProfile from "../../component/CommunityUserProfile";
import CommentList from "./components/CommentList";
import CommentInput from "./components/CommentInput";
import { useUserStore } from "../../../../shared/store/userStore";
import {
  useBlockUserMutation,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  usePostDetailQuery,
  useToggleCommentLikeMutation,
  useTogglePostEmotionMutation,
  useUpdateCommentMutation,
} from "../../services/postDetail/postDetailService";

const { width } = Dimensions.get("window");

const PostDetailScreen = ({ route, navigation }) => {
  const { post: initialPostParam } = route.params ?? {};
  const currentUser = useUserStore((s) => s.user);

  const postId = initialPostParam?.postId;
  const { data: detail, isLoading: isPostLoading } = usePostDetailQuery(
    postId,
    {
      initialData: initialPostParam
        ? {
            ...initialPostParam,
            comments: [],
            hasNextComments: false,
            nextCommentCursor: null,
          }
        : undefined,
    },
  );

  const imageList =
    detail?.images?.map((img) => img.imageUrl || img.url) ??
    (detail?.image ? [detail.image] : []);

  const scrollRef = useRef(null);

  const [replyTarget, setReplyTarget] = useState(null);
  const [postMoreVisible, setPostMoreVisible] = useState(false);
  const [threadActionModal, setThreadActionModal] = useState({
    visible: false,
    isMine: false,
    targetType: null,
    targetId: null,
  });

  const [pressedThread, setPressedThread] = useState({
    targetType: null,
    targetId: null,
  });

  const [selectedEmotionType, setSelectedEmotionType] = useState(null);

  const createCommentMutation = useCreateCommentMutation(postId, {
    currentUser,
  });
  const updateCommentMutation = useUpdateCommentMutation(postId);
  const deleteCommentMutation = useDeleteCommentMutation(postId);
  const toggleCommentLikeMutation = useToggleCommentLikeMutation(postId);
  const toggleEmotionMutation = useTogglePostEmotionMutation(postId, {
    onSuccess: (data) => {
      setSelectedEmotionType(data.toggled ? data.emotionType : null);
    },
  });
  const blockUserMutation = useBlockUserMutation();

  const handleMorePress = () => {
    setPostMoreVisible(true);
  };

  const closePostMore = () => {
    setPostMoreVisible(false);
  };

  const openThreadActionModal = ({ isMine, targetType, targetId }) => {
    setPressedThread({ targetType, targetId });

    setThreadActionModal({
      visible: true,
      isMine,
      targetType,
      targetId,
    });
  };

  const closeThreadActionModal = () => {
    setThreadActionModal((prev) => ({ ...prev, visible: false }));
    setPressedThread({ targetType: null, targetId: null });
  };

  // TODO: 실제 네비게이션/삭제 로직 연결 예정
  const handleEditPost = () => {
    console.log("edit post");
    closePostMore();
  };

  const handleDeletePost = () => {
    console.log("delete post");
    closePostMore();
  };

  const handleReportPost = () => {
    console.log("report post");
    closePostMore();
  };

  const handleEditThread = () => {
    console.log("edit thread", threadActionModal);
    closeThreadActionModal();
  };

  const handleDeleteThread = () => {
    console.log("delete thread", threadActionModal);
    closeThreadActionModal();
  };

  const handleReportThread = () => {
    console.log("report thread", threadActionModal);
    closeThreadActionModal();
  };

  const handleCancelReportThread = () => {
    closeThreadActionModal();
  };

  const post = detail ?? initialPostParam ?? {};

  const handleCreateComment = (content) => {
    if (!content.trim()) return;

    const scrollToBottom = () => {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollToEnd({ animated: true });
        }
      });
    };

    createCommentMutation.mutate(
      { content, parentId: replyTarget ?? null },
      {
        onSuccess: () => {
          setReplyTarget(null);
          scrollToBottom();
        },
      },
    );
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
            <View style={styles.header}>
              <CommunityUserProfile
                nickname={detail?.author?.nickname ?? post?.author?.nickname}
                teamCode={detail?.author?.teamCode ?? post?.author?.teamCode}
                createdAt={detail?.createdAt}
              />
            </View>

            {detail?.content && (
              <View style={styles.textWrapper}>
                <AppText variant="middle" style={styles.content}>
                  {detail.content}
                </AppText>
              </View>
            )}
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
            <PostReactions
              post={detail ?? initialPost}
              selectedEmotionType={selectedEmotionType}
              onToggleEmotion={(emotionType) =>
                toggleEmotionMutation.mutate({ emotionType })
              }
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.commentSection}>
            <AppText variant="middle" style={styles.commentTitle}>
              댓글
            </AppText>
            <CommentList
              comments={detail?.comments ?? []}
              onReplyPress={(commentId) => setReplyTarget(commentId)}
              setCommentData={() => {}}
              postAuthorNickname={
                detail?.author?.nickname ?? initialPost?.author?.nickname
              }
              onLongPressThread={openThreadActionModal}
              currentUserId={currentUser?.id}
              onToggleCommentLike={(commentId) =>
                toggleCommentLikeMutation.mutate({ commentId })
              }
              isAllChannel={post.channel === "ALL"}
            />
          </View>
        </ScrollView>
        <CommentInput
          onSubmit={handleCreateComment}
          replyTarget={replyTarget}
          cancelReply={() => setReplyTarget(null)}
        />

        {postMoreVisible && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={closePostMore}
            />
            <View style={styles.postMoreMenu}>
              {post.isMine ? (
                <>
                  <TouchableOpacity
                    style={styles.postMoreButton}
                    onPress={handleEditPost}
                  >
                    <AppText variant="bodyMedium" style={styles.postMoreText}>
                      수정하기
                    </AppText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.postMoreButton}
                    onPress={handleDeletePost}
                  >
                    <AppText variant="bodyMedium" style={styles.postMoreText}>
                      삭제하기
                    </AppText>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.postMoreButton}
                  onPress={handleReportPost}
                >
                  <AppText variant="bodyMedium" style={styles.postMoreText}>
                    신고하기
                  </AppText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {threadActionModal.visible && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={closeThreadActionModal}
            />
            <View style={styles.bottomSheet}>
              {threadActionModal.isMine ? (
                <>
                  <TouchableOpacity
                    style={styles.bottomSheetButton}
                    onPress={handleEditThread}
                  >
                    <AppText
                      variant="bodyMedium"
                      style={styles.bottomSheetText}
                    >
                      수정하기
                    </AppText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.bottomSheetButton}
                    onPress={handleDeleteThread}
                  >
                    <AppText
                      variant="bodyMedium"
                      style={styles.bottomSheetText}
                    >
                      삭제하기
                    </AppText>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.bottomSheetButton}
                    onPress={handleReportThread}
                  >
                    <AppText
                      variant="bodyMedium"
                      style={styles.bottomSheetText}
                    >
                      신고하기
                    </AppText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.bottomSheetButton}
                    onPress={handleCancelReportThread}
                  >
                    <AppText
                      variant="bodyMedium"
                      style={styles.bottomSheetText}
                    >
                      취소
                    </AppText>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
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
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bottomSheet: {
    width: "100%",
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  bottomSheetButton: {
    backgroundColor: "#1F1F1F",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  bottomSheetText: {
    color: "#F9F9F9",
  },
  postMoreMenu: {
    position: "absolute",
    top: 56,
    right: 16,
    backgroundColor: "#27272A",
    borderRadius: 8,
    paddingVertical: 4,
    minWidth: 120,
  },
  postMoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  postMoreText: {
    color: "#F9F9F9",
  },
});
