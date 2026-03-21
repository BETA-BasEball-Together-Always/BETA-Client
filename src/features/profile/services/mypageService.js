import api from "../../../shared/libs/api";

const toCursorParams = (cursor) => (cursor ? { cursor } : {});

export const fetchMyPostsApi = async ({ cursor } = {}) => {
  const res = await api.get("/api/v1/mypage/posts", {
    params: toCursorParams(cursor),
  });
  return res.data;
};

export const fetchMyLikedPostsApi = async ({ cursor } = {}) => {
  const res = await api.get("/api/v1/mypage/liked", {
    params: toCursorParams(cursor),
  });
  return res.data;
};

export const fetchMyCommentedPostsApi = async ({ cursor } = {}) => {
  const res = await api.get("/api/v1/mypage/commented", {
    params: toCursorParams(cursor),
  });
  return res.data;
};

// other user profile + posts
export const fetchUserPostsApi = async ({ userId, cursor } = {}) => {
  const res = await api.get(`/api/v1/users/${userId}/posts`, {
    params: toCursorParams(cursor),
  });
  return res.data;
};

/** PATCH /api/v1/users/me/bio — 빈 문자열·null이면 bio 삭제, 최대 50자 */
export const updateMyBioApi = async ({ bio }) => {
  const res = await api.patch("/api/v1/users/me/bio", {
    bio: bio === null || bio === undefined ? null : bio,
  });
  return res.data;
};

