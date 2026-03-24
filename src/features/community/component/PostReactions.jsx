import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import { AppText } from "../../../shared/theme/components/AppText";
import {
  COMMUNITY_REACTIONS,
  normalizeCommunityEmotionType,
  pickEmotionTypeFromPostCoalesced,
  resolveCommunityPostId,
} from "../constants/communityReactions";
import ReactionSummary from "./ReactionSummary";
import ReactionPicker from "./ReactionPicker";
import PostActionBar from "./PostActionBar";

/** Modal에 올릴 피커 바(대략 높이) — measure 실패 시 top 보정용 */
const PICKER_BAR_APPROX_H = 48;

const getReactionCountsFromPost = (post) => {
  // mutation cache는 `emotions`만 갱신하는데,
  // `reactionCounts`가 남아있으면 UI가 stale 값으로 렌더될 수 있어
  // 항상 우선순위를 `post.emotions`에 둔다.
  const emotions = post?.emotions;
  if (emotions) {
    return {
      LIKE: emotions.likeCount ?? 0,
      SAD: emotions.sadCount ?? 0,
      FUN: emotions.funCount ?? 0,
      HYPE: emotions.hypeCount ?? 0,
    };
  }

  // 혹시 서버 응답에 emotions이 없을 때만 fallback
  if (post?.reactionCounts) return { ...post.reactionCounts };

  return { LIKE: 0, SAD: 0, FUN: 0, HYPE: 0 };
};

