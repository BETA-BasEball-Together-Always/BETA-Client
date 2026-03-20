import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, Modal, Pressable } from "react-native";
import { AppText } from "../../../shared/theme/components/AppText";
import { COMMUNITY_REACTIONS } from "../constants/communityReactions";
import ReactionSummary from "./ReactionSummary";
import ReactionPicker from "./ReactionPicker";
import PostActionBar from "./PostActionBar";

const DEFAULT_ACTION_BAR_H = 52;

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
  const [actionBarHeight, setActionBarHeight] = useState(DEFAULT_ACTION_BAR_H);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

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
    const ui = selectedEmotionType ?? null;
    return COMMUNITY_REACTIONS.some((r) => r.id === ui) ? ui : null;
  }, [selectedEmotionType]);

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

    const uiEmotionToToggle = currentEmotionUiId ?? COMMUNITY_REACTIONS[0]?.id;
    setShowReactionPicker(false);
    longPressJustTriggeredRef.current = false;

    onToggleEmotion?.(post?.postId, uiEmotionToToggle);
  };

  const handleLongLikePress = () => {
    if (isEmotionPending) return;
    longPressJustTriggeredRef.current = true;
    setShowReactionPicker(true);
    setTimeout(() => {
      longPressJustTriggeredRef.current = false;
    }, 250);
  };

  const handleReactionSelect = (reaction) => {
    if (isEmotionPending) return;

    setShowReactionPicker(false);
    // picker에서 선택하면 long-press 디바운스 플래그를 즉시 해제
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

  const anchorBottom = DEFAULT_ACTION_BAR_H;

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

        {pickerOpen && (
          <Pressable
            style={[StyleSheet.absoluteFillObject, styles.pickerBackdrop]}
            onPress={() => setShowReactionPicker(false)}
          />
        )}

        <View
          style={styles.actionSlot}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0) setActionBarHeight(h);
          }}
        >
          {pickerOpen && (
            <ReactionPicker
              reactions={COMMUNITY_REACTIONS}
              selectedReaction={pickerSelectedReaction}
              onSelect={handleReactionSelect}
              anchorBottom={anchorBottom}
            />
          )}
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
  pickerBackdrop: {
    zIndex: 8,
    backgroundColor: "rgba(0,0,0,0.12)",
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
