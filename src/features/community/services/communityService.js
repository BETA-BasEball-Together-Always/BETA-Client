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

// 게시글 목록 조회
export const fetchPostsApi = async ({
  channel,
  sort,
  cursorId,
  cursorEmotionCount,
}) => {
  const params = {
    sortType: sort === "popular" ? "POPULAR" : "LATEST",
    size: COMMUNITY_POST_LIST_PAGE_SIZE,
  };

  if (channel) params.channel = channel;

  if (cursorId != null && cursorId !== "") params.cursorId = cursorId;

  if (
    sort === "popular" &&
    cursorEmotionCount != null &&
    cursorEmotionCount !== ""
  ) {
    params.cursorEmotionCount = cursorEmotionCount;
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