const PostReactions = ({
  post,
  selectedEmotionType,
  onSelectReaction,
  onToggleEmotion,
  onCommentPress,
  isEmotionPending = false,
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [pickerAnchor, setPickerAnchor] = useState(null);

  const actionSlotRef = useRef(null);

  const pickerOpen = showReactionPicker && !isEmotionPending;
  const longPressJustTriggeredRef = useRef(false);

  const reactionCounts = useMemo(
    () => getReactionCountsFromPost(post),
    [
      post?.reactionCounts,
      post?.emotions?.likeCount,
      post?.emotions?.sadCount,
      post?.emotions?.funCount,
      post?.emotions?.hypeCount,
    ],
  );

  const totalReactions = useMemo(
    () => Object.values(reactionCounts).reduce((sum, val) => sum + val, 0),
    [reactionCounts],
  );
  const currentEmotionUiId = useMemo(() => {
    const fromPost = pickEmotionTypeFromPostCoalesced(post);
    if (fromPost && COMMUNITY_REACTIONS.some((r) => r.id === fromPost)) {
      return fromPost;
    }
    const fromProp = normalizeCommunityEmotionType(selectedEmotionType);
    if (fromProp && COMMUNITY_REACTIONS.some((r) => r.id === fromProp)) {
      return fromProp;
    }
    if (selectedEmotionType === null) return null;
    return null;
  }, [selectedEmotionType, post]);

  const pickerSelectedReaction = useMemo(
    () => COMMUNITY_REACTIONS.find((r) => r.id === currentEmotionUiId) ?? null,
    [currentEmotionUiId],
  );

  const [commentMode, setCommentMode] = useState(false);
  const [linkPressed, setLinkPressed] = useState(false);
  const [copyModalVisible, setCopyModalVisible] = useState(false);

  const heartSelected = Boolean(currentEmotionUiId);

  const handleLikePress = () => {
    if (isEmotionPending) return;
    // long-press 직후 RN이 onPress를 함께 호출하는 케이스를 방어
    if (longPressJustTriggeredRef.current) return;

    const uiEmotionToToggle =
      currentEmotionUiId ??
      (selectedEmotionType === null
        ? COMMUNITY_REACTIONS[0]?.id
        : pickEmotionTypeFromPostCoalesced(post) ??
          COMMUNITY_REACTIONS[0]?.id);
    setShowReactionPicker(false);
    setPickerAnchor(null);
    longPressJustTriggeredRef.current = false;

    const togglePostId = resolveCommunityPostId(post) ?? post?.postId;
    onToggleEmotion?.(togglePostId, uiEmotionToToggle);
  };

  const handleLongLikePress = () => {
    if (isEmotionPending) return;
    longPressJustTriggeredRef.current = true;
    setPickerAnchor(null);
    requestAnimationFrame(() => {
      actionSlotRef.current?.measureInWindow((x, y, width, height) => {
        setPickerAnchor({ x, y, width, height });
        setShowReactionPicker(true);
      });
    });
    setTimeout(() => {
      longPressJustTriggeredRef.current = false;
    }, 250);
  };

  const handleReactionSelect = (reaction) => {
    if (isEmotionPending) return;

    setShowReactionPicker(false);
    setPickerAnchor(null);
    longPressJustTriggeredRef.current = false;

    console.log("[emotion picker] select", {
      postId: post?.postId,
      reactionEmotionType: reaction.id,
      requestEmotionType: reaction.id,
      parentSelectedEmotionType: selectedEmotionType,
    });

    if (typeof onSelectReaction === "function") {
      onSelectReaction(post?.postId, reaction);
    }
  };

  const handleCommentPress = () => {
    setCommentMode((prev) => !prev);
    onCommentPress?.();
  };

  const handleCopyLink = async () => {
    setLinkPressed(true);
    setCopyModalVisible(true);

    setTimeout(() => {
      setLinkPressed(false);
      setCopyModalVisible(false);
    }, 1500);
  };

  const commentCount = post.commentCount ?? post.comments?.length ?? 0;

  useEffect(() => {
    if (!showReactionPicker) setPickerAnchor(null);
  }, [showReactionPicker]);

  return (
    <>
      <View style={styles.reactionBlock}>
        <View style={styles.summaryLayer}>
          <ReactionSummary
            reactions={COMMUNITY_REACTIONS}
            reactionCounts={reactionCounts}
            totalReactions={totalReactions}
            commentCount={commentCount}
            style={styles.summaryTightTop}
            hideReactionStrip={totalReactions === 0}
          />
        </View>

        <View
          ref={actionSlotRef}
          style={styles.actionSlot}
          collapsable={Platform.OS === "android" ? false : undefined}
        >
          <PostActionBar
            selected={heartSelected}
            commentMode={commentMode}
            linkPressed={linkPressed}
            onLikePress={handleLikePress}
            onLongLikePress={handleLongLikePress}
            onCommentPress={handleCommentPress}
            onCopyPress={handleCopyLink}
            likeDisabled={isEmotionPending}
          />
        </View>
      </View>

      <Modal
        transparent
        visible={pickerOpen && pickerAnchor != null}
        animationType="fade"
        onRequestClose={() => {
          setShowReactionPicker(false);
          setPickerAnchor(null);
        }}
      >
        <Pressable
          style={[StyleSheet.absoluteFillObject, styles.pickerModalBackdrop]}
          onPress={() => {
            setShowReactionPicker(false);
            setPickerAnchor(null);
          }}
        />
        {pickerAnchor ? (
          <View
            pointerEvents="box-none"
            style={[
              styles.pickerModalSlot,
              {
                left: Math.max(
                  8,
                  pickerAnchor.x +
                    pickerAnchor.width / 2 -
                    260 / 1.5,
                ),
                top: pickerAnchor.y - PICKER_BAR_APPROX_H - 8,
              },
            ]}
          >
            <ReactionPicker
              inline
              reactions={COMMUNITY_REACTIONS}
              selectedReaction={pickerSelectedReaction}
              onSelect={handleReactionSelect}
            />
          </View>
        ) : null}
      </Modal>

      <Modal transparent visible={copyModalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <AppText variant="middle" className="text-white">
              URL이 클립보드에 복사되었습니다
            </AppText>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default PostReactions;

const styles = StyleSheet.create({
  reactionBlock: {
    position: "relative",
    overflow: "visible",
  },
  summaryLayer: {
    zIndex: 1,
  },
  summaryTightTop: {
    marginTop: 19,
    marginHorizontal: 4,
  },
  pickerModalBackdrop: {
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  pickerModalSlot: {
    position: "absolute",
    zIndex: 20,
  },
  actionSlot: {
    position: "relative",
    zIndex: 12,
    overflow: "visible",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(18,18,18,0.4)",
  },
  modalBox: {
    backgroundColor: "#232323",
    paddingVertical: 14,
    paddingHorizontal: 21,
    borderRadius: 10,
  },
});
