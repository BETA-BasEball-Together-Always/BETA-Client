import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppText } from "../../../../../shared/theme/components/AppText";
import { TEAM_DATA } from "../../../../../shared/constants/teams";
import { getRelativeTimeForPostBody } from "../../../../community/screens/PostDetail/utils/relativeTime";
import MenuIcon from "../../../../community/assets/svg/TopBar/menuIcon.svg";
import { useUserStore } from "../../../../../shared/store/userStore";

import { useTogglePostEmotionMutation } from "../../../../community/services/emotionMutations";
import { useUserEmotionSelection } from "../../../../community/store/userEmotionSelectionStore";
import { useDeletePostMutation } from "../../../../community/services/post/deletePostMutation";

import PostReactions from "../../../../community/component/PostReactions";
import {
  resolveCommunityPostId,
  resolveSelectedEmotionForPost,
} from "../../../../community/constants/communityReactions";
import { isAllChannelPost } from "../../../../community/utils/communityChannel";
import { getApiErrorMessage } from "../../../../../shared/utils/apiErrorMessage";
import { isOfflineError } from "../../../../../shared/utils/networkErrors";
import {
  DELETED_POST_MESSAGE,
  getActivePostImages,
  getPostListUnavailableBody,
} from "../../../../community/utils/communityPostVisibility";
import { useSoftDeletedPostStore } from "../../../../community/store/softDeletedPostStore";
import { useNavigation } from "@react-navigation/native";

const AVATAR_SIZE = 35;
const AVATAR_ICON = 25;
const POPULAR_CARD_WIDTH = 229;
const POPULAR_CARD_HEIGHT = 285;
const POST_MENU_WIDTH = 170;

