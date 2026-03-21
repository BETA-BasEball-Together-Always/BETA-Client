/**
 * 홈 인기 피드: 오늘 올라온 글만 상한 개수로 자릅니다.
 * 인기 순서는 GET /api/v1/community/posts?sort=popular
 */

/** 당일 00:00:00.000 ~ 23:59:59.999 (로컬) */
export function filterTodayPosts(posts) {
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );
  const startMs = start.getTime();
  const endMs = end.getTime();

  return (posts ?? []).filter((post) => {
    const t = new Date(post?.createdAt).getTime();
    return !Number.isNaN(t) && t >= startMs && t <= endMs;
  });
}
