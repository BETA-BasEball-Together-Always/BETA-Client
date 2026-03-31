import { Alert } from "react-native";

export const OFFLINE_ALERT_TITLE = "알림";
export const OFFLINE_ALERT_MESSAGE =
  "네트워크가 유실되었습니다.\n연결 상태를 확인한 뒤 다시 시도해 주세요.";

/**
 * Axios 요청 실패·인터셉터 차단 등 오프라인/연결 불가에 가까운 에러 여부
 */
export function isOfflineError(error) {
  if (!error) return false;
  if (error.isOffline === true) return true;
  const code = error.code;
  if (code === "CLIENT_OFFLINE" || code === "ERR_NETWORK") return true;
  if (code === "ECONNABORTED") return true;
  if (!error.response && error.request) return true;
  const msg = String(error.message ?? "");
  if (/network error/i.test(msg)) return true;
  if (/NETWORK_UNAVAILABLE/i.test(msg)) return true;
  return false;
}

let lastOfflineAlertAt = 0;
const THROTTLE_MS = 2800;

/** @returns {boolean} true면 오프라인으로 처리됨(알림 표시 시도) */
export function notifyOfflineIfNeeded(error) {
  if (!isOfflineError(error)) return false;
  const now = Date.now();
  if (now - lastOfflineAlertAt < THROTTLE_MS) return true;
  lastOfflineAlertAt = now;
  Alert.alert(OFFLINE_ALERT_TITLE, OFFLINE_ALERT_MESSAGE);
  return true;
}
