/**
 * 댓글/답글 등록 시점(createdAt) 기준으로 경과 시간 문자열 반환
 * @param {string} createdAt - ISO 8601 날짜 문자열 (e.g. "2025-11-25T10:35:00")
 * @returns {string} "1분 전" | "10분 전" | "2시간" | "03/21" 등
 */
export function getRelativeTime(createdAt) {
  if (!createdAt) return "";

  const then = new Date(createdAt).getTime();
  const now = Date.now();
  const diffMs = now - then;

  // 미래 시각이 들어오면 일단 "1분 전"으로 처리
  if (diffMs < 0) return "1분 전";

  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // 1시간 미만: 0분이어도 무조건 1분부터 시작, "n분 전"
  if (diffHour < 1) {
    const minutes = Math.max(1, diffMin);
    return `${minutes}분`;
  }

  // 1시간 이상 ~ 24시간 미만: "n시간"
  if (diffHour < 24) {
    return `${diffHour}시간`;
  }

  // 24시간 초과: MM/DD 형식
  const date = new Date(createdAt);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}`;
}
