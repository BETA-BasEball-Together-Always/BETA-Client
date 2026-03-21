/**
 * @param {string} createdAt - ISO 8601
 * @returns {{ within24h: boolean, diffHour: number, diffMin: number, date: Date }}
 */
function parseElapsed(createdAt) {
  if (!createdAt) {
    return { within24h: true, diffHour: 0, diffMin: 0, date: new Date(0) };
  }
  const then = new Date(createdAt).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMs / (1000 * 60 * 60));
  const within24h = diffHour < 24;
  return {
    within24h,
    diffHour,
    diffMin,
    date: new Date(createdAt),
  };
}

function formatUnder24Hours(createdAt) {
  const { diffHour, diffMin } = parseElapsed(createdAt);
  const diffMs = Date.now() - new Date(createdAt).getTime();
  if (diffMs < 0) return "1분 전";

  if (diffHour < 1) {
    const minutes = Math.max(1, diffMin);
    return `${minutes}분`;
  }

  return `${diffHour}시간`;
}

/** 게시글 본문 메타(헤더 등): 24시간 미만 상대, 이후 `YYYY.MM.DD` */
export function getRelativeTimeForPostBody(createdAt) {
  if (!createdAt) return "";
  const { within24h, date } = parseElapsed(createdAt);
  if (within24h) return formatUnder24Hours(createdAt);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

/** 댓글/답글: 24시간 미만 상대, 이후 `MM/DD` */
export function getRelativeTimeForComment(createdAt) {
  if (!createdAt) return "";
  const { within24h, date } = parseElapsed(createdAt);
  if (within24h) return formatUnder24Hours(createdAt);

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}`;
}

/** @deprecated ThreadItem 등 — 댓글과 동일 규칙 */
export function getRelativeTime(createdAt) {
  return getRelativeTimeForComment(createdAt);
}
