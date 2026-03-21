import api from "../../../shared/libs/api";

export const COMMUNITY_POST_LIST_PAGE_SIZE = 20;

/** POPULAR 다음 페이지용 총 감정 수 (서버 totalEmotionCount 또는 emotions 합산) */
export function totalEmotionCountFromPost(post) {
  if (post == null) return 0;
  if (typeof post.totalEmotionCount === "number") return post.totalEmotionCount;
  const e = post.emotions ?? {};
  return (
    (e.likeCount ?? 0) +
    (e.sadCount ?? 0) +
    (e.funCount ?? 0) +
    (e.hypeCount ?? 0)
  );
}

/**
 * GET /api/v1/community/posts
 * - channel 미지정: 내 팀 채널 / 지정 시 전체 채널
 * - sort=latest(기본): 최신순, cursor
 * - sort=popular: 인기순, offset
 */
export const fetchPostsApi = async ({ channel, sort = "latest", cursor, offset }) => {
  const isPopular = sort === "popular";
  const params = {
    sort: isPopular ? "popular" : "latest",
  };

  if (channel !== undefined && channel !== null && channel !== "") {
    params.channel = channel;
  }

  if (isPopular) {
    params.offset = typeof offset === "number" ? offset : 0;
  } else if (cursor != null && cursor !== "") {
    params.cursor = cursor;
  }

  const res = await api.get("/api/v1/community/posts", { params });

  return res.data;
};

// 게시글 생성
export const createPostApi = async (data) => {
  const res = await api.post("/api/v1/community/posts", data);
  return res.data;
};

export const deletePostApi = async (postId) => {
  const res = await api.delete(`/api/v1/community/posts/${postId}`);
  return res.data;
};
