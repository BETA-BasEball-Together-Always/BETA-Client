export const getErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ??
    error?.message ??
    fallbackMessage
  );
};

export const formatRelativeTime = (value) => {
  if (!value) {
    return "";
  }

  const targetDate = new Date(value);

  if (Number.isNaN(targetDate.getTime())) {
    return "";
  }

  const diffMs = Date.now() - targetDate.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));

  if (diffMinutes < 60) {
    return `${diffMinutes}분`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}시간`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}일`;
  }

  const year = targetDate.getFullYear();
  const month = `${targetDate.getMonth() + 1}`.padStart(2, "0");
  const date = `${targetDate.getDate()}`.padStart(2, "0");

  return `${year}.${month}.${date}`;
};

export const getTotalEmotionCount = (emotions) => {
  if (!emotions) {
    return 0;
  }

  return (
    (emotions.likeCount ?? 0) +
    (emotions.sadCount ?? 0) +
    (emotions.funCount ?? 0) +
    (emotions.hypeCount ?? 0)
  );
};
