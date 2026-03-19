import React, { useState } from "react";

import ReplyItem from "./ReplyItem";
import ThreadItem from "./ThreadItem";

export default function CommentItem({
  comment,
  onReplyPress,
  setCommentData,
  postAuthorNickname,
  onLongPressThread,
  currentUserId,
  pressedThread,
  onToggleLike,
  isAllChannel = false,
}) {
  const [showReplies, setShowReplies] = useState(false);

  const isAuthor = comment.author?.nickName === postAuthorNickname;
  const isMine = comment.author?.userId === currentUserId;

  return (
    <ThreadItem
      item={comment}
      variant="comment"
      isAuthor={isAuthor}
      isAllChannel={isAllChannel}
      isPressed={
        pressedThread?.targetType === "comment" &&
        pressedThread?.targetId === comment.commentId
      }
      onLongPress={
        onLongPressThread
          ? () =>
              onLongPressThread({
                isMine,
                targetType: "comment",
                targetId: comment.commentId,
              })
          : undefined
      }
      onToggleLike={
        onToggleLike ? () => onToggleLike(comment.commentId) : undefined
      }
      showReplyActions
      onReplyPress={() => onReplyPress(comment.commentId)}
      replyCount={comment.replies.length}
      showReplies={showReplies}
      onShowReplies={setShowReplies}
      repliesContent={
        showReplies
          ? comment.replies.map((reply) => (
              <ReplyItem
                key={reply.commentId}
                reply={reply}
                setCommentData={setCommentData}
                postAuthorNickname={postAuthorNickname}
                currentUserId={currentUserId}
                onLongPressThread={onLongPressThread}
                pressedThread={pressedThread}
              />
            ))
          : null
      }
    />
  );
}
