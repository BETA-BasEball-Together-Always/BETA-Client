import api from "../../../../shared/libs/api";

// 게시글 상세 + 첫 페이지 댓글
export const fetchPostDetailApi = async (postId) => {
  const res = await api.get(`/api/v1/community/posts/${postId}`);
  return res.data;
};

// 추가 댓글 조회
export const fetchPostCommentsApi = async ({ postId, cursor }) => {
  const params = {};
  if (cursor) params.cursor = cursor;
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
  const res = await api.post(`/api/v1/community/posts/${postId}/emotions`, {
    emotionType,
  });
  return res.data;
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
