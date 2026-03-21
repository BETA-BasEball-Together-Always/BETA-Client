import api from "../../../shared/libs/api";

/**
 * POST /api/v1/auth/logout
 * 백엔드: request body에 deviceId 필요 (로그인 시와 동일 기기 식별)
 * @param {{ deviceId: string }} params
 * @returns {Promise<{ success?: boolean, message?: string }>}
 */
export const logoutApi = async ({ deviceId }) => {
  const res = await api.post("/api/v1/auth/logout", { deviceId });
  return res.data;
};

/**
 * DELETE /api/v1/users/me — 계정 탈퇴 (즉시 로그아웃 처리)
 * @returns {Promise<{ message?: string, withdrawnAt?: string, scheduledDeletionAt?: string }>}
 */
export const withdrawAccountApi = async () => {
  const res = await api.delete("/api/v1/users/me");
  return res.data;
};
