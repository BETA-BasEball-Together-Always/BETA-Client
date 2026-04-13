import { useMutation, useQueryClient } from "@tanstack/react-query";
import postDetailKeys from "./postDetailKeys";
import communityKeys from "../communityKeys";
import {
  createCommentApi,
  updateCommentApi,
  deleteCommentApi,
  toggleCommentLikeApi,
} from "./postDetailApi";
import { useCommentRemovalStore } from "../../store/commentRemovalStore";
import { mergeFlatAuthor } from "../../utils/communityComments";
import { useCommentAuthorFallbackStore } from "../../store/commentAuthorFallbackStore";
import { mypageQueryKeys } from "../../../profile/mypageQueryKeys";

const DELETED_COMMENT_TEXT = "삭제된 댓글입니다";

function invalidateMypageCommentedPosts(queryClient) {
  queryClient.invalidateQueries({
    queryKey: mypageQueryKeys.commented(),
    refetchType: "all",
  });
}

/** parentId가 최상위 또는 중첩 답글인 경우 재귀적으로 replies에 추가 */
function addReplyToCommentTree(list, parentId, newComment) {
  if (!Array.isArray(list)) return list;
  return list.map((c) => {
    if (c.commentId === parentId) {
      return {
        ...c,
        replies: [...(c.replies ?? []), newComment],
      };
    }
    if (Array.isArray(c.replies) && c.replies.length > 0) {
      const nextReplies = addReplyToCommentTree(
        c.replies,
        parentId,
        newComment,
      );
      if (nextReplies !== c.replies) {
        return { ...c, replies: nextReplies };
      }
    }
    return c;
  });
}

/**
 * 댓글 트리에서 commentId 삭제(소프트: 답글 있으면 문구만 변경, 없으면 제거)
 * @returns {{ list: Array, mode: 'soft'|'removed'|'none' }}
 */
export function mapCommentTreeAfterDelete(list, commentId) {
  if (!Array.isArray(list)) return { list: [], mode: "none" };

  const out = [];
  let mode = "none";

  const DELETED_USER_NICKNAME = "(삭제된 사용자)";

  for (const c of list) {
    if (c.commentId === commentId) {
      const hasReplies = (c.replies?.length ?? 0) > 0;
      if (hasReplies) {
        const deletedUserAuthor = {
          nickname: DELETED_USER_NICKNAME,
          nickName: DELETED_USER_NICKNAME,
          userId: null,
          teamCode: undefined,
        };
        useCommentAuthorFallbackStore
          .getState()
          .saveAuthorSnapshot(c.commentId, deletedUserAuthor);
        out.push({
          ...c,
          deleted: true,
          content: DELETED_COMMENT_TEXT,
          author: deletedUserAuthor,
          userId: null,
          nickname: DELETED_USER_NICKNAME,
          nickName: DELETED_USER_NICKNAME,
          teamCode: undefined,
        });
        mode = "soft";
      } else {
        mode = "removed";
      }
      continue;
    }

    let nextReplies = c.replies;
    if (Array.isArray(c.replies) && c.replies.length > 0) {
      const sub = mapCommentTreeAfterDelete(c.replies, commentId);
      if (sub.mode !== "none") {
        mode = sub.mode;
        nextReplies = sub.list;
      }
    }

    out.push({ ...c, replies: nextReplies });
  }

  return { list: out, mode };
}

export const useCreateCommentMutation = (postId, { currentUser } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content, parentId = null }) =>
      createCommentApi({ postId, content, parentId }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(postDetailKeys.detail(postId), (prev) => {
        if (!prev) return prev;
        const isReply = variables.parentId != null;

        const newComment = {
          commentId: data.commentId,
          userId: data.userId ?? currentUser?.id ?? null,
          nickname: currentUser?.nickname ?? null,
          teamCode: currentUser?.favoriteTeamCode ?? null,
          content: data.content ?? variables.content,
          likeCount: 0,
          depth: data.depth,
          createdAt: data.createdAt,
          isLiked: false,
          deleted: false,
          replies: [],
        };

        if (!isReply) {
          return {
            ...prev,
            comments: [...(prev.comments ?? []), newComment],
            commentCount: (prev.commentCount ?? 0) + 1,
          };
        }

        return {
          ...prev,
          comments: addReplyToCommentTree(
            prev.comments ?? [],
            variables.parentId,
            newComment,
          ),
          commentCount: (prev.commentCount ?? 0) + 1,
        };
      });

      // 리스트 캐시의 commentCount도 +1
      queryClient.setQueriesData(
        { queryKey: communityKeys.posts() },
        (prev) => {
          if (!prev?.pages) return prev;
          return {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              posts: page.posts.map((p) =>
                p.postId === postId
                  ? { ...p, commentCount: (p.commentCount ?? 0) + 1 }
                  : p,
              ),
            })),
          };
        },
      );

      invalidateMypageCommentedPosts(queryClient);
    },
  });
};

