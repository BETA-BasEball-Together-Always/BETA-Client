import React from "react";

import ThreadItem from "./ThreadItem";

export default function ReplyItem({
  reply,
  setCommentData,
  postAuthorNickname,
  currentUserId,
  onLongPressThread,
  pressedThread,
  onToggleLike,
  isAllChannel = false,
}) {
  const isAuthor = reply.author?.nickName === postAuthorNickname;
  const isMine = reply.author?.userId === currentUserId;
  return (
    <ThreadItem
      item={reply}
      variant="reply"
      isAuthor={isAuthor}
      isAllChannel={isAllChannel}
      isPressed={
        pressedThread?.targetType === "reply" &&
        pressedThread?.targetId === reply.commentId
      }
      onLongPress={
        onLongPressThread
          ? () =>
              onLongPressThread({
                isMine,
                targetType: "reply",
                targetId: reply.commentId,
              })
          : undefined
      }
      onToggleLike={
        onToggleLike ? () => onToggleLike(reply.commentId) : undefined
      }
    />
  );
}
