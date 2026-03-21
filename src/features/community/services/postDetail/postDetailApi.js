import api from "../../../../shared/libs/api";

const COMMENT_PAGE_SIZE = 20;

// 게시글 상세 + 첫 페이지 댓글
export const fetchPostDetailApi = async (postId) => {
  const res = await api.get(`/api/v1/community/posts/${postId}`);
  return res.data;
};

export const fetchPostCommentsApi = async ({ postId, cursorId, size }) => {
  const params = { size: size ?? COMMENT_PAGE_SIZE };
  if (cursorId != null && cursorId !== "") params.cursorId = cursorId;
  const res = await api.get(`/api/v1/community/posts/${postId}/comments`, {
    params,
  });
  return res.data;
};

// 댓글 작성
export const createCommentApi = async ({
  postId,
  content,
  parentId = null,
}) => {
  const res = await api.post(`/api/v1/community/posts/${postId}/comments`, {
    content,
    parentId,
  });
  return res.data;
};

// 댓글 수정
export const updateCommentApi = async ({ commentId, content }) => {
  const res = await api.put(`/api/v1/community/comments/${commentId}`, {
    content,
  });
  return res.data;
};

// 댓글 삭제
export const deleteCommentApi = async ({ commentId }) => {
  const res = await api.delete(`/api/v1/community/comments/${commentId}`);
  return res.data;
};

// 댓글 좋아요 토글
export const toggleCommentLikeApi = async ({ commentId }) => {
  const res = await api.post(
    `/api/v1/community/comments/${commentId}/like`,
    {},
  );
  return res.data;
};

// 게시글 감정표현 토글
export const togglePostEmotionApi = async ({ postId, emotionType }) => {
  const url = `/api/v1/community/posts/${postId}/emotions`;
  const body = { emotionType };

  console.log("[community emotion] → REQUEST", {
    method: "POST",
    url,
    body,
    note: "emotionType은 서버 명세: LIKE | SAD | FUN | HYPE",
  });

  let res;
  try {
    res = await api.post(url, body);
  } catch (err) {
    console.log("[community emotion] ← ERROR", {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
    });
    throw err;
  }

  const d = res.data;
  console.log("[community emotion] ← RESPONSE", {
    postId: d?.postId,
    emotionType: d?.emotionType,
    toggled: d?.toggled,
    meaning:
      d?.toggled === true
        ? "감정 추가 또는 다른 감정으로 변경됨"
        : d?.toggled === false
          ? "감정 제거(취소)"
          : "unknown",
    emotions: d?.emotions,
  });

  return d;
};

// 사용자 차단 / 차단 해제
export const blockUserApi = async ({ userId }) => {
  const res = await api.post(`/api/v1/community/users/${userId}/block`, {});
  return res.data;
};

export const unblockUserApi = async ({ userId }) => {
  const res = await api.delete(`/api/v1/community/users/${userId}/block`);
  return res.data;
};
