const SESSION_STORAGE_KEY = "lio.sessionId";
const CORRELATION_STORAGE_KEY = "lio.correlationId";

export const CORRELATION_HEADER = "X-Correlation-Id";
export const SESSION_HEADER = "X-Session-Id";

function readOrCreate(storage: Storage, key: string): string {
  const existing = storage.getItem(key);
  if (existing) {
    return existing;
  }

  const value = crypto.randomUUID();
  storage.setItem(key, value);
  return value;
}

export function getSessionId(): string {
  return readOrCreate(sessionStorage, SESSION_STORAGE_KEY);
}

export function getCorrelationId(): string {
  return readOrCreate(sessionStorage, CORRELATION_STORAGE_KEY);
}

/** Nova correlation por navegação SPA — correlaciona page view + requests subsequentes. */
export function refreshCorrelationOnNavigation(): string {
  const value = crypto.randomUUID();
  sessionStorage.setItem(CORRELATION_STORAGE_KEY, value);
  return value;
}

export function applyObservabilityHeaders(headers: Headers) {
  if (!headers.has(CORRELATION_HEADER)) {
    headers.set(CORRELATION_HEADER, getCorrelationId());
  }

  if (!headers.has(SESSION_HEADER)) {
    headers.set(SESSION_HEADER, getSessionId());
  }
}