const PopularPostCard = ({ post }) => {
  const navigation = useNavigation();
  const { user: currentUser } = useUserStore();
  const deletePostMutation = useDeletePostMutation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);

  const tombstoned = useSoftDeletedPostStore((s) => {
    const exp = s.entries[String(post?.postId)];
    return typeof exp === "number" && exp > Date.now();
  });
  const listUnavailableBody = useMemo(
    () => getPostListUnavailableBody(post, { tombstoned }),
    [post, tombstoned],
  );
  const showAsUnavailable = listUnavailableBody != null;

  const resolvedPostId = resolveCommunityPostId(post);

  const authorUserId = post?.author?.userId;
  const isOwnPost =
    currentUser?.id != null &&
    authorUserId != null &&
    String(currentUser.id) === String(authorUserId);

  const postMenu =
    !showAsUnavailable && isOwnPost && authorUserId != null
      ? {
          onEdit: () => {
            navigation.navigate("Community", {
              screen: "CreatePost",
              params: { editPost: post },
            });
          },
          onDelete: () => {
            Alert.alert("게시글 삭제", "이 게시글을 삭제할까요?", [
              { text: "취소", style: "cancel" },
              {
                text: "삭제",
                style: "destructive",
                onPress: () => {
                  deletePostMutation.mutate(resolvedPostId, {
                    onError: (e) => {
                      if (isOfflineError(e)) return;
                      const msg = getApiErrorMessage(e, "삭제에 실패했습니다.");
                      if (msg == null) return;
                      setTimeout(() => Alert.alert("오류", msg), 0);
                    },
                  });
                },
              },
            ]);
          },
        }
      : undefined;

  const storeEmotion = useUserEmotionSelection(resolvedPostId);
  const selectedEmotionType = useMemo(
    () => resolveSelectedEmotionForPost(post, storeEmotion),
    [post, storeEmotion],
  );

  const toggleEmotionMutation = useTogglePostEmotionMutation(resolvedPostId);

  const isDeletingThis =
    deletePostMutation.isPending &&
    deletePostMutation.variables === resolvedPostId;

  const reactionPost = useMemo(
    () => ({
      ...post,
      postId: resolvedPostId ?? post.postId ?? post.id,
      id: resolvedPostId ?? post.postId ?? post.id,
      comments: post.commentCount,
      reactionCounts: {
        LIKE: post.emotions?.likeCount ?? 0,
        SAD: post.emotions?.sadCount ?? 0,
        FUN: post.emotions?.funCount ?? 0,
        HYPE: post.emotions?.hypeCount ?? 0,
      },
    }),
    [post, resolvedPostId],
  );

  const renderContentWithHighlightedHashtags = (content) => {
    if (typeof content !== "string") return content;
    const regex = /#[^\s#]+/g;
    const nodes = [];
    let lastIndex = 0;
    let match;
    let segIdx = 0;

    while ((match = regex.exec(content)) != null) {
      const start = match.index;
      const token = match[0];

      if (start > lastIndex) {
        nodes.push(
          <Text key={`c-${segIdx++}-${lastIndex}`}>
            {content.slice(lastIndex, start)}
          </Text>,
        );
      }

      nodes.push(
        <Text key={`h-${segIdx++}-${start}`} style={styles.inlineHashtagText}>
          {token}
        </Text>,
      );

      lastIndex = start + token.length;
    }

    if (lastIndex < content.length) {
      nodes.push(
        <Text key={`c-${segIdx++}-${lastIndex}`}>
          {content.slice(lastIndex)}
        </Text>,
      );
    }

    return nodes;
  };

  const primaryImageUri = useMemo(() => {
    const first = getActivePostImages(post)[0];
    return first?.imageUrl || first?.url || null;
  }, [post]);

  const showCardImage = !showAsUnavailable && !!primaryImageUri;
  const extraImageCount = useMemo(() => {
    const n = getActivePostImages(post)?.length ?? 0;
    return Math.max(n - 1, 0);
  }, [post]);

  const teamCode = post?.author?.teamCode;
  const team = TEAM_DATA[teamCode];
  const ProfileIcon = team?.ProfileIcon;

  const closeMenu = () => setMenuOpen(false);
  const runThenClose = (fn) => {
    closeMenu();
    requestAnimationFrame(() => fn?.());
  };

  const handlePressPost = () => {
    if (showAsUnavailable) {
      setTimeout(() => {
        Alert.alert("알림", listUnavailableBody ?? DELETED_POST_MESSAGE);
      }, 0);
      return;
    }
    navigation.navigate("Community", {
      screen: "PostDetail",
      params: { post, initialSelectedEmotionType: selectedEmotionType },
    });
  };

  const handlePressProfile = () => {
    const targetUserId = post?.author?.userId;
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
  };

  const showTeam = isAllChannelPost(post.channel);

  return (
    <View style={styles.card}>
      {isDeletingThis && (
        <View style={styles.deletingOverlay}>
          <ActivityIndicator color="#F9F9F9" />
          <AppText variant="labelSmall" style={styles.deletingText}>
            게시글을 삭제하고 있어요
          </AppText>
        </View>
      )}

      <View style={styles.profileRow}>
        <Pressable
          style={[styles.profileMain, postMenu && styles.profileMainFlex]}
          onPress={handlePressProfile}
        >
          <LinearGradient
            colors={team?.gradient?.colors || ["#3A3D44", "#3A3D44"]}
            locations={team?.gradient?.locations}
            start={team?.gradient?.start}
            end={team?.gradient?.end}
            style={styles.avatarCircle}
          >
            {ProfileIcon ? (
              <ProfileIcon width={AVATAR_ICON} height={AVATAR_ICON} />
            ) : (
              <AppText variant="spaced" style={styles.avatarFallback}>
                {post.author?.nickname?.[0]}
              </AppText>
            )}
          </LinearGradient>

          <View style={styles.profileText}>
            <View style={styles.nameRow}>
              <AppText
                variant="spaced"
                style={styles.profileNickname}
                numberOfLines={1}
              >
                {post.author?.nickname}
              </AppText>
              {showTeam && teamCode && team ? (
                <View
                  style={[
                    styles.compactTeamBadge,
                    {
                      backgroundColor:
                        team.labelStyle?.backgroundColor ??
                        "rgba(60,60,60,0.5)",
                    },
                    Platform.OS === "ios"
                      ? styles.teamBadgeShadowIOS
                      : styles.teamBadgeShadowAndroid,
                  ]}
                >
                  <AppText
                    style={[
                      styles.compactTeamText,
                      { color: team.labelStyle?.color ?? "#CCC" },
                    ]}
                    numberOfLines={1}
                  >
                    {team.label}
                  </AppText>
                </View>
              ) : null}
            </View>
            {post.createdAt ? (
              <AppText variant="numSmallRegular" style={styles.profileTime}>
                {getRelativeTimeForPostBody(post.createdAt)}
              </AppText>
            ) : null}
          </View>
        </Pressable>

        {postMenu ? (
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={(e) => {
              e.target.measure((x, y, width, height, pageX, pageY) => {
                setMenuPosition({ x: pageX, y: pageY, width, height });
                setMenuOpen(true);
              });
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="게시글 메뉴"
          >
            <MenuIcon width={15} height={15} />
          </TouchableOpacity>
        ) : null}
      </View>

      {postMenu ? (
        <Modal
          transparent
          visible={menuOpen}
          animationType="fade"
          onRequestClose={closeMenu}
        >
          <View style={styles.modalRoot}>
            <Pressable style={styles.modalBackdrop} onPress={closeMenu} />
            <View
              style={[
                styles.postMoreMenu,
                menuPosition && {
                  position: "absolute",
                  top: menuPosition.y + menuPosition.height,
                  left: Math.max(
                    8,
                    menuPosition.x + menuPosition.width - POST_MENU_WIDTH,
                  ),
                },
              ]}
            >
              <TouchableOpacity
                style={styles.postMoreButton}
                onPress={() => runThenClose(postMenu.onEdit)}
              >
                <AppText variant="semi16" style={styles.postMoreText}>
                  수정
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.postMoreButton}
                onPress={() => runThenClose(postMenu.onDelete)}
              >
                <AppText variant="semi16" style={styles.postMoreText}>
                  삭제
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : null}

      <TouchableOpacity
        style={styles.bodyPress}
        onPress={handlePressPost}
        activeOpacity={0.8}
      >
        {showCardImage ? (
          <View style={styles.imageFrame}>
            <Image source={{ uri: primaryImageUri }} style={styles.image} />
            {extraImageCount > 0 ? (
              <View style={styles.imageCountBadge} pointerEvents="none">
                <AppText variant="middle" style={styles.imageCountBadgeText}>
                  +{extraImageCount}
                </AppText>
              </View>
            ) : null}
          </View>
        ) : null}

        <View
          style={[
            styles.contentBlock,
            !showCardImage && styles.contentBlockNoImage,
          ]}
        >
          <AppText
            variant="spaced"
            numberOfLines={2}
            ellipsizeMode="tail"
            style={[
              styles.content,
              showAsUnavailable && styles.unavailableText,
            ]}
          >
            {showAsUnavailable
              ? (listUnavailableBody ?? DELETED_POST_MESSAGE)
              : renderContentWithHighlightedHashtags(post.content)}
          </AppText>
        </View>
      </TouchableOpacity>

      {!showAsUnavailable ? (
        <View style={styles.reactionsSlot}>
          <PostReactions
            post={reactionPost}
            selectedEmotionType={selectedEmotionType}
            isEmotionPending={toggleEmotionMutation.isPending}
            onToggleEmotion={(_postId, emotionType) => {
              if (!emotionType) return;
              toggleEmotionMutation.mutate({ emotionType });
            }}
            onSelectReaction={(_, reaction) => {
              if (!reaction) return;
              toggleEmotionMutation.mutate({
                emotionType: reaction.id,
              });
            }}
            onCommentPress={() => {
              navigation.navigate("Community", {
                screen: "PostDetail",
                params: {
                  post,
                  initialSelectedEmotionType: selectedEmotionType,
                  focusCommentInput: true,
                },
              });
            }}
            compact
            likeOnlyInteraction
            disableLongPressPicker
            suppressCommentModeToggle
          />
        </View>
      ) : null}
    </View>
  );
};

export default PopularPostCard;

const styles = StyleSheet.create({
  card: {
    width: POPULAR_CARD_WIDTH,
    height: POPULAR_CARD_HEIGHT,
    backgroundColor: "rgba(63, 63, 63, 0.30)",
    borderRadius: 20,
    marginRight: 8,
    paddingVertical: 16,
    paddingHorizontal: 13,
    marginBottom: 25,
    position: "relative",
    overflow: "hidden",
    flexDirection: "column",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  profileMain: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileMainFlex: {
    flex: 1,
    marginRight: 6,
  },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5.4,
    overflow: "hidden",
  },
  avatarFallback: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  profileText: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
  },
  profileNickname: {
    color: "#F9F9F9",
    lineHeight: 17,
    marginRight: 4,
    flexShrink: 1,
  },

  compactTeamBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    maxWidth: 120,
  },
  compactTeamText: {
    fontSize: 11,
    lineHeight: 13.5,
  },
  teamBadgeShadowIOS: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  teamBadgeShadowAndroid: {
    elevation: 2,
  },
  profileTime: {
    color: "#A1A1AA",
    fontSize: 10,
    marginTop: 1.59,
    lineHeight: 12,
  },
  menuBtn: {
    padding: 2,
  },
  modalRoot: {
    flex: 1,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  postMoreMenu: {
    position: "absolute",
    backgroundColor: "#27272A",
    borderRadius: 10,
    paddingVertical: 4,
    width: POST_MENU_WIDTH,
  },
  postMoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    alignItems: "center",
  },
  postMoreText: {
    color: "#F9F9F9",
    lineHeight: 22,
  },
  bodyPress: {
    flex: 1,
    minHeight: 0,
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  reactionsSlot: {
    flexShrink: 0,
    marginTop: "auto",
  },
  deletingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 8,
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  deletingText: {
    color: "#F9F9F9",
    marginTop: 8,
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 96,
    borderRadius: 10,
    marginBottom: 4,
    marginTop: 6,
    flexShrink: 0,
  },
  imageFrame: {
    position: "relative",
  },
  imageCountBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    minWidth: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  imageCountBadgeText: {
    color: "#EAEAEA",
    lineHeight: 16,
  },
  /** 본문만 좌우 12 — marginBottom 대신 이미지/블록 간격으로 간격 조절 */
  contentBlock: {
    flex: 1,
    minHeight: 0,
    paddingTop: 5,
    justifyContent: "flex-start",
  },
  contentBlockNoImage: {
    paddingTop: 0,
  },
  content: {
    color: "#F9F9F9",
    lineHeight: 15,
  },
  // Inline "#태그" 강조용 (Home 인기 카드)
  inlineHashtagText: {
    color: "#6F9D48",
    fontSize: 13,
    fontFamily: "NotoSansKR-Medium",
  },
  unavailableText: {
    color: "rgba(228, 228, 228, 0.55)",
  },
});
