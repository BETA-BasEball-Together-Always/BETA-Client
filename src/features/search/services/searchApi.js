import api from "@shared/libs/api";

const SEARCH_BASE_PATH = "/api/v1/search";

const normalizeCursor = (cursor) => {
  if (!cursor || cursor.score == null || cursor.id == null) {
    return null;
  }

  return {
    score: cursor.score,
    id: cursor.id,
  };
};

const buildCursorParams = (cursor) => {
  if (!cursor || cursor.score == null || cursor.id == null) {
    return {};
  }

  return {
    cursorScore: cursor.score,
    cursorId: cursor.id,
  };
};

const normalizePagedResponse = (data, itemsKey) => {
  return {
    items: data?.[itemsKey] ?? [],
    hasNext: Boolean(data?.hasNext),
    nextCursor: normalizeCursor(data?.nextCursor),
  };
};

export const fetchMySearchLogs = async () => {
  try {
    const { data } = await api.get(`${SEARCH_BASE_PATH}/my-logs`);
    return {
      logs: data?.logs ?? [],
    };
  } catch (error) {
    const status = error?.response?.status;

    if (status >= 500) {
      console.log("search my-logs fallback:", {
        status,
        data: error?.response?.data,
      });

      return {
        logs: [],
      };
    }

    throw error;
  }
};

export const deleteMySearchLog = async (logId) => {
  await api.delete(`${SEARCH_BASE_PATH}/my-logs/${logId}`);
};

export const fetchSearchSuggestions = async (keyword) => {
  const { data } = await api.get(`${SEARCH_BASE_PATH}/suggestions`, {
    params: { keyword },
  });

  return {
    suggestedKeywords: data?.suggestedKeywords ?? [],
    suggestedUsers: data?.suggestedUsers ?? [],
  };
};

export const fetchSearchUsersPage = async ({ keyword, cursor }) => {
  const { data } = await api.get(`${SEARCH_BASE_PATH}/users`, {
    params: {
      keyword,
      ...buildCursorParams(cursor),
    },
  });

  return normalizePagedResponse(data, "users");
};

export const fetchSearchPostsPage = async ({
  keyword,
  channel,
  sort,
  cursor,
}) => {
  const { data } = await api.get(`${SEARCH_BASE_PATH}/posts`, {
    params: {
      keyword,
      channel,
      sort,
      ...buildCursorParams(cursor),
    },
  });

  return normalizePagedResponse(data, "posts");
};

export const fetchSearchHashtagsPage = async ({ keyword, cursor }) => {
  const { data } = await api.get(`${SEARCH_BASE_PATH}/hashtags`, {
    params: {
      keyword,
      ...buildCursorParams(cursor),
    },
  });

  return normalizePagedResponse(data, "hashtags");
};
