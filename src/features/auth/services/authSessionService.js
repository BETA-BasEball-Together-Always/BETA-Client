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

/**
 * POST|PATCH /api/v1/users/me/withdraw/cancel — 탈퇴 취소(30일 이내 재로그인 시)
 * 백엔드 구현에 따라 method가 다를 수 있어 2단계로 시도
 * @returns {Promise<any>}
 */
export const cancelWithdrawAccountApi = async () => {
  try {
    const res = await api.post("/api/v1/users/me/withdraw/cancel");
    return res.data;
  } catch (e) {
    const status = e?.response?.status;
    // 404/405 등은 method mismatch 가능성이 높아 PATCH로 한 번 더 시도
    if (status === 404 || status === 405) {
      const res = await api.patch("/api/v1/users/me/withdraw/cancel");
      return res.data;
    }
    throw e;
  }
};
