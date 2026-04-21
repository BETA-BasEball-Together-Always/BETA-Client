import { isOfflineError } from "./networkErrors";

/**
 * Axios 등 API 에러에서 서버 message 추출 (스웨거 공통 응답 형태)
 * 오프라인/연결 불가 시 null — 전역 오프라인 알림과 중복되지 않도록
 */
export function getApiErrorMessage(error, fallback = "요청에 실패했습니다.") {
  if (isOfflineError(error)) return null;
  const errorCode = error?.response?.data?.code;
  if (errorCode === "DATABASE001") {
    return null;
  }
  const data = error?.response?.data;
  const msg = data?.message;
  if (typeof msg === "string" && msg.trim()) return msg.trim();
  return fallback;
}
