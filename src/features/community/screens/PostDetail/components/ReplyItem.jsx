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
  const replyUserId = reply.userId ?? reply.author?.userId;
  const isAuthor =
    (reply.nickname ?? reply.author?.nickName ?? reply.author?.nickname) ===
    postAuthorNickname;
  const isMine =
    replyUserId != null &&
    currentUserId != null &&
    String(replyUserId) === String(currentUserId);
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
