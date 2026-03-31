import React from "react";
import { StyleSheet, View } from "react-native";
import CommentItem from "./CommentItem";

export default function CommentList({
  comments,
  onReplyPress,
  setCommentData,
  postAuthorNickname,
  onLongPressThread,
  currentUserId,
  pressedThread,
  onToggleCommentLike,
  isAllChannel = false,
  onPressProfile,
  onThreadLayout,
  onListLayout,
}) {
  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        if (typeof onListLayout !== "function") return;
        const y = e?.nativeEvent?.layout?.y ?? 0;
        onListLayout(typeof y === "number" ? y : 0);
      }}
    >
      {comments.map((comment) => (
        <CommentItem
          key={comment.commentId}
          comment={comment}
          onReplyPress={onReplyPress}
          setCommentData={setCommentData}
          onLongPressThread={onLongPressThread}
          postAuthorNickname={postAuthorNickname}
          currentUserId={currentUserId}
          pressedThread={pressedThread}
          onToggleLike={onToggleCommentLike}
          isAllChannel={isAllChannel}
          onPressProfile={onPressProfile}
          onThreadLayout={onThreadLayout}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    marginHorizontal: 6,
  },
});
