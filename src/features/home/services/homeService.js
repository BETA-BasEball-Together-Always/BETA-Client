import api from "../../../shared/libs/api";

export async function fetchHome() {
  const { data } = await api.get("/api/v1/home");
  return data;
}
