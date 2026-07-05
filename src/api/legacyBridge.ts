import { api, config } from "./client";

/** Bridge for legacy HTML scripts to consume the LioConecta API. */
export function installLegacyApiBridge() {
  window.LioApi = {
    baseUrl: config.apiBaseUrl,
    useMock: config.useMock,
    get: <T>(path: string) => api.get<T>(path),
    post: <T>(path: string, body?: unknown) => api.post<T>(path, body),
    put: <T>(path: string, body: unknown) => api.put<T>(path, body),
    patch: <T>(path: string, body?: unknown) => api.patch<T>(path, body),
  };
}

declare global {
  interface Window {
    LioApi?: {
      baseUrl: string;
      useMock: boolean;
      get: <T>(path: string) => Promise<T>;
      post: <T>(path: string, body?: unknown) => Promise<T>;
      put: <T>(path: string, body: unknown) => Promise<T>;
      patch: <T>(path: string, body?: unknown) => Promise<T>;
    };
  }
}

export {};
