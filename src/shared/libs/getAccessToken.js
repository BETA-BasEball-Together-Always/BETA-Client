import * as SecureStore from "expo-secure-store";
import { useUserStore } from "../store/userStore";

export async function getAccessTokenFromStoreOrMemory() {
  const fromMemory = useUserStore.getState().accessToken;
  if (fromMemory && String(fromMemory).trim()) {
    return fromMemory;
  }
  try {
    return await SecureStore.getItemAsync("accessToken");
  } catch {
    return null;
  }
}
