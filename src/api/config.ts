const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const apiConfig = {
  apiBaseUrl: API_BASE.replace(/\/$/, ""),
  useMock: USE_MOCK,
};
