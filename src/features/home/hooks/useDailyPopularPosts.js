import { useEffect, useMemo, useState } from "react";
import { filterTodayPosts } from "../../community/utils/communityPopularPolicy";

export function pickDailyPopularPosts(posts, max = 5) {
  return filterTodayPosts(posts).slice(0, max);
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
