import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { AppText } from "../../../shared/theme/components/AppText";
import HeartIcon from "../assets/svg/CommunityPost/heartIcon.svg";
import HeartFilledIcon from "../assets/svg/CommunityPost/heartFilledIcon.svg";
import CommentIcon from "../assets/svg/CommunityPost/commentIcon.svg";
import CommentOnPressIcon from "../assets/svg/CommunityPost/commentOnPressIcon.svg";
import LinkIcon from "../assets/svg/CommunityPost/linkIcon.svg";
import LinkOnPressIcon from "../assets/svg/CommunityPost/linkOnPressIcon.svg";

const PostActionBar = ({
  selected, // 내가 감정표현을 했는지 여부
  reactionCount, // 전체 감정 카운트 합
  commentMode,
  commentCount,
  linkPressed,
  onLikePress,
  onLongLikePress,
  onCommentPress,
  onCopyPress,
  onLayout,
}) => {
  return (
    <View style={styles.actionRow} onLayout={onLayout}>
      <View style={styles.leftActions}>
        <TouchableOpacity onPress={onLikePress} onLongPress={onLongLikePress}>
          {selected ? (
            <HeartFilledIcon width={31.3} height={27} />
          ) : (
            <HeartIcon width={31.3} height={27} />
          )}
        </TouchableOpacity>
        {typeof reactionCount === "number" && (
          <AppText variant="numMediumRegular" style={styles.countText}>
            {reactionCount}
          </AppText>
        )}

        <TouchableOpacity onPress={onCommentPress}>
          {commentMode ? (
            <CommentOnPressIcon width={25} height={25} />
          ) : (
            <CommentIcon width={25} height={25} />
          )}
        </TouchableOpacity>
        {typeof commentCount === "number" && (
          <AppText variant="numMediumRegular" style={styles.countText}>
            {commentCount}
          </AppText>
        )}
      </View>

      <TouchableOpacity onPress={onCopyPress}>
        {linkPressed ? (
          <LinkOnPressIcon width={22} height={22} />
        ) : (
          <LinkIcon width={22} height={22} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default PostActionBar;

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    marginHorizontal: 5,
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  countText: {
    color: "rgba(228,228,228,0.7)",
  },
});
