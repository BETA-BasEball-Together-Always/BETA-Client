import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import HeartIcon from "../assets/svg/CommunityPost/heartIcon.svg";
import HeartFilledIcon from "../assets/svg/CommunityPost/heartFilledIcon.svg";
import CommentIcon from "../assets/svg/CommunityPost/commentIcon.svg";
import CommentOnPressIcon from "../assets/svg/CommunityPost/commentOnPressIcon.svg";
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
}) => {
  return (
    <View style={styles.actionRow} onLayout={onLayout}>
      <View style={styles.leftActions}>
        <TouchableOpacity
          onPress={onLikePress}
          onLongPress={onLongLikePress}
          disabled={likeDisabled}
        >
          {selected ? (
            <HeartFilledIcon width={31.3} height={27} />
          ) : (
            <HeartIcon width={31.3} height={27} />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onCommentPress}>
          {commentMode ? (
            <CommentOnPressIcon width={25} height={25} />
          ) : (
            <CommentIcon width={25} height={25} />
          )}
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
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 25,
  },
});
