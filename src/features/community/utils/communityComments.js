/**
 * 일부 API는 author를 중첩 객체로, 일부는 nickname/userId를 루트에 둠
 * 삭제된 댓글은 author가 비어 reload 후 프로필이 사라지는 경우가 있어 병합!
 */
export function mergeFlatAuthor(c) {
  if (!c) return {};
  const a = c.author;
  const nickFromA = a?.nickname ?? a?.nickName;
  const hasAuth =
    a &&
    (nickFromA ||
      a.userId != null ||
      (a.teamCode != null && a.teamCode !== ""));

  if (hasAuth) {
    return {
      ...a,
      nickname: nickFromA ?? c.nickname ?? c.nickName ?? c.authorNickname,
      nickName: a.nickName ?? a.nickname ?? c.nickName ?? c.nickname,
      userId: a.userId ?? c.userId,
      teamCode: a.teamCode ?? c.teamCode,
    };
  }

  const flatNick = c.nickname ?? c.nickName ?? c.authorNickname;
  if (flatNick || c.userId != null || (c.teamCode != null && c.teamCode !== "")) {
    return {
      nickname: flatNick,
      nickName: flatNick,
      userId: c.userId,
      teamCode: c.teamCode,
    };
  }

  return a && typeof a === "object" ? { ...a } : {};
}

function authorNeedsFallback(author) {
  if (!author || typeof author !== "object") return true;
  return !(
    author.nickname ||
    author.nickName ||
    author.userId != null ||
    (author.teamCode != null && author.teamCode !== "")
  );
}


function inferAuthorFromDeletedParentFirstReply(c) {
  const replies = c.replies ?? [];
  if (replies.length === 0) return null;

  const isDeleted =
    c.deleted === true ||
    c.deleted === 1 ||
    c.deleted === "1" ||
    c.deleted === "true" ||
    (typeof c.content === "string" &&
      c.content.trim() === "삭제된 댓글입니다");
  if (!isDeleted) return null;

  const parentAuth = mergeFlatAuthor(c);
  const parentUid = c.userId ?? parentAuth.userId;
  if (parentUid == null) {
    return null;
  }

  const first = replies[0];
  const childAuth = mergeFlatAuthor(first);
  if (authorNeedsFallback(childAuth)) return null;

  const childUid = first.userId ?? childAuth.userId;

  if (parentUid != null && childUid != null) {
    if (String(parentUid) !== String(childUid)) return null;
  }

  return childAuth;
}

function mergeAuthorWithFallback(c, fallbackMap) {
  let author = mergeFlatAuthor(c);
  const id = c?.commentId;
  if (id != null && authorNeedsFallback(author) && fallbackMap) {
    const snap = fallbackMap[String(id)];
    if (snap && typeof snap === "object") {
      author = {
        ...author,
        ...snap,
        nickname: snap.nickname ?? snap.nickName ?? author.nickname,
        nickName: snap.nickName ?? snap.nickname ?? author.nickName,
        userId: snap.userId ?? author.userId,
        teamCode: snap.teamCode ?? author.teamCode,
      };
    }
  }
  if (authorNeedsFallback(author)) {
    const inferred = inferAuthorFromDeletedParentFirstReply(c);
    if (inferred) {
      author = {
        ...author,
        ...inferred,
        nickname: inferred.nickname ?? inferred.nickName ?? author.nickname,
        nickName: inferred.nickName ?? inferred.nickname ?? author.nickName,
        userId: inferred.userId ?? author.userId,
        teamCode: inferred.teamCode ?? author.teamCode,
      };
    }
  }
  if (authorNeedsFallback(author)) {
    const isDeleted =
      c.deleted === true ||
      c.deleted === 1 ||
      c.deleted === "1" ||
      c.deleted === "true" ||
      (typeof c.content === "string" &&
        c.content.trim() === "삭제된 댓글입니다");
    const hasReplies = (c.replies?.length ?? 0) > 0;
    const parentUid = c.userId ?? mergeFlatAuthor(c).userId;
    if (isDeleted && hasReplies && parentUid == null) {
      author = {
        ...author,
        nickname: "(삭제된 사용자)",
        nickName: "(삭제된 사용자)",
        userId: null,
        teamCode: undefined,
      };
    }
  }
  return author;
}

/** @param {Record<string, object>} [fallbackMap] commentAuthorFallbackStore.map */
export function normalizeCommentAuthorFields(comments, fallbackMap = {}) {
  if (!Array.isArray(comments)) return [];

  const mapNode = (c) => {
    if (!c) return c;
    const liked = c.isLiked ?? c.liked;
    return {
      ...c,
      isLiked: typeof liked === "boolean" ? liked : Boolean(liked),
      author: mergeAuthorWithFallback(c, fallbackMap),
      replies: (c.replies ?? []).map(mapNode),
    };
  };

  return comments.map(mapNode);
}

const replyTime = (r) => new Date(r?.createdAt || 0).getTime();

function isMarkedDeleted(c) {
  if (!c) return false;
  if (
    c.deleted === true ||
    c.deleted === 1 ||
    c.deleted === "1" ||
    c.deleted === "true"
  )
    return true;
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

  const topLevel = comments
    .map((c) => {
      if (isHidden?.(postId, c.commentId)) return null;
      const replies = filterDeletedLeaves(c.replies ?? [], postId, isHidden);
      if (isMarkedDeleted(c) && replies.length === 0) {
        return null;
      }
      return { ...c, replies };
    })
    .filter(Boolean);

  // 댓글: 등록 순(오래된 것이 위) — API가 최신순으로 줄 때도 맞춤
  return topLevel.sort(
    (a, b) =>
      new Date(a.createdAt || 0).getTime() -
      new Date(b.createdAt || 0).getTime(),
  );
}
