import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import {
  fetchMyPostsApi,
  fetchMyLikedPostsApi,
  fetchMyCommentedPostsApi,
  fetchUserPostsApi,
} from "../services/mypageService";
import { useUserEmotionSelectionStore } from "../../community/store/userEmotionSelectionStore";

const MY_PAGE_KEYS = {
  posts: () => ["mypage", "posts"],
  liked: () => ["mypage", "liked"],
  commented: () => ["mypage", "commented"],
};

const normalizeEmotionType = (t) =>
  ["LIKE", "SAD", "FUN", "HYPE"].includes(t) ? t : null;

const resolveMyEmotionTypeForPost = (post) => {
  // 백엔드 응답에 필드 이름이 명확히 제공되지 않아, 가능한 후보를 넓게 허용
  const t =
    post?.myEmotionType ??
    post?.myEmotion ??
    post?.emotionType ??
    post?.userEmotionType ??
    null;

  // 최소한 heart fill(존재 여부)만 보이려면 null 대신 LIKE를 fallback으로 둠
  return normalizeEmotionType(t) ?? "LIKE";
};

export const useMyPostsInfiniteQuery = ({ enabled } = {}) => {
  return useInfiniteQuery({
    queryKey: MY_PAGE_KEYS.posts(),
    queryFn: ({ pageParam }) => fetchMyPostsApi({ cursor: pageParam }),
    enabled: enabled ?? true,
    initialPageParam: null,
    getNextPageParam: (lastPage) =>
      lastPage?.hasNext ? lastPage?.nextCursor : undefined,
  });
};

export const useMyCommentedPostsInfiniteQuery = ({ enabled } = {}) => {
  return useInfiniteQuery({
    queryKey: MY_PAGE_KEYS.commented(),
    queryFn: ({ pageParam }) =>
      fetchMyCommentedPostsApi({ cursor: pageParam }),
    enabled: enabled ?? true,
    initialPageParam: null,
    getNextPageParam: (lastPage) =>
      lastPage?.hasNext ? lastPage?.nextCursor : undefined,
  });
};

export const useMyLikedPostsInfiniteQuery = ({
  enabled,
  hydrateSelection = false,
} = {}) => {
  const query = useInfiniteQuery({
    queryKey: MY_PAGE_KEYS.liked(),
    queryFn: ({ pageParam }) => fetchMyLikedPostsApi({ cursor: pageParam }),
    enabled: enabled ?? true,
    initialPageParam: null,
    getNextPageParam: (lastPage) =>
      lastPage?.hasNext ? lastPage?.nextCursor : undefined,
  });

  const setBulk = useUserEmotionSelectionStore(
    (s) => s.setUserEmotionSelectionsBulk,
  );

  // liked 목록을 모두 받아온 뒤, postId -> emotionType을 store에 반영
  useEffect(() => {
    if (!hydrateSelection) return;

    const pages = query.data?.pages ?? [];
    const entries = pages
      .flatMap((p) => p?.posts ?? [])
      .map((post) => [post?.postId, resolveMyEmotionTypeForPost(post)]);

    // postId 없는 데이터는 skip
    const cleaned = entries.filter(([postId]) => postId != null);
    setBulk(cleaned);
  }, [hydrateSelection, query.data, setBulk]);

  return query;
};

export const useUserPostsInfiniteQuery = ({ userId, enabled } = {}) => {
  return useInfiniteQuery({
    queryKey: ["userPosts", userId],
    queryFn: ({ pageParam }) =>
      fetchUserPostsApi({ userId, cursor: pageParam }),
    enabled: enabled ?? !!userId,
    initialPageParam: null,
    getNextPageParam: (lastPage) =>
      lastPage?.hasNext ? lastPage?.nextCursor : undefined,
  });
};

export const useUserFromUserPostsQuery = (userPostsQuery) => {
  return useMemo(() => {
    const pages = userPostsQuery?.data?.pages ?? [];
    return pages[0]?.user ?? null;
  }, [userPostsQuery?.data]);
};

export const useFlattenMypagePosts = (queryData) => {
  return useMemo(() => {
    const pages = queryData?.pages ?? [];
    const map = new Map();
    for (const p of pages) {
      for (const post of p?.posts ?? []) {
        if (post?.postId != null && !map.has(post.postId))
          map.set(post.postId, post);
      }
    }
    return Array.from(map.values());
  }, [queryData]);
};

