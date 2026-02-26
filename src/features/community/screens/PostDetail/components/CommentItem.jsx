import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { AppText } from "../../../../../shared/theme/components/AppText";
import HeartIcon from "../../../assets/svg/CommunityPost/heartIcon.svg";
import HeartFilledIcon from "../../../assets/svg/CommunityPost/heartFilledIcon.svg";
import HeartOnPressIcon from "../../../assets/svg/CommunityPost/heartOnPressIcon.svg";
import ReplyIcon from "../../../assets/svg/CommunityPost/replyIcon.svg";
import ReplyItem from "./ReplyItem";
import { getRelativeTime } from "../utils/relativeTime";

const HEART_SIZE = 20;

export default function CommentItem({ comment, onReplyPress, setCommentData }) {
  const [showReplies, setShowReplies] = useState(false);
  const [heartPressed, setHeartPressed] = useState(false);

  const toggleLike = () => {
    setCommentData((prev) => ({
      ...prev,
      comments: prev.comments.map((c) =>
        c.commentId === comment.commentId
          ? {
              ...c,
              isLiked: !c.isLiked,
              likeCount: c.isLiked ? c.likeCount - 1 : c.likeCount + 1,
            }
          : c,
      ),
    }));
  };

  return (
    <View style={styles.container}>
      {/* 상단 (프로필 이미지 / 닉네임 | 경과 시간 맨 우측) */}
      <View style={styles.row}>
        <View style={styles.avatarCircle}>
          <AppText variant="middle" className="text-white">
            {comment.author.nickName?.[0] ?? "유"}
          </AppText>
        </View>

        <View style={styles.rightSection}>
          <View style={styles.topRow}>
            <AppText variant="bodyMedium" style={styles.nickname}>
              {comment.author.nickName}
            </AppText>
            <AppText variant="numMediumRegular" style={styles.timeText}>
              {getRelativeTime(comment.createdAt)}
            </AppText>
          </View>

          <View style={styles.contentRow}>
            <AppText variant="caption" style={styles.content}>
              {comment.content}
            </AppText>

            <TouchableOpacity
              onPress={toggleLike}
              onPressIn={() => setHeartPressed(true)}
              onPressOut={() => setHeartPressed(false)}
              style={styles.likeButton}
              activeOpacity={0.7}
            >
              <View style={styles.likeIconWrap}>
                {heartPressed ? (
                  <HeartOnPressIcon width={HEART_SIZE} height={HEART_SIZE} />
                ) : comment.isLiked ? (
                  <HeartFilledIcon width={HEART_SIZE} height={HEART_SIZE} />
                ) : (
                  <HeartIcon width={HEART_SIZE} height={HEART_SIZE} />
                )}
                <AppText variant="numMediumRegular" style={styles.likeCount}>
                  {comment.likeCount}
                </AppText>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomRow}>
            {/* 답글 달기 */}
            <TouchableOpacity
              onPress={() => onReplyPress(comment.commentId)}
              style={styles.replyButton}
              activeOpacity={0.7}
            >
              <View style={styles.replyIconWrap}>
                <ReplyIcon width={18} height={18} />
              </View>
              <AppText style={styles.replyText}>답글 달기</AppText>
            </TouchableOpacity>
          </View>
          {/* 답글 더보기 */}
          {comment.replies.length > 0 && !showReplies && (
            <TouchableOpacity
              onPress={() => setShowReplies(true)}
              style={styles.moreReplyButton}
            >
              <AppText variant="numMediumRegular" style={styles.moreReplyText}>
                ─ {comment.replies.length}개 답글 더보기
              </AppText>
            </TouchableOpacity>
          )}

          {/* 답글 리스트 */}
          {showReplies &&
            comment.replies.map((reply) => (
              <ReplyItem key={reply.commentId} reply={reply} />
            ))}

          {/* 답글 숨기기 */}
          {showReplies && (
            <TouchableOpacity
              onPress={() => setShowReplies(false)}
              style={styles.hideReplyButton}
            >
              <AppText variant="numMediumRegular" style={styles.moreReplyText}>
                ─ 답글 숨기기
              </AppText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 38,
    backgroundColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
  },
  rightSection: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nickname: {
    color: "#D4D4D4",
    marginLeft: 10,
  },
  timeText: {
    color: "rgba(228, 228, 228, 0.50)",
    marginLeft: 8,
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // marginTop: 6,
    marginLeft: 10,
  },
  content: {
    flex: 1,
    color: "#F9F9F9",
    marginRight: 12,
    marginLeft: 10,
  },
  likeButton: {
    alignItems: "center",
  },
  likeIconWrap: {
    alignItems: "center",
  },
  likeCount: {
    marginTop: 4,
    color: "#666",
    fontWeight: 600,
  },
  replyButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  replyIconWrap: {
    marginRight: 6,
  },
  replyText: {
    color: "rgba(228, 228, 228, 0.50)",
    fontSize: 13,
  },
  moreReplyButton: {
    marginTop: 10,
    marginHorizontal: 10,
  },
  hideReplyButton: {
    marginTop: 10,
    marginHorizontal: 10,
  },
  moreReplyText: {
    color: "rgba(228, 228, 228, 0.50)",
  },
});
