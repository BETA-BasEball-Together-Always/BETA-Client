/**
 * Axios 등 API 에러에서 서버 message 추출 (스웨거 공통 응답 형태)
 */
export function getApiErrorMessage(error, fallback = "요청에 실패했습니다.") {
  const data = error?.response?.data;
  const msg = data?.message;
  if (typeof msg === "string" && msg.trim()) return msg.trim();
  return fallback;
}
