import { apiConfig as config } from "./config";
import { applyObservabilityHeaders } from "../telemetry/sessionCorrelation";

let networkErrorTracker: ((path: string, status: number, correlationId?: string) => void) | undefined;

export function setNetworkErrorTracker(
  tracker: (path: string, status: number, correlationId?: string) => void
) {
  networkErrorTracker = tracker;
}

export { config };

type TokenProvider = () => Promise<string | null>;

let tokenProvider: TokenProvider = async () => null;

function applyDefaultHeaders(headers: Headers, init: RequestInit = {}) {
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  applyObservabilityHeaders(headers);
}

export function setTokenProvider(provider: TokenProvider) {
  tokenProvider = provider;
}

function extractCorrelationId(body: unknown): string | undefined {
  if (!body || typeof body !== "object") {
    return undefined;
  }

  const value = (body as Record<string, unknown>).correlationId;
  return typeof value === "string" ? value : undefined;
}

export class ApiError extends Error {
  readonly correlationId?: string;

  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
    correlationId?: string
  ) {
    super(message);
    this.name = "ApiError";
    this.correlationId = correlationId ?? extractCorrelationId(body);
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

    const correlationId =
      response.headers.get("X-Correlation-Id") ?? extractCorrelationId(body);

    networkErrorTracker?.(path, response.status, correlationId ?? undefined);

    throw new ApiError(`API ${response.status}: ${path}`, response.status, body, correlationId ?? undefined);
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

    const correlationId =
      response.headers.get("X-Correlation-Id") ?? extractCorrelationId(body);

    networkErrorTracker?.(path, response.status, correlationId ?? undefined);

    throw new ApiError(`API ${response.status}: ${path}`, response.status, body, correlationId ?? undefined);
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
      const correlationId = response.headers.get("X-Correlation-Id") ?? undefined;
      networkErrorTracker?.(path, response.status, correlationId);
      throw new ApiError(`API ${response.status}: ${path}`, response.status, undefined, correlationId);
    }

    return response.blob();
  },
};
