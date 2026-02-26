import React from "react";
import { StyleSheet, View } from "react-native";
import CommentItem from "./CommentItem";

export default function CommentList({
  comments,
  onReplyPress,
  setCommentData,
}) {
  return (
    <View style={styles.container}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.commentId}
          comment={comment}
          onReplyPress={onReplyPress}
          setCommentData={setCommentData}
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
