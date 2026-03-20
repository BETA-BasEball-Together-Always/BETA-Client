import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, Modal, Pressable } from "react-native";
import { AppText } from "../../../shared/theme/components/AppText";
import { toUiEmotionType } from "../utils/emotionTypeMap";
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
  // 현재 “내가 고른 감정”은 부모(selectedEmotionType)가 유일한 source of truth
  const currentEmotionUiId = useMemo(() => {
    const ui =
      toUiEmotionType(selectedEmotionType) ?? selectedEmotionType ?? null;
    if (!ui) return null;
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
    setShowReactionPicker((prev) => !prev);
  };

  const handleReactionSelect = (reaction) => {
    if (isEmotionPending) return;

    setShowReactionPicker(false);

    console.log("[emotion picker] select", {
      postId: post?.postId,
      reactionUiId: reaction.id,
      requestEmotionType: reaction.id, // emotionMutations.js에서 toApiEmotionType으로 매핑됨
      parentSelectedEmotionUiId: selectedEmotionType,
    });

    if (typeof onSelectReaction === "function") {
      onSelectReaction(post.id, reaction);
    } else if (typeof onToggleEmotion === "function") {
      onToggleEmotion(reaction.id);
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

  // ReactionPicker 위치 조정 포인트:
  // anchorBottom이 클수록 피커가 더 “위로” 뜹니다(덜 가려짐).
  // 더 아래로 원하면 비율을 낮추거나 -offset을 적용하세요.
  // 위치 조정: anchorBottom이 클수록 피커가 더 위로 뜹니다.
  // 사용자가 버튼(하트/댓글) 위 영역을 가린 채로 피커가 뜨길 원하므로 약간 더 아래로 내림.
  // 피커 위치는 반드시 고정(요청한 UI와 동일한 위치)
  // anchorBottom은 ReactionPicker에서 style.bottom으로 직접 쓰이므로,
  // 기본값(52px)에서 흔들리면 터치 타겟이 어긋날 수 있습니다.
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
            onLongLikePress={() => {
              if (!isEmotionPending) setShowReactionPicker(true);
            }}
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
