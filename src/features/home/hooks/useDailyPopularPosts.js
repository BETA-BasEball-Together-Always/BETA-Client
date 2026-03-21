import { useEffect, useMemo, useState } from "react";

/** 인기 피드 정책: (좋아요 × 3) + (댓글 × 1) */
export function popularityScore(post) {
  const likes = post?.emotions?.likeCount ?? 0;
  const comments = post?.commentCount ?? 0;
  return likes * 3 + comments;
}

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

export function sortDailyPopular(posts) {
  return [...posts].sort((a, b) => {
    const sa = popularityScore(a);
    const sb = popularityScore(b);
    if (sb !== sa) return sb - sa;
    const idA = a?.postId ?? 0;
    const idB = b?.postId ?? 0;
    return idB - idA;
  });
}

/** 오늘 게시글만 점수순, 최대 `max`개 */
export function pickDailyPopularPosts(posts, max = 5) {
  const today = filterTodayPosts(posts);
  return sortDailyPopular(today).slice(0, max);
}

/**
 * 매일 00:00에 “오늘” 기준이 바뀌도록 tick.
 * @param {Array} posts — 누적 로드된 게시글
 * @returns {Array} 최대 5개
 */
export const useDailyPopularPosts = (posts) => {
  const [dayRoll, setDayRoll] = useState(0);

  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      0,
    );
    const ms = Math.max(0, nextMidnight.getTime() - now.getTime());
    const t = setTimeout(() => setDayRoll((x) => x + 1), ms);
    return () => clearTimeout(t);
  }, [dayRoll]);

  return useMemo(
    () => pickDailyPopularPosts(posts, 5),
    [posts, dayRoll],
  );
};