export const useUpdateCommentMutation = (postId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }) =>
      updateCommentApi({ commentId, content }),
    onSuccess: (_data, { commentId, content }) => {
      queryClient.setQueryData(postDetailKeys.detail(postId), (prev) => {
        if (!prev) return prev;

        const updateInList = (list) =>
          list.map((c) =>
            c.commentId === commentId
              ? { ...c, content }
              : {
                  ...c,
                  replies: c.replies ? updateInList(c.replies) : c.replies,
                },
          );

        return {
          ...prev,
          comments: updateInList(prev.comments ?? []),
        };
      });

      invalidateMypageCommentedPosts(queryClient);
    },
  });
};

export const useDeleteCommentMutation = (postId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }) => deleteCommentApi({ commentId }),

    onMutate: async ({ commentId }) => {
      await queryClient.cancelQueries({
        queryKey: postDetailKeys.detail(postId),
      });
      const previous = queryClient.getQueryData(postDetailKeys.detail(postId));
      if (!previous) {
        return { optimisticDetailUpdated: false, commentId };
      }

      const { list: nextComments, mode } = mapCommentTreeAfterDelete(
        previous.comments ?? [],
        commentId,
      );

      queryClient.setQueryData(postDetailKeys.detail(postId), {
        ...previous,
        comments: nextComments,
        commentCount: Math.max((previous.commentCount ?? 0) - 1, 0),
      });

      if (mode === "removed") {
        useCommentRemovalStore.getState().hideComment(postId, commentId);
      }

      return {
        previous,
        commentId,
        removedLeaf: mode === "removed",
        optimisticDetailUpdated: true,
      };
    },

    onError: (_err, variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          postDetailKeys.detail(postId),
          context.previous,
        );
      }
      if (context?.removedLeaf && variables?.commentId != null) {
        useCommentRemovalStore
          .getState()
          .unhideComment(postId, variables.commentId);
      }
    },

    onSuccess: (_data, { commentId }, context) => {
      if (!context?.optimisticDetailUpdated) {
        queryClient.setQueryData(postDetailKeys.detail(postId), (prev) => {
          if (!prev) return prev;
          const { list: nextComments, mode } = mapCommentTreeAfterDelete(
            prev.comments ?? [],
            commentId,
          );
          if (mode === "removed") {
            useCommentRemovalStore.getState().hideComment(postId, commentId);
          }
          return {
            ...prev,
            comments: nextComments,
            commentCount: Math.max((prev.commentCount ?? 0) - 1, 0),
          };
        });
      }

      queryClient.setQueriesData(
        { queryKey: communityKeys.posts() },
        (prev) => {
          if (!prev?.pages) return prev;
          return {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              posts: page.posts.map((p) =>
                p.postId === postId
                  ? {
                      ...p,
                      commentCount: Math.max((p.commentCount ?? 0) - 1, 0),
                    }
                  : p,
              ),
            })),
          };
        },
      );

      invalidateMypageCommentedPosts(queryClient);
    },
  });
};

export const useToggleCommentLikeMutation = (postId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }) => toggleCommentLikeApi({ commentId }),
    onSuccess: (data, variables) => {
      const targetCommentId = variables?.commentId ?? data?.commentId;
      const likedFromApi =
        typeof data?.liked === "boolean"
          ? data.liked
          : typeof data?.isLiked === "boolean"
            ? data.isLiked
            : undefined;

      queryClient.setQueryData(postDetailKeys.detail(postId), (prev) => {
        if (!prev) return prev;

        const apply = (list) =>
          list.map((c) => {
            const idMatch =
              targetCommentId != null &&
              String(c.commentId) === String(targetCommentId);
            if (idMatch) {
              const nextLiked =
                likedFromApi !== undefined
                  ? likedFromApi
                  : !Boolean(c.isLiked ?? c.liked);
              const nextCount =
                typeof data?.likeCount === "number"
                  ? data.likeCount
                  : c.likeCount;
              return {
                ...c,
                likeCount: nextCount,
                isLiked: nextLiked,
                liked: nextLiked,
              };
            }
            return {
              ...c,
              replies: c.replies ? apply(c.replies) : c.replies,
            };
          });

        return { ...prev, comments: apply(prev.comments ?? []) };
      });
    },
  });
};
