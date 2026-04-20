import { Alert } from "react-native";

export const OFFLINE_ALERT_TITLE = "알림";
export const OFFLINE_ALERT_MESSAGE =
  "작업을 완료할 수 없습니다.\n네트워크를 확인해 주세요.";

export const DB_MAINTENANCE_ALERT_TITLE = "서비스 점검 중";
export const DB_MAINTENANCE_ALERT_MESSAGE =
  "현재 데이터베이스 점검으로 인해 서비스가 일시적으로 중단되었습니다. 잠시 후 다시 시도해주세요.";

/**
 * Axios 요청 실패/인터셉터 차단 등 오프라인/연결 불가에 가까운 에러 여부
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
const THROTTLE_MS = 8000;

/** @returns {boolean} true면 오프라인으로 처리됨(알림 표시 시도) */
export function notifyOfflineIfNeeded(error) {
  if (!isOfflineError(error)) return false;
  const now = Date.now();
  if (now - lastOfflineAlertAt < THROTTLE_MS) return true;
  lastOfflineAlertAt = now;
  Alert.alert(OFFLINE_ALERT_TITLE, OFFLINE_ALERT_MESSAGE);
  return true;
}

/**
 * 백엔드 공통 에러 응답 중 DB 장애(점검) 케이스 여부
 * - status: 503
 * - data.code: "DATABASE001"
 */
export function isDatabaseMaintenanceError(error) {
  const status = error?.response?.status;
  if (status !== 503) return false;
  const code = error?.response?.data?.code;
  return code === "DATABASE001";
}

let lastDbMaintenanceAlertAt = 0;
const DB_MAINTENANCE_THROTTLE_MS = 8000;

/** @returns {boolean} true면 DB 점검으로 처리됨(알림 표시 시도) */
export function notifyDatabaseMaintenanceIfNeeded(error) {
  if (!isDatabaseMaintenanceError(error)) return false;
  const now = Date.now();
  if (now - lastDbMaintenanceAlertAt < DB_MAINTENANCE_THROTTLE_MS) return true;
  lastDbMaintenanceAlertAt = now;
  Alert.alert(DB_MAINTENANCE_ALERT_TITLE, DB_MAINTENANCE_ALERT_MESSAGE);
  return true;
}
