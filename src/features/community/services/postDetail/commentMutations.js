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

const DELETED_COMMENT_TEXT = "삭제된 댓글입니다";

/**
 * 댓글 트리에서 commentId 삭제(소프트: 답글 있으면 문구만 변경, 없으면 제거)
 * @returns {{ list: Array, mode: 'soft'|'removed'|'none' }}
 */
export function mapCommentTreeAfterDelete(list, commentId) {
  if (!Array.isArray(list)) return { list: [], mode: "none" };

  const out = [];
  let mode = "none";

  for (const c of list) {
    if (c.commentId === commentId) {
      const hasReplies = (c.replies?.length ?? 0) > 0;
      if (hasReplies) {
        out.push({
          ...c,
          deleted: true,
          content: DELETED_COMMENT_TEXT,
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
      // optimistic하게 detail 캐시 갱신
      queryClient.setQueryData(postDetailKeys.detail(postId), (prev) => {
        if (!prev) return prev;
        const isReply = variables.parentId != null;

        const newComment = {
          commentId: data.commentId,
          userId: data.userId,
          nickname: currentUser?.nickname ?? null,
          teamCode: currentUser?.favoriteTeamCode ?? null,
          content: data.content,
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
          comments: (prev.comments ?? []).map((c) =>
            c.commentId === variables.parentId
              ? {
                  ...c,
                  replies: [...(c.replies ?? []), newComment],
                }
              : c,
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
    },
  });
};

export const useDeleteCommentMutation = (postId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }) => deleteCommentApi({ commentId }),
    onSuccess: (_data, { commentId }) => {
      let removedLeaf = false;

      queryClient.setQueryData(postDetailKeys.detail(postId), (prev) => {
        if (!prev) return prev;

        const { list: nextComments, mode } = mapCommentTreeAfterDelete(
          prev.comments ?? [],
          commentId,
        );

        if (mode === "removed") {
          removedLeaf = true;
        }

        return {
          ...prev,
          comments: nextComments,
          commentCount: Math.max((prev.commentCount ?? 0) - 1, 0),
        };
      });

      if (removedLeaf) {
        useCommentRemovalStore.getState().hideComment(postId, commentId);
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
    },
  });
};

export const useToggleCommentLikeMutation = (postId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }) => toggleCommentLikeApi({ commentId }),
    onSuccess: (data) => {
      queryClient.setQueryData(postDetailKeys.detail(postId), (prev) => {
        if (!prev) return prev;

        const apply = (list) =>
          list.map((c) =>
            c.commentId === data.commentId
              ? { ...c, likeCount: data.likeCount, isLiked: data.liked }
              : {
                  ...c,
                  replies: c.replies ? apply(c.replies) : c.replies,
                },
          );

        return { ...prev, comments: apply(prev.comments ?? []) };
      });
    },
  });
};
