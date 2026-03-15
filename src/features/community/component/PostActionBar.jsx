import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

const PostActionBar = ({
  selectedReaction,
  commentMode,
  linkPressed,
  onLikePress,
  onLongLikePress,
  onCommentPress,
  onCopyPress,
  HeartIcon,
  HeartFilledIcon,
  CommentIcon,
  CommentOnPressIcon,
  LinkIcon,
  LinkOnPressIcon,
  onLayout,
}) => {
  return (
    <View style={styles.actionRow} onLayout={onLayout}>
      <View style={styles.leftActions}>
        <TouchableOpacity onPress={onLikePress} onLongPress={onLongLikePress}>
          {selectedReaction ? (
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
    gap: 25,
  },
});
