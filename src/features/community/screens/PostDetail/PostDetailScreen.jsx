import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
  Text,
} from "react-native";
import { AppText } from "../../../../shared/theme/components/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AppHeader from "../../../../shared/component/AppHeader";

import BackIcon from "../../../../shared/assets/svg/chevrons/back.svg";

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
import {
  normalizeCommentsForDisplay,
  normalizeCommentAuthorFields,
} from "../../utils/communityComments";
import { stripPhotoOnlyPlaceholderForDisplay } from "../../utils/photoOnlyPostPlaceholder";
import { useCommentRemovalStore } from "../../store/commentRemovalStore";
import { useCommentAuthorFallbackStore } from "../../store/commentAuthorFallbackStore";
import { useUserEmotionSelection } from "../../store/userEmotionSelectionStore";
import {
  normalizeCommunityEmotionType,
  pickEmotionTypeFromPostCoalesced,
  resolveSelectedEmotionForPost,
} from "../../constants/communityReactions";
import { useDeletePostMutation } from "../../services/post/deletePostMutation";
import { isAllChannelPost } from "../../utils/communityChannel";
import {
  DELETED_POST_MESSAGE,
  getActivePostImages,
  isPostDeletedOrHiddenInFeed,
} from "../../utils/communityPostVisibility";
import { getApiErrorMessage } from "../../../../shared/utils/apiErrorMessage";
import { withImageDisplayCacheKey } from "../../utils/imageDisplayUri";
import FetchStateView from "../../../../shared/components/FetchStateView";

const { width } = Dimensions.get("window");

