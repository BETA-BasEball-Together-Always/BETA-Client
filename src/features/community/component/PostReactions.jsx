import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, Modal, Pressable } from "react-native";
import { AppText } from "../../../shared/theme/components/AppText";
import { COMMUNITY_REACTIONS } from "../constants/communityReactions";
import ReactionSummary from "./ReactionSummary";
import ReactionPicker from "./ReactionPicker";
import PostActionBar from "./PostActionBar";

const DEFAULT_ACTION_BAR_H = 52;

const getReactionCountsFromPost = (post) => {
  if (post?.reactionCounts) return { ...post.reactionCounts };

  const emotions = post?.emotions ?? {};
  return {
    EMO_JOY: emotions.likeCount ?? 0,
    EMO_SAD: emotions.sadCount ?? 0,
    EMO_FUN: emotions.funCount ?? 0,
    EMO_HYPE: emotions.hypeCount ?? 0,
  };
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

    const uiEmotionToToggle = currentEmotionUiId ?? "EMO_JOY";
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
      reactionUiId: reaction.id,
      requestEmotionType: reaction.id, // emotionMutations.js에서 toApiEmotionType으로 매핑됨
      parentSelectedEmotionUiId: selectedEmotionType,
    });

    if (typeof onSelectReaction === "function") {
      const prevEmotionUiId = currentEmotionUiId;
      onSelectReaction(post?.postId, reaction, {
        prevEmotionType: prevEmotionUiId,
        // "교체"가 서버에서 제대로 일어나지 않는 케이스 보정용 스냅샷
        prevEmotionCountBefore: prevEmotionUiId
          ? reactionCounts?.[prevEmotionUiId] ?? 0
          : 0,
      });
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
