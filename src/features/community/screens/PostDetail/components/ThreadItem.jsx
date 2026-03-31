import React, { useState } from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";

import { AppText } from "../../../../../shared/theme/components/AppText";
import { getRelativeTimeForComment } from "../utils/relativeTime";
import HeartIcon from "../../../assets/svg/CommunityPost/heartIcon.svg";
import HeartFilledIcon from "../../../assets/svg/CommunityPost/heartFilledIcon.svg";
import HeartOnPressIcon from "../../../assets/svg/CommunityPost/heartOnPressIcon.svg";
import ReplyIcon from "../../../assets/svg/CommunityPost/replyIcon.svg";
import TeamLabel from "../../../component/communityMain/TeamLabel";
import { TEAM_DATA } from "../../../../../shared/constants/teams";
import { LinearGradient } from "expo-linear-gradient";

const HEART_SIZE = 20;

const DELETED_COMMENT_TEXT = "삭제된 댓글입니다";
const DELETED_USER_NICKNAME = "(삭제된 사용자)";
const DELETED_USER_AVATAR_INITIAL = "삭";

// 댓글 + 답글 ui 공통 컴포넌트!!

export default function ThreadItem({
  item,
  variant = "comment",
  isAuthor = false,
  isAllChannel = false,
  onToggleLike,
  onLongPress,
  onPressProfile,
  showReplyActions = false,
  onReplyPress,
  isPressed = false,
  replyCount = 0,
  showReplies = false,
  onShowReplies,
  repliesContent = null,
}) {
  const [heartPressed, setHeartPressed] = useState(false);
  const author = item?.author ?? {};
  const isDeleted =
    item?.deleted === true ||
    item?.deleted === "true" ||
    (typeof item?.content === "string" &&
      item.content.trim() === DELETED_COMMENT_TEXT);

  const rawDisplayNickname =
    author.nickName ??
    author.nickname ??
    item?.nickname ??
    item?.authorNickname ??
    "";

  const displayNickname = isDeleted
    ? DELETED_USER_NICKNAME
    : rawDisplayNickname;
  const avatarLetter =
    displayNickname === DELETED_USER_NICKNAME
      ? DELETED_USER_AVATAR_INITIAL
      : (displayNickname?.[0] ?? (isDeleted ? "?" : "유")).toUpperCase();
  const teamCode = author.teamCode ?? item.teamCode;
  const team = teamCode ? TEAM_DATA[teamCode] : null;
  const ProfileIcon = team?.ProfileIcon;
  const profileUserId = author.userId ?? item.userId ?? null;
  const avatarSize = variant === "reply" ? 32 : 38;

  return (
    <View
      style={[
        styles.container,
        variant === "reply" && styles.replyContainer,
        isPressed && styles.pressedBackground,
      ]}
    >
      <Pressable
        onLongPress={isDeleted ? undefined : onLongPress}
        delayLongPress={400}
        style={styles.row}
      >
        <LinearGradient
          colors={team?.gradient?.colors || ["#3A3D44", "#3A3D44"]}
          locations={team?.gradient?.locations}
          start={team?.gradient?.start}
          end={team?.gradient?.end}
          style={[
            styles.avatarCircle,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize,
            },
          ]}
        >
          {ProfileIcon ? (
            <ProfileIcon width={avatarSize * 0.74} height={avatarSize * 0.74} />
          ) : (
            <AppText style={styles.avatarInitial}>{avatarLetter}</AppText>
          )}
        </LinearGradient>

        <View style={styles.rightSection}>
          <View style={styles.topRow}>
            <View style={styles.nameRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={!onPressProfile || profileUserId == null}
                onPress={
                  onPressProfile && profileUserId != null
                    ? () => onPressProfile(profileUserId)
                    : undefined
                }
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <AppText variant="bodyMedium" style={styles.nickname}>
                    {displayNickname}
                  </AppText>
                  {isAllChannel && !!teamCode && (
                    <View style={styles.teamLabelWrap}>
                      <TeamLabel teamCode={teamCode} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              {isAuthor && (
                <AppText variant="smallRegular" style={styles.authorTag}>
                  · 작성자
                </AppText>
              )}
            </View>
            <AppText variant="numMediumRegular" style={styles.timeText}>
              {getRelativeTimeForComment(item.createdAt)}
            </AppText>
          </View>

          <View style={styles.contentRow}>
            <View style={styles.contentLeft}>
              <AppText
                variant="caption"
                style={[
                  styles.content,
                  variant === "reply"
                    ? styles.contentReply
                    : styles.contentComment,
                  isDeleted && styles.deletedContent,
                ]}
              >
                {isDeleted ? DELETED_COMMENT_TEXT : item.content}
              </AppText>

              {showReplyActions && !isDeleted && (
                <TouchableOpacity
                  onPress={onReplyPress}
                  style={styles.replyButton}
                  activeOpacity={0.7}
                >
                  <View style={styles.replyIconWrap}>
                    <ReplyIcon width={15} height={15} />
                  </View>
                  <AppText variant="spaced" style={styles.replyText}>
                    답글 달기
                  </AppText>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={onToggleLike}
              onPressIn={() => setHeartPressed(true)}
              onPressOut={() => setHeartPressed(false)}
              style={styles.likeButton}
              activeOpacity={0.7}
              disabled={!onToggleLike || isDeleted}
            >
              <View style={styles.likeIconWrap}>
                {heartPressed ? (
                  <HeartOnPressIcon width={HEART_SIZE} height={HEART_SIZE} />
                ) : item.isLiked || item.liked ? (
                  <HeartFilledIcon width={HEART_SIZE} height={HEART_SIZE} />
                ) : (
                  <HeartIcon width={HEART_SIZE} height={HEART_SIZE} />
                )}
                <AppText variant="numSmallRegular" style={styles.likeCount}>
                  {item.likeCount}
                </AppText>
              </View>
            </TouchableOpacity>
          </View>

          {showReplyActions && (
            <>
              {replyCount > 0 && !showReplies && (
                <TouchableOpacity
                  onPress={() => onShowReplies?.(true)}
                  style={styles.replyMoreButton}
                >
                  <AppText variant="spaced" style={styles.moreReplyText}>
                    ─ {replyCount}개 답글 더보기
                  </AppText>
                </TouchableOpacity>
              )}

              {showReplies ? repliesContent : null}

              {showReplies && (
                <TouchableOpacity
                  onPress={() => onShowReplies?.(false)}
                  style={styles.replyHiddenButton}
                >
                  <AppText variant="spaced" style={styles.hiddenReplyText}>
                    ─ 답글 숨기기
                  </AppText>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  replyContainer: {
    marginBottom: 16,
    paddingLeft: 15,
  },
  pressedBackground: {
    backgroundColor: "rgba(63, 63, 63, 0.30)",
    borderRadius: 8,
    padding: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarCircle: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarInitial: {
    color: "#F9F9F9",
  },
  rightSection: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  nickname: {
    color: "#D4D4D4",
    lineHeight: 22,
  },
  teamLabelWrap: {
    marginLeft: 6,
  },
  authorTag: {
    color: "#666666",
    marginLeft: 4,
    lineHeight: 13.6,
  },
  timeText: {
    color: "rgba(228, 228, 228, 0.50)",
    lineHeight: 15,
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 6,
  },
  contentLeft: {
    flex: 1,
  },
  content: {
    flex: 1,
    color: "#F9F9F9",
    marginRight: 12,
  },
  contentComment: {
    lineHeight: 19,
  },
  contentReply: {
    lineHeight: 19,
  },
  deletedContent: {
    color: "rgba(228, 228, 228, 0.55)",
  },
  likeButton: {
    alignItems: "center",
    paddingLeft: 5,
  },
  likeIconWrap: {
    alignItems: "center",
  },
  likeCount: {
    marginTop: 2,
    color: "#666",
    lineHeight: 12,
  },
  replyButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    paddingLeft: 3,
    marginBottom: 16,
  },
  replyIconWrap: {
    marginRight: 6,
  },
  replyText: {
    color: "rgba(228, 228, 228, 0.50)",
    lineHeight: 15,
  },
  replyMoreButton: {
    marginHorizontal: 5,
    // marginTop: -7,
  },
  moreReplyText: {
    color: "rgba(228, 228, 228, 0.50)",
    lineHeight: 17.7,
  },
  replyHiddenButton: {
    marginHorizontal: 5,
    // marginTop: 20,
  },
  hiddenReplyText: {
    color: "rgba(228, 228, 228, 0.50)",
    lineHeight: 15,
  },
});
