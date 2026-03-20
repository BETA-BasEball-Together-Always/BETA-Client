/**
 * API 가이드: 삭제된 댓글은 표시하되, 답글이 없는 삭제 댓글은 목록에 두지 않음.
 * 답글은 UI상 오래된 순 → 최신 순(위에서 아래로 대화 흐름).
 */

const replyTime = (r) => new Date(r?.createdAt || 0).getTime();

function isMarkedDeleted(c) {
  if (!c) return false;
  if (c.deleted === true) return true;
  if (typeof c.content === "string" && c.content.trim() === "삭제된 댓글입니다") {
    return true;
  }
  return false;
}

function filterDeletedLeaves(replies, postId, isHidden) {
  if (!Array.isArray(replies)) return [];
  return replies
    .filter((r) => {
      if (isHidden?.(postId, r.commentId)) return false;
      const hasChildren = (r.replies?.length ?? 0) > 0;
      if (isMarkedDeleted(r) && !hasChildren) return false;
      return true;
    })
    .map((r) => ({
      ...r,
      replies: filterDeletedLeaves(r.replies ?? [], postId, isHidden),
    }))
    .sort((a, b) => replyTime(a) - replyTime(b));
}

/**
 * @param {Array} comments 상세 API의 comments 배열
 * @param {{ postId?: number|string, isHidden?: (postId, commentId) => boolean }} options
 */
export function normalizeCommentsForDisplay(comments, options = {}) {
  if (!Array.isArray(comments)) return [];
  const { postId, isHidden } = options;

  return comments
    .map((c) => {
      if (isHidden?.(postId, c.commentId)) return null;
      const replies = filterDeletedLeaves(c.replies ?? [], postId, isHidden);
      if (isMarkedDeleted(c) && replies.length === 0) {
        return null;
      }
      return { ...c, replies };
    })
    .filter(Boolean);
}
