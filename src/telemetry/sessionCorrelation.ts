const SESSION_STORAGE_KEY = "lio.sessionId";
const CORRELATION_STORAGE_KEY = "lio.correlationId";

export const CORRELATION_HEADER = "X-Correlation-Id";
export const SESSION_HEADER = "X-Session-Id";

function createUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // HTTP (non-localhost) lacks secure context — randomUUID is unavailable.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const rand = (Math.random() * 16) | 0;
    const value = char === "x" ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

function readOrCreate(storage: Storage, key: string): string {
  const existing = storage.getItem(key);
  if (existing) {
    return existing;
  }

  const value = createUuid();
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
  const value = createUuid();
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
