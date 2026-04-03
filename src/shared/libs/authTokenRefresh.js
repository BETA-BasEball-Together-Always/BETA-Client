import axios from "axios";
import Constants from "expo-constants";

export function getBackendBaseUrl() {
  return (
    Constants.expoConfig?.extra?.backendUrl ||
    process.env.EXPO_PUBLIC_BACKEND_URL ||
    "https://beta-app.kr"
  );
}

/**
 * POST /api/v1/auth/refresh — api 인스턴스를 쓰지 않음(인터셉터 재진입 방지)
 */
export async function refreshTokensApi(refreshToken) {
  const { data } = await axios.post(
    `${getBackendBaseUrl()}/api/v1/auth/refresh`,
    { refreshToken },
    { timeout: 15000 },
  );
  return data;
}
