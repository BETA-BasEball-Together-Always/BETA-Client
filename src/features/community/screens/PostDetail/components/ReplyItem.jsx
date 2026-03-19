import React from "react";

import ThreadItem from "./ThreadItem";

export default function ReplyItem({
  reply,
  setCommentData,
  postAuthorNickname,
  currentUserId,
  onLongPressThread,
  pressedThread,
}) {
  const isAuthor = reply.author?.nickName === postAuthorNickname;
  const isMine = reply.author?.userId === currentUserId;
  const toggleLike = () => {
    setCommentData((prev) => ({
      ...prev,
      comments: prev.comments.map((c) => ({
        ...c,
        replies: c.replies.map((r) =>
          r.commentId === reply.commentId
            ? {
                ...r,
                isLiked: !r.isLiked,
                likeCount: r.isLiked ? r.likeCount - 1 : r.likeCount + 1,
              }
            : r,
        ),
      })),
    }));
  };

  return (
    <ThreadItem
      item={reply}
      variant="reply"
      isAuthor={isAuthor}
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
      onToggleLike={toggleLike}
    />
  );
}
