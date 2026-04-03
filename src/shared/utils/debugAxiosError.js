import { isOfflineError } from "./networkErrors";

/**
 * API/axios 실패 시 Metro·디버거에서 원인 추적용 로그.
 * (Alert에는 짧은 메시지만 쓰고, 상세는 여기서 확인)
 */
export function logAxiosError(tag, error) {
  const cfg = error?.config;
  const res = error?.response;

  const summary = {
    tag,
    message: error?.message,
    code: error?.code,
    request: cfg
      ? {
          baseURL: cfg.baseURL,
          url: cfg.url,
          method: cfg.method,
          hasAuthHeader: !!cfg.headers?.Authorization,
        }
      : undefined,
    response: res
      ? {
          status: res.status,
          statusText: res.statusText,
          data: res.data,
        }
      : undefined,
  };

  // Metro 터미널에서 객체 전체가 보이도록
  console.error(`[API Error] ${tag}`, summary);

  if (
    error?.response?.data != null &&
    typeof error.response.data === "object"
  ) {
    try {
      console.error(
        `[API Error] ${tag} response.data (JSON)`,
        JSON.stringify(error.response.data, null, 2),
      );
    } catch {
      // ignore
    }
  }
}

/**
 * 백엔드 응답 형식이 달라도 괜찮게 사용자/Alert용 문자열 추출
 * 오프라인 시 null — 전역 오프라인 알림과 중복되지 않도록
 */
export function getApiErrorUserMessage(error, fallback) {
  if (isOfflineError(error)) return null;
  const d = error?.response?.data;
  if (typeof d === "string" && d.trim()) return d.trim();
  if (d && typeof d === "object") {
    const m =
      d.message ??
      d.error ??
      d.detail ??
      (Array.isArray(d.errors) ? d.errors.join("\n") : null);
    if (m != null && String(m).trim()) return String(m).trim();
  }
  if (error?.message) return error.message;
  return fallback;
}
