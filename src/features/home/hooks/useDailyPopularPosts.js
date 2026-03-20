import { useEffect, useState } from "react";

//오늘 날짜 기준 필터링!! 00:00~23:59
const filterTodayPosts = (posts) => {
  const now = new Date();
  const state = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
  );
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return posts.filter((post) => {
    const createdAt = new Date(post.createdAt);
    return createdAt >= start && createdAt <= end;
  });
};

//매일 00:00 기준 정렬된 인기 게시물 반환!
/**
 * @param {Array} posts - 모든 게시글 배열
 * @returns {Array} - 오늘 게시물만 필터 후 reactions 합계 기준 내림차순 정렬
 */

export const useDailyPopularPosts = (posts) => {
  const [sortedPosts, setSortedPosts] = useState([]);

  useEffect(() => {
    const sortPosts = () => {
      const todayPosts = filterTodayPosts(posts);

      const sorted = [...todayPosts].sort((a, b) => {
        const aTotal = Object.values(a.emotions ?? {}).reduce(
          (sum, v) => sum + (v || 0),
          0,
        );
        const bTotal = Object.values(b.emotions ?? {}).reduce(
          (sum, v) => sum + (v || 0),
          0,
        );
        return bTotal - aTotal;
      });
      setSortedPosts(sorted);
    };
    sortPosts();

    //다음날 00:00까지 남은 시간
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );
    const timeout = nextMidnight.getTime() - now.getTime();

    const timer = setTimeout(sortPosts, timeout);
    return () => clearTimeout(timer);
  }, [posts]);

  return sortedPosts;
};