const PostDetailScreen = ({ route, navigation }) => {
  const {
    post: initialPostParam,
    postId: paramPostId,
    from,
    initialSelectedEmotionType,
  } = route.params ?? {};
  const postId = paramPostId ?? initialPostParam?.postId;

  const currentUser = useUserStore((s) => s.user);

  const {
    data: detail,
    isFetched: isPostDetailFetched,
    isError: isPostDetailError,
    refetch: refetchPostDetail,
  } = usePostDetailQuery(postId);
  const post = detail ?? initialPostParam ?? {};

  const hiddenCommentKeys = useCommentRemovalStore((s) => s.hiddenKeys);
  const syncCommentRemovalWithServer = useCommentRemovalStore(
    (s) => s.syncWithServerTree,
  );
  const commentAuthorFallbackMap = useCommentAuthorFallbackStore((s) => s.map);

  useEffect(() => {
    useCommentAuthorFallbackStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (postId == null || detail?.comments == null) return;
    syncCommentRemovalWithServer(postId, detail.comments);
  }, [postId, detail?.comments, syncCommentRemovalWithServer]);

  const isAllChannel = isAllChannelPost(post.channel);

  const author = detail?.author ?? post?.author ?? {};

  const displayContent = useMemo(() => {
    return stripPhotoOnlyPlaceholderForDisplay(detail?.content ?? post?.content ?? "");
  }, [detail?.content, post?.content]);

  const renderContentWithHighlightedHashtags = useMemo(() => {
    if (typeof displayContent !== "string" || displayContent.length === 0) {
      return displayContent;
    }

    const regex = /#[^\s#]+/g;
    const nodes = [];
    let lastIndex = 0;
    let match;
    let segIdx = 0;

    while ((match = regex.exec(displayContent)) != null) {
      const start = match.index;
      const token = match[0];

      if (start > lastIndex) {
        nodes.push(
          <Text key={`t-${segIdx++}-${lastIndex}`}>{displayContent.slice(lastIndex, start)}</Text>,
        );
      }

      nodes.push(
        <Text
          key={`h-${segIdx++}-${start}`}
          style={styles.hashText}
        >
          {token}
        </Text>,
      );

      lastIndex = start + token.length;
    }

    if (lastIndex < displayContent.length) {
      nodes.push(
        <Text key={`t-${segIdx++}-${lastIndex}`}>
          {displayContent.slice(lastIndex)}
        </Text>,
      );
    }

    return nodes;
  }, [displayContent]);

  const scrollRef = useRef(null);

  const [replyTarget, setReplyTarget] = useState(null);
  const [threadActionModal, setThreadActionModal] = useState({
    visible: false,
    targetType: null,
    targetId: null,
  });

  const isMine =
    currentUser?.id != null &&
    post?.author?.userId != null &&
    String(currentUser.id) === String(post.author.userId);

  const deletePostMutation = useDeletePostMutation();

  const [pressedThread, setPressedThread] = useState({
    targetType: null,
    targetId: null,
  });

  const myEmotionTypeFromStore = useUserEmotionSelection(postId);

  /** 상세 GET + 목록에서 넘어온 post + 라우트 initialSelectedEmotionType — 서버 값 우선 근거 */
  const reactionSource = useMemo(() => {
    const base = detail ?? initialPostParam ?? {};
    const fromRoute = normalizeCommunityEmotionType(initialSelectedEmotionType);
    if (!fromRoute) return base;
    if (pickEmotionTypeFromPostCoalesced(base)) return base;
    return { ...base, emotionType: fromRoute };
  }, [detail, initialPostParam, initialSelectedEmotionType]);

  const selectedEmotionType = useMemo(
    () => resolveSelectedEmotionForPost(reactionSource, myEmotionTypeFromStore),
    [reactionSource, myEmotionTypeFromStore],
  );

  const [editTarget, setEditTarget] = useState(null); // { commentId, content }

  const createCommentMutation = useCreateCommentMutation(postId, {
    currentUser,
  });
  const updateCommentMutation = useUpdateCommentMutation(postId);
  const deleteCommentMutation = useDeleteCommentMutation(postId);

  const showDeleteBusy =
    deletePostMutation.isPending || deleteCommentMutation.isPending;
  const deleteBusyMessage = deletePostMutation.isPending
    ? "게시글을 삭제하고 있어요"
    : "댓글을 삭제하고 있어요";

  const toggleCommentLikeMutation = useToggleCommentLikeMutation(postId);
  const toggleEmotionMutation = useTogglePostEmotionMutation(postId);
  const blockUserMutation = useBlockUserMutation();

  const imageList = useMemo(() => {
    const source = detail ?? initialPostParam;
    const imgs = getActivePostImages(source);
    const rows = [];
    for (let idx = 0; idx < imgs.length; idx++) {
      const img = imgs[idx];
      const u =
        typeof img === "string" ? img : img?.imageUrl || img?.url;
      if (!u) continue;
      const id =
        typeof img === "object" && img != null
          ? (img.imageId ?? img.id ?? idx)
          : idx;
      rows.push({
        url: u,
        rowKey: `${postId}-${String(id)}-${idx}`,
      });
    }
    if (rows.length > 0) return rows;
    if (source?.image) {
      return [{ url: source.image, rowKey: `${postId}-legacy-0` }];
    }
    return [];
  }, [detail, initialPostParam, postId]);

  const displayComments = useMemo(
    () =>
      normalizeCommentsForDisplay(
        normalizeCommentAuthorFields(
          detail?.comments ?? initialPostParam?.comments ?? [],
          commentAuthorFallbackMap,
        ),
        {
          postId,
          isHidden: (pid, commentId) =>
            useCommentRemovalStore.getState().isHidden(pid, commentId),
        },
      ),
    [
      detail?.comments,
      initialPostParam?.comments,
      postId,
      hiddenCommentKeys,
      commentAuthorFallbackMap,
    ],
  );

  // 피드(PostCard)에서 넘긴 선택 감정 / 화면 전환 시 동기화

  const openThreadActionModal = ({ targetType, targetId }) => {
    setPressedThread({ targetType, targetId });

    setThreadActionModal({
      visible: true,
      targetType,
      targetId,
    });
  };

  const closeThreadActionModal = () => {
    setThreadActionModal((prev) => ({ ...prev, visible: false }));
    setPressedThread({ targetType: null, targetId: null });
  };

  const handleEditPost = () => {
    navigation.navigate("CreatePost", {
      editPost: detail ?? post,
    });
  };

  const handleDeletePost = () => {
    Alert.alert("게시글 삭제", "이 게시글을 삭제할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          deletePostMutation.mutate(postId, {
            onSuccess: () => {
              navigation.goBack();
            },
            onError: (e) => {
              const msg = getApiErrorMessage(e, "삭제에 실패했습니다.");
              setTimeout(() => Alert.alert("오류", msg), 0);
            },
          });
        },
      },
    ]);
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
    const targetId = threadActionModal.targetId;
    if (targetId == null) return;

    Alert.alert("댓글 삭제", "이 댓글을 삭제할까요?", [
      { text: "취소", style: "cancel", onPress: () => {} },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          closeThreadActionModal();
          deleteCommentMutation.mutate(
            { commentId: targetId },
            {
              onSuccess: () => {
                if (editTarget?.commentId === targetId) setEditTarget(null);
              },
              onError: (err) => {
                Alert.alert(
                  "오류",
                  getApiErrorMessage(err, "댓글 삭제에 실패했습니다."),
                );
              },
            },
          );
        },
      },
    ]);
  };

  const handleCreateComment = (content) => {
    if (!content.trim()) return;

    createCommentMutation.mutate(
      { content, parentId: replyTarget ?? null },
      {
        // 상세 캐시 갱신은 useCreateCommentMutation onSuccess에서 처리 (중복 추가 방지)
        onSuccess: () => {
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
      // 커스텀 탭바(customTabBar)는 MainTabNavigator에만 존재합니다.
      // 따라서 CommunityStack 내부(AllCommunity/TeamCommunity)로 이동하면 탭바가 사라지므로,
      // Root의 `Main`으로 이동시켜 탭바가 유지되도록 합니다.
      if (isAllChannelPost(post.channel)) {
        navigation.replace("Main", {
          screen: "AllCommunity",
          params: { initialSort: "latest" },
        });
      } else {
        navigation.replace("Main", {
          screen: "TeamCommunity",
          params: { initialSort: "latest" },
        });
      }
    } else {
      navigation.goBack();
    }
  };

  const errorScreenHeader = (
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
    />
  );

  if (!postId) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "left", "right", "bottom"]}
      >
        {errorScreenHeader}
        <View style={styles.errorCenter}>
          <AppText variant="middle" style={styles.errorText}>
            게시글을 찾을 수 없습니다
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  const mergedForDeletedCheck = detail ?? initialPostParam ?? null;
  if (mergedForDeletedCheck && isPostDeletedOrHiddenInFeed(mergedForDeletedCheck)) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "left", "right", "bottom"]}
      >
        {errorScreenHeader}
        <View style={styles.errorCenter}>
          <AppText variant="middle" style={styles.errorText}>
            {DELETED_POST_MESSAGE}
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  if (isPostDetailFetched && isPostDetailError && detail == null) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "left", "right", "bottom"]}
      >
        {errorScreenHeader}
        <FetchStateView
          style={{ flex: 1 }}
          isError
          onRetry={() => refetchPostDetail()}
        />
      </SafeAreaView>
    );
  }

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
        />

        <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
          <View style={styles.containerSection}>
            <View style={styles.header}>
              <CommunityUserProfile
                nickname={author.nickname}
                teamCode={author.teamCode}
                createdAt={post.createdAt}
                showTeam={isAllChannel}
                onPress={() => {
                  const targetUserId = author?.userId;
                  if (!targetUserId) return;
                  const isSelf =
                    currentUser?.id != null &&
                    String(currentUser.id) === String(targetUserId);
                  navigation.navigate("Main", {
                    screen: "Profile",
                    params: isSelf
                      ? {}
                      : {
                          screen: "ProfileMain",
                          params: { userId: targetUserId },
                        },
                  });
                }}
                postMenu={
                  isMine
                    ? {
                        onEdit: handleEditPost,
                        onDelete: handleDeletePost,
                      }
                    : undefined
                }
              />
            </View>

            {imageList.length > 0 && (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.imageScroll}
              >
                {imageList.map((entry, index) => {
                  const isSingle = imageList.length === 1;
                  const displayUri = withImageDisplayCacheKey(
                    entry.url,
                    entry.rowKey,
                  );

                  return (
                    <View
                      key={entry.rowKey}
                      style={[
                        styles.imageWrapper,
                        {
                          width: isSingle ? width - 32 : width * 0.7,
                        },
                      ]}
                    >
                      <Image
                        source={{ uri: displayUri }}
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
                  {renderContentWithHighlightedHashtags}
                </AppText>
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
              isAllChannel={isAllChannelPost(post.channel)}
              onPressProfile={(targetUserId) => {
                if (!targetUserId) return;
                const isSelf =
                  currentUser?.id != null &&
                  String(currentUser.id) === String(targetUserId);
                navigation.navigate("Main", {
                  screen: "Profile",
                  params: isSelf
                    ? {}
                    : {
                        screen: "ProfileMain",
                        params: { userId: targetUserId },
                      },
                });
              }}
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

        <Modal visible={showDeleteBusy} transparent animationType="fade">
          <View style={styles.deleteBusyRoot}>
            <ActivityIndicator size="large" color="#F9F9F9" />
            <AppText variant="middle" style={styles.deleteBusyText}>
              {deleteBusyMessage}
            </AppText>
          </View>
        </Modal>

        {threadActionModal.visible && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={closeThreadActionModal}
            />
            <View style={styles.bottomSheet}>
              <TouchableOpacity
                style={styles.bottomSheetButton}
                onPress={handleEditThread}
              >
                <AppText variant="bodyMedium" style={styles.bottomSheetText}>
                  수정하기
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bottomSheetButton}
                onPress={handleDeleteThread}
              >
                <AppText variant="bodyMedium" style={styles.bottomSheetText}>
                  삭제하기
                </AppText>
              </TouchableOpacity>
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
    backgroundColor: "#232323",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  bottomSheetText: {
    color: "#F9F9F9",
  },
  deleteBusyRoot: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  deleteBusyText: {
    color: "#F9F9F9",
    marginTop: 16,
    textAlign: "center",
  },
  errorCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    color: "rgba(228, 228, 228, 0.85)",
    textAlign: "center",
  },
});
