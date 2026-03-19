import api from "../../../shared/libs/api";

// 게시글 목록 조회
export const fetchPostsApi = async ({ channel, sort, cursor, offset }) => {
  const params = { sort };

  if (channel) params.channel = channel; //undefined면 파라미터 안 보내기!!(전체/팀 게시판 구별)

  if (sort === "latest" && cursor) params.cursor = cursor;
  if (sort === "popular") params.offset = offset ?? 0;

  const res = await api.get("/api/v1/community/posts", { params });

  return res.data;
};

// 게시글 생성
export const createPostApi = async (data) => {
  const res = await api.post("/api/v1/community/posts", data);
  return res.data;
};

export const deletePostApi = async (postId) => {
<<<<<<< HEAD
  return await api.delete(`/api/v1/posts/${postId}`);
=======
  const res = await api.delete(`/api/v1/community/posts/${postId}`);
  return res.data;
>>>>>>> origin/feat/15-create-post-screen
};
