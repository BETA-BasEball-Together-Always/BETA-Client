import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import {
  fetchMyPostsApi,
  fetchMyLikedPostsApi,
  fetchMyCommentedPostsApi,
  fetchUserPostsApi,
} from "../services/mypageService";
import { mypageQueryKeys } from "../mypageQueryKeys";
import { useUserEmotionSelectionStore } from "../../community/store/userEmotionSelectionStore";
import { pickEmotionTypeFromPostCoalesced } from "../../community/constants/communityReactions";

/** /mypage/liked 응답에 post.emotionType이 없을 수 있음 → 목록에 포함된 글은 반응한 글이므로 hydrate 시 기본값 보정 */
const resolveMyEmotionTypeForPost = (post) =>
  pickEmotionTypeFromPostCoalesced(post);

export const useMyPostsInfiniteQuery = ({ enabled } = {}) => {
  return useInfiniteQuery({
    queryKey: mypageQueryKeys.posts(),
    queryFn: ({ pageParam }) => fetchMyPostsApi({ cursor: pageParam }),
    enabled: enabled ?? true,
    initialPageParam: null,
    getNextPageParam: (lastPage) =>
      lastPage?.hasNext ? lastPage?.nextCursor : undefined,
  });
};

export const useMyCommentedPostsInfiniteQuery = ({ enabled } = {}) => {
  return useInfiniteQuery({
    queryKey: mypageQueryKeys.commented(),
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
    queryKey: mypageQueryKeys.liked(),
    queryFn: ({ pageParam }) => fetchMyLikedPostsApi({ cursor: pageParam }),
    enabled: enabled ?? true,
    initialPageParam: null,
    getNextPageParam: (lastPage) =>
      lastPage?.hasNext ? lastPage?.nextCursor : undefined,
  });

  const setBulk = useUserEmotionSelectionStore(
    (s) => s.setUserEmotionSelectionsBulk,
  );

  // liked 목록 = 내가 반응한 글만 옴. API에 emotionType이 없으면 pick이 null이라 예전엔 스토어가 비어 하트가 빈 아이콘으로 남음.
  // 서버가 타입을 주면 그걸 쓰고, 없으면 기존 스토어(SAD 등)를 유지하며, 둘 다 없으면 하트 표시용으로 LIKE를 둔다.
  useEffect(() => {
    if (!hydrateSelection) return;

    const pages = query.data?.pages ?? [];
    const selections =
      useUserEmotionSelectionStore.getState().selectionsByPostId;

    const entries = pages
      .flatMap((p) => p?.posts ?? [])
      .map((post) => {
        const postId = post?.postId;
        if (postId == null) return null;
        const key = String(postId);

        const fromApi = resolveMyEmotionTypeForPost(post);
        if (fromApi) return [postId, fromApi];

        const existing = selections[key];
        if (existing != null) return [postId, existing];

        return [postId, "LIKE"];
      })
      .filter(Boolean);

    setBulk(entries);
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

