import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AppHeader from "../../../../shared/component/AppHeader";

import BackIcon from "../../../../shared/assets/svg/chevrons/back.svg";
import MenuIcon from "../../assets/svg/TopBar/menuIcon.svg";

import PostReactions from "../../component/PostReactions";
import CommunityUserProfile from "../../component/CommunityUserProfile";
// import { LinearGradient } from "expo-linear-gradient";
// import { TEAM_DATA } from "../../../../shared/constants/teams";
// import TeamLabel from "../../component/communityMain/TeamLabel";

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
import { useQueryClient } from "@tanstack/react-query";
import { normalizeCommentsForDisplay } from "../../utils/communityComments";
import { useCommentRemovalStore } from "../../store/commentRemovalStore";

const { width } = Dimensions.get("window");

const PostDetailScreen = ({ route, navigation }) => {
  const {
    post: initialPostParam,
    postId: paramPostId,
    from,
    initialSelectedEmotionType,
  } = route.params ?? {};
  const postId = paramPostId ?? initialPostParam?.postId;
  const queryClient = useQueryClient();

  const currentUser = useUserStore((s) => s.user);

  const {
    data: detail,
    isLoading: isPostLoading,
    refetch,
  } = usePostDetailQuery(postId);
  const post = detail ?? initialPostParam ?? {};

  const hiddenCommentKeys = useCommentRemovalStore((s) => s.hiddenKeys);
  const syncCommentRemovalWithServer = useCommentRemovalStore(
    (s) => s.syncWithServerTree,
  );

  const firstFocusRef = useRef(true);
  useEffect(() => {
    firstFocusRef.current = true;
  }, [postId]);

  // 재진입 시에만 refetch — 최초 마운트는 useQuery가 이미 조회, 삭제 직후 불필요한 덮어쓰기 방지
  useFocusEffect(
    useCallback(() => {
      if (!postId) return;
      if (firstFocusRef.current) {
        firstFocusRef.current = false;
        return;
      }
      refetch();
    }, [postId, refetch]),
  );

  useEffect(() => {
    if (postId == null || detail?.comments == null) return;
    syncCommentRemovalWithServer(postId, detail.comments);
  }, [postId, detail?.comments, syncCommentRemovalWithServer]);

  const isAllChannel = post.channel === "ALL";

  const author = detail?.author ?? post?.author ?? {};

  const contentWithoutHashtags =
    detail?.content?.replace(/(^|\s)#[^\s#]+/g, " ") ?? "";
  const hashtags = detail?.hashtags ?? [];

  const scrollRef = useRef(null);

  const [replyTarget, setReplyTarget] = useState(null);
  const [postMoreVisible, setPostMoreVisible] = useState(false);
  const [threadActionModal, setThreadActionModal] = useState({
    visible: false,
    targetType: null,
    targetId: null,
  });

  const isMine = currentUser?.id === post?.author?.userId;

  const [pressedThread, setPressedThread] = useState({
    targetType: null,
    targetId: null,
  });

  const normalizeEmotionType = (t) =>
    ["LIKE", "SAD", "FUN", "HYPE"].includes(t) ? t : null;

  const [selectedEmotionType, setSelectedEmotionType] = useState(() =>
    normalizeEmotionType(initialSelectedEmotionType),
  );
  const [editTarget, setEditTarget] = useState(null); // { commentId, content }

  const createCommentMutation = useCreateCommentMutation(postId, {
    currentUser,
  });
  const updateCommentMutation = useUpdateCommentMutation(postId);
  const deleteCommentMutation = useDeleteCommentMutation(postId);
  const toggleCommentLikeMutation = useToggleCommentLikeMutation(postId);
  const toggleEmotionMutation = useTogglePostEmotionMutation(postId, {
    onSuccess: (data) => {
      setSelectedEmotionType(
        data.toggled ? data.emotionType : null,
      );
    },
  });
  const blockUserMutation = useBlockUserMutation();

  const imageList = useMemo(() => {
    const source = detail ?? initialPostParam;

    if (source?.images?.length > 0) {
      return source.images.map((img) =>
        typeof img === "string" ? img : img.imageUrl || img.url,
      );
    }

    if (source?.image) return [source.image];

    return [];
  }, [detail, initialPostParam]);

  const displayComments = useMemo(
    () =>
      normalizeCommentsForDisplay(
        detail?.comments ?? initialPostParam?.comments ?? [],
        {
          postId,
          isHidden: (pid, commentId) =>
            useCommentRemovalStore.getState().isHidden(pid, commentId),
        },
      ),
    [detail?.comments, initialPostParam?.comments, postId, hiddenCommentKeys],
  );

  // 피드(PostCard)에서 넘긴 선택 감정 / 화면 전환 시 동기화

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
    const targetId = threadActionModal.targetId;

    const findById = (list) => {
      for (const item of list ?? []) {
        if (item?.commentId === targetId) return item;
        const nested = Array.isArray(item?.replies)
          ? findById(item.replies)
          : null;
        if (nested) return nested;
      }
      return null;
    };

    const target = findById(
      detail?.comments ?? initialPostParam?.comments ?? [],
    );
    setEditTarget({
      commentId: targetId,
      content: target?.content ?? "",
    });
    setReplyTarget(null); // edit 모드면 답글 작성 모드를 끈다.
    closeThreadActionModal();
  };

  const handleDeleteThread = () => {
    console.log("delete thread", threadActionModal);
    const targetId = threadActionModal.targetId;

    deleteCommentMutation.mutate(
      { commentId: targetId },
      {
        onSuccess: () => {
          if (editTarget?.commentId === targetId) setEditTarget(null);

          closeThreadActionModal();
        },
        onError: (err) => {
          console.log("delete comment failed", {
            commentId: targetId,
            err,
          });
        },
      },
    );
  };

  const handleReportThread = () => {
    console.log("report thread", threadActionModal);
    closeThreadActionModal();
  };

  const handleCancelReportThread = () => {
    closeThreadActionModal();
  };

  const handleCreateComment = (content) => {
    if (!content.trim()) return;

    createCommentMutation.mutate(
      { content, parentId: replyTarget ?? null },
      {
        onSuccess: (newComment) => {
          queryClient.setQueryData(postDetailKeys.detail(postId), (old) => {
            if (!old) return old;

            if (!replyTarget) {
              return {
                ...old,
                comments: [...old.comments, newComment],
              };
            }

            return {
              ...old,
              comments: old.comments.map((c) =>
                c.commentId === replyTarget
                  ? {
                      ...c,
                      replies: [...c.replies, newComment],
                    }
                  : c,
              ),
            };
          });

          setReplyTarget(null);
        },
      },
    );
  };

  const handleSubmitComment = (content) => {
    if (!content.trim()) return;

    // edit 모드면 PUT /community/comments/{commentId}
    if (editTarget?.commentId) {
      updateCommentMutation.mutate(
        { commentId: editTarget.commentId, content },
        {
          onSuccess: () => {
            setEditTarget(null);
            setReplyTarget(null);
          },
          onError: (err) => {
            console.log("update comment failed", {
              commentId: editTarget.commentId,
              err,
            });
          },
        },
      );
      return;
    }

    handleCreateComment(content);
  };

  const handleBack = () => {
    if (from === "upload") {
      if (post.channel === "ALL") {
        navigation.replace("AllCommunity");
      } else {
        navigation.replace("TeamCommunity", {
          teamCode: post.author?.teamCode,
        });
      }
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={10}
      >
        <AppHeader
          left={
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
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
                nickname={author.nickname}
                teamCode={author.teamCode}
                createdAt={post.createdAt}
                showTeam={isAllChannel}
              />
            </View>

            {imageList.length > 0 && (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.imageScroll}
              >
                {imageList.map((img, index) => {
                  const isSingle = imageList.length === 1;

                  return (
                    <View
                      key={index}
                      style={[
                        styles.imageWrapper,
                        {
                          width: isSingle ? width - 32 : width * 0.7,
                        },
                      ]}
                    >
                      <Image
                        source={{ uri: img }}
                        style={styles.postImage}
                        resizeMode="cover"
                      />
                    </View>
                  );
                })}
              </ScrollView>
            )}
            {detail?.content && (
              <View style={styles.textWrapper}>
                <AppText variant="middle" style={styles.content}>
                  {contentWithoutHashtags}
                </AppText>

                {hashtags.length > 0 && (
                  <AppText style={styles.hashText}>
                    {hashtags.map((tag) => `#${tag}`).join(" ")}
                  </AppText>
                )}
              </View>
            )}

            <PostReactions
              post={post}
              selectedEmotionType={selectedEmotionType}
              isEmotionPending={toggleEmotionMutation.isPending}
              onToggleEmotion={(_postId, emotionType) => {
                if (!emotionType) return;
                toggleEmotionMutation.mutate({ emotionType });
              }}
              onSelectReaction={(_postId, reaction) => {
                if (!reaction) return;
                toggleEmotionMutation.mutate({
                  emotionType: reaction.id,
                });
              }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.commentSection}>
            <AppText variant="middle" style={styles.commentTitle}>
              댓글
            </AppText>
            <CommentList
              comments={displayComments}
              onReplyPress={(commentId) => setReplyTarget(commentId)}
              setCommentData={() => {}}
              postAuthorNickname={post?.author?.nickname}
              onLongPressThread={openThreadActionModal}
              currentUserId={currentUser?.id}
              pressedThread={pressedThread}
              onToggleCommentLike={(commentId) => {
                toggleCommentLikeMutation.mutate(
                  { commentId },
                  {
                    onSuccess: (data) => {
                      console.log("toggle comment like", {
                        commentId,
                        liked: data?.liked,
                        likeCount: data?.likeCount,
                      });
                    },
                    onError: (err) => {
                      console.log("toggle comment like failed", {
                        commentId,
                        err,
                      });
                    },
                  },
                );
              }}
              isAllChannel={post.channel === "ALL"}
            />
          </View>
        </ScrollView>
        <CommentInput
          onSubmit={handleSubmitComment}
          replyTarget={replyTarget}
          cancelReply={() => setReplyTarget(null)}
          editTarget={editTarget}
          cancelEdit={() => setEditTarget(null)}
        />

        {postMoreVisible && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={closePostMore}
            />
            <View style={styles.postMoreMenu}>
              {isMine ? (
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
    marginBottom: 4,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  avatarCircle: {
    width: 39.38,
    height: 38,
    borderRadius: 50,
    backgroundColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  headerText: {
    marginLeft: 10,
    alignItems: "flex-start",
  },

  nickname: {
    color: "#D4D4D4",
    marginRight: 3,
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
    width: width * 0.7, // 화면 너비에서 양쪽 패딩(16 + 16)을 뺀 값
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 11,
  },
  postImage: {
    width: "100%",
    height: 199,
  },

  /* 텍스트 */
  textWrapper: {
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  hashText: {
    color: "#6F9D48",
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
