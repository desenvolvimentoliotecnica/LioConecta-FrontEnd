const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const config = {
  apiBaseUrl: API_BASE.replace(/\/$/, ""),
  useMock: USE_MOCK,
  azureClientId: import.meta.env.VITE_AZURE_CLIENT_ID ?? "",
  azureTenantId: import.meta.env.VITE_AZURE_TENANT_ID ?? "",
  azureApiScope: import.meta.env.VITE_AZURE_API_SCOPE ?? "",
};

type TokenProvider = () => Promise<string | null>;

let tokenProvider: TokenProvider = async () => null;

const CORRELATION_HEADER = "X-Correlation-Id";

function applyDefaultHeaders(headers: Headers, init: RequestInit = {}) {
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has(CORRELATION_HEADER)) {
    headers.set(CORRELATION_HEADER, crypto.randomUUID());
  }
}

export function setTokenProvider(provider: TokenProvider) {
  tokenProvider = provider;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  if (config.useMock) {
    throw new ApiError("Mock mode enabled — API call skipped", 0);
  }

  const token = await tokenProvider();
  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  applyDefaultHeaders(headers, init);

  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }
    throw new ApiError(`API ${response.status}: ${path}`, response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  if (config.useMock) {
    throw new ApiError("Mock mode enabled — API call skipped", 0);
  }

  const token = await tokenProvider();
  const headers = new Headers();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  applyDefaultHeaders(headers);

  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }
    throw new ApiError(`API ${response.status}: ${path}`, response.status, body);
  }

  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  upload: <T>(path: string, formData: FormData) => apiUpload<T>(path, formData),
  getBlob: async (path: string): Promise<Blob> => {
    if (config.useMock) {
      throw new ApiError("Mock mode enabled — API call skipped", 0);
    }

    const token = await tokenProvider();
    const headers = new Headers();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    applyDefaultHeaders(headers);

    const response = await fetch(`${config.apiBaseUrl}${path}`, { headers });
    if (!response.ok) {
      throw new ApiError(`API ${response.status}: ${path}`, response.status);
    }

    return response.blob();
  },
};
