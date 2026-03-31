import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import HeartIcon from "../assets/svg/CommunityPost/heartIcon.svg";
import HeartFilledIcon from "../assets/svg/CommunityPost/heartFilledIcon.svg";
import CommentIcon from "../assets/svg/CommunityPost/commentIcon.svg";
import CommentOnPressIcon from "../assets/svg/CommunityPost/commentOnPressIcon.svg";
import CommentIconProfileHighlight from "../assets/svg/CommunityPost/commentIconProfileHighlight.svg";
// 다음 버전 링크 복사 UI — 복원 시 아래 import + 오른쪽 TouchableOpacity 블록 함께 해제
// import LinkIcon from "../assets/svg/CommunityPost/linkIcon.svg";
// import LinkOnPressIcon from "../assets/svg/CommunityPost/linkOnPressIcon.svg";

const PostActionBar = ({
  selected,
  commentMode,
  // linkPressed,
  onLikePress,
  onLongLikePress,
  onCommentPress,
  // onCopyPress,
  onLayout,
  likeDisabled = false,
  /** 인기 피드 카드에서만 true! false면 Team/All 커뮤니티 게시글 리스트/검색 등 기본 크기 */
  compact = false,
  /** 마이스타디움 `ProfileScreen` 댓글 탭(프로필 `PostCard` 경유)에서만 true */
  profileCommentHighlight = false,
}) => {
  /* 하트/댓글 아이콘 크기: compact(인기 피드 카드) vs 그 외(Team/All 커뮤니티/프로필 등) */
  const heartW = compact ? 24 : 31.3;
  const heartH = compact ? 20.7 : 27;
  const commentSz = compact ? 20 : 25;

  /* 댓글 stroke — profileCommentHighlight(마이스타디움 댓글 탭) vs 일반(Team/All 리스트/인기 피드 등) */
  const commentColorNormal = profileCommentHighlight ? "#6F9D48" : "#E5E5E5";
  const commentColorPressed = profileCommentHighlight ? "#6F9D48" : "#6F6F6F";
  /* commentMode: PostReactions 내부 상태(댓글 버튼 눌림) — 일반 리스트에서만 회색 전환, 마이스타디움 댓글 탭은 둘 다 초록 유지 */
  const commentIconColor = commentMode ? commentColorPressed : commentColorNormal;

  /** 마이스타디움 댓글 탭: 말풍선 내부 fill + stroke(#6F9D48) — 별도 SVG */
  const renderCommentIcon = () => {
    if (profileCommentHighlight) {
      return (
        <CommentIconProfileHighlight width={commentSz} height={commentSz} />
      );
    }
    if (commentMode) {
      return (
        <CommentOnPressIcon
          width={commentSz}
          height={commentSz}
          color={commentIconColor}
        />
      );
    }
    return (
      <CommentIcon width={commentSz} height={commentSz} color={commentIconColor} />
    );
  };

  return (
    <View
      style={[styles.actionRow, compact && styles.actionRowCompact]}
      onLayout={onLayout}
    >
      <View style={[styles.leftActions, compact && styles.leftActionsCompact]}>
        <TouchableOpacity
          onPress={onLikePress}
          onLongPress={onLongLikePress}
          disabled={likeDisabled}
        >
          {selected ? (
            <HeartFilledIcon width={heartW} height={heartH} />
          ) : (
            <HeartIcon width={heartW} height={heartH} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onCommentPress}
          style={styles.commentBtn}
          activeOpacity={0.75}
        >
          {renderCommentIcon()}
        </TouchableOpacity>
      </View>

      {/* 다음 버전: 게시글 링크 클립보드 복사
      <TouchableOpacity onPress={onCopyPress}>
        {linkPressed ? (
          <LinkOnPressIcon width={22} height={22} />
        ) : (
          <LinkIcon width={22} height={22} />
        )}
      </TouchableOpacity>
      */}
    </View>
  );
};

export default PostActionBar;

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 14,
    marginHorizontal: 5,
  },
  actionRowCompact: {
    marginTop: 6,
    marginHorizontal: 2,
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 25,
  },
  leftActionsCompact: {
    gap: 14,
  },
  commentBtn: {
    justifyContent: "center",
    alignItems: "center",
  },
});
