import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
} from "react-native";
import { AppText } from "../../../../../shared/theme/components/AppText";

import HeartIcon from "../../../assets/svg/CommunityPost/heartIcon.svg";
import HeartFilledIcon from "../../../assets/svg/CommunityPost/heartFilledIcon.svg";
import CommentIcon from "../../../assets/svg/CommunityPost/commentIcon.svg";
import CommentOnPressIcon from "../../../assets/svg/CommunityPost/commentOnPressIcon.svg";
import LinkIcon from "../../../assets/svg/CommunityPost/linkIcon.svg";
import LinkOnPressIcon from "../../../assets/svg/CommunityPost/linkOnPressIcon.svg";

// import * as Clipboard from "expo-clipboard";

const REACTION_HEIGHT = 25;

const reactions = [
  { id: "EMO_JOY", emoji: "💖", bgColor: "#FFBDBD" },
  { id: "EMO_SAD", emoji: "😭", bgColor: "#C2EFFF" },
  { id: "EMO_FUN", emoji: "🤣", bgColor: "#FFFABF" },
  { id: "EMO_HYPE", emoji: "🔥", bgColor: "#FF9F76" },
];

const PostReactions = ({ post, onSelectReaction }) => {
  const [actionY, setActionY] = useState(0);

  const [selectedReaction, setSelectedReaction] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const [reactionCounts, setReactionCounts] = useState(
    post.reactionCounts || {
      EMO_JOY: 0,
      EMO_SAD: 0,
      EMO_FUN: 0,
      EMO_HYPE: 0,
    },
  );

  const totalReactions = useMemo(
    () => Object.values(reactionCounts).reduce((sum, val) => sum + val, 0),
    [reactionCounts],
  );

  const [commentMode, setCommentMode] = useState(false);
  const [linkPressed, setLinkPressed] = useState(false);
  const [copyModalVisible, setCopyModalVisible] = useState(false);

  const handleLikePress = () => {
    setShowReactionPicker((prev) => !prev);
  };

  const handleReactionSelect = (reaction) => {
    const prevReaction = selectedReaction;

    // 같은 리액션을 다시 누르면 제거
    if (prevReaction?.id === reaction.id) {
      setReactionCounts((prevCounts) => ({
        ...prevCounts,
        [reaction.id]: Math.max(prevCounts[reaction.id] - 1, 0),
      }));

      setSelectedReaction(null);
      setShowReactionPicker(false);

      if (onSelectReaction) {
        onSelectReaction(post.id, null);
      }

      return;
    }

    // 다른 리액션에서 변경되는 경우, 이전 리액션 카운트 감소
    if (prevReaction) {
      setReactionCounts((prevCounts) => ({
        ...prevCounts,
        [prevReaction.id]: Math.max(prevCounts[prevReaction.id] - 1, 0),
      }));
    }

    // 새 리액션 카운트 증가
    setReactionCounts((prevCounts) => ({
      ...prevCounts,
      [reaction.id]: prevCounts[reaction.id] + 1,
    }));

    setSelectedReaction(reaction);
    setShowReactionPicker(false);

    if (onSelectReaction) {
      onSelectReaction(post.id, reaction);
    }
  };

  const handleCommentPress = () => {
    setCommentMode((prev) => !prev);
  };

  const handleCopyLink = async () => {
    // 추후 Clipboard 연동 시 주석 해제
    // await Clipboard.setStringAsync(post.uri ?? "https://example.com");
    setLinkPressed(true);
    setCopyModalVisible(true);

    setTimeout(() => {
      setLinkPressed(false);
      setCopyModalVisible(false);
    }, 1500);
  };

  const hasReactions = totalReactions > 0;

  return (
    <>
      <View style={styles.reactionWrapper}>
        {/* 공감 리스트 */}
        <View style={styles.reactionSummary}>
          {hasReactions && (
            <View style={styles.reactionIconRow}>
              {reactions.map((reaction) =>
                reactionCounts[reaction.id] > 0 ? (
                  <View
                    key={reaction.id}
                    style={[
                      styles.summaryCircle,
                      { backgroundColor: reaction.bgColor },
                    ]}
                  >
                    <AppText style={styles.summaryEmoji}>
                      {reaction.emoji}
                    </AppText>
                  </View>
                ) : null,
              )}
              <AppText variant="numMediumRegular" className="text-gray-400">
                {totalReactions}
              </AppText>
            </View>
          )}

          <AppText
            variant="numMediumRegular"
            className="text-gray-400"
            style={!hasReactions && styles.commentOnly}
          >
            댓글 {post.comments ?? 0}
          </AppText>
        </View>

        {/* 🔥 리액션 바 오버레이 */}
        {showReactionPicker && (
          <>
            {/* 바깥 터치 시 닫기 */}
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setShowReactionPicker(false)}
            />

            <View
              style={[
                styles.reactionOverlay,
                { top: actionY - REACTION_HEIGHT },
              ]}
            >
              <View style={styles.reactionBar}>
                {reactions.map((reaction) => {
                  const isSelected = selectedReaction?.id === reaction.id;
                  return (
                    <TouchableOpacity
                      key={reaction.id}
                      onPress={() => handleReactionSelect(reaction)}
                    >
                      <View
                        style={[
                          styles.reactionCircle,
                          { backgroundColor: reaction.bgColor },
                          selectedReaction && !isSelected && styles.dimmed,
                        ]}
                      >
                        <AppText style={styles.reactionEmoji}>
                          {reaction.emoji}
                        </AppText>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </View>

      <View style={styles.actionContainer}>
        <View
          style={styles.actionRow}
          onLayout={(e) => {
            setActionY(e.nativeEvent.layout.y);
          }}
        >
          <View style={styles.leftActions}>
            {/* 좋아요 */}
            <TouchableOpacity
              onPress={handleLikePress}
              onLongPress={() => setShowReactionPicker(true)}
              activeOpacity={0.7}
            >
              {selectedReaction ? (
                <HeartFilledIcon width={31.3} height={27} />
              ) : (
                <HeartIcon width={31.3} height={27} />
              )}
            </TouchableOpacity>

            {/* 댓글 */}
            <TouchableOpacity onPress={handleCommentPress}>
              {commentMode ? (
                <CommentOnPressIcon width={25} height={25} />
              ) : (
                <CommentIcon width={25} height={25} />
              )}
            </TouchableOpacity>
          </View>

          {/* URL 복사 */}
          <TouchableOpacity onPress={handleCopyLink}>
            {linkPressed ? (
              <LinkOnPressIcon width={22} height={22} />
            ) : (
              <LinkIcon width={22} height={22} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal transparent visible={copyModalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <AppText variant="middle">URL이 클립보드에 복사되었습니다</AppText>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default PostReactions;

const styles = StyleSheet.create({
  reactionWrapper: {
    position: "relative",
  },
  reactionSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 19,
    minHeight: 26,
    marginHorizontal: 4,
  },
  reactionIconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentOnly: {
    marginLeft: "auto",
  },
  summaryCircle: {
    width: 25,
    height: 25,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 7,
    gap: 7,
  },
  summaryEmoji: {
    fontSize: 13.5,
  },
  reactionEmoji: {
    fontSize: 18,
  },
  reactionOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: "flex-start",
  },
  reactionBar: {
    flexDirection: "row",
    backgroundColor: "#D9D9D9",
    borderRadius: 30,
    paddingVertical: 5.5,
    alignSelf: "flex-start",
  },
  reactionCircle: {
    width: 50,
    height: 48,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  dimmed: {
    opacity: 0.3,
  },
  // actionContainer: {},
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    marginHorizontal: 5,
  },
  leftActions: {
    flexDirection: "row",
    gap: 25,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
  },
});
