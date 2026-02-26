import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { AppText } from "../../../../../shared/theme/components/AppText";
import { getRelativeTime } from "../utils/relativeTime";

import HeartIcon from "../../../assets/svg/CommunityPost/heartIcon.svg";
import HeartFilledIcon from "../../../assets/svg/CommunityPost/heartFilledIcon.svg";
import HeartOnPressIcon from "../../../assets/svg/CommunityPost/heartOnPressIcon.svg";

const HEART_SIZE = 20;

export default function ReplyItem({ reply, setCommentData }) {
  const [heartPressed, setHeartPressed] = useState(false);

  const toggleLike = () => {
    setCommentData((prev) => ({
      ...prev,
      comments: prev.comments.map((c) => ({
        ...c,
        replies: c.replies.map((r) =>
          r.commentId === reply.commentId
            ? {
                ...r,
                isLiked: !r.isLiked,
                likeCount: r.isLiked ? r.likeCount - 1 : r.likeCount + 1,
              }
            : r,
        ),
      })),
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <AppText variant="middle" className="text-white">
              {reply.author.nickName?.[0] ?? "유"}
            </AppText>
          </View>
          <AppText variant="bodyMedium" style={styles.nickname}>
            {reply.author.nickName}
          </AppText>
        </View>
        <AppText variant="numMediumRegular" style={styles.timeText}>
          {getRelativeTime(reply.createdAt)}
        </AppText>
      </View>
      <View style={styles.contentRow}>
        <AppText variant="caption" style={styles.content}>
          {reply.content}
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
            ) : reply.isLiked ? (
              <HeartFilledIcon width={HEART_SIZE} height={HEART_SIZE} />
            ) : (
              <HeartIcon width={HEART_SIZE} height={HEART_SIZE} />
            )}
            <AppText variant="numSmallRegular" style={styles.likeCount}>
              {reply.likeCount}
            </AppText>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingLeft: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
  },
  nickname: {
    color: "#D4D4D4",
    marginLeft: 10,
  },
  timeText: {
    color: "rgba(228, 228, 228, 0.50)",
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  content: {
    color: "#F9F9F9",
    marginLeft: 39,
    flex: 1,
  },
  likeButton: {
    alignItems: "center",
    paddingLeft: 12,
  },
  likeIconWrap: {
    alignItems: "center",
  },
  likeCount: {
    marginTop: 2,
    color: "#666",
    fontWeight: 600,
  },
});
