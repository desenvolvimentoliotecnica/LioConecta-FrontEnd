import { describe, expect, it } from "vitest";
import {
  CORRELATION_HEADER,
  SESSION_HEADER,
  applyObservabilityHeaders,
  getCorrelationId,
  getSessionId,
  refreshCorrelationOnNavigation,
} from "./sessionCorrelation";

describe("sessionCorrelation", () => {
  it("creates stable session and correlation ids", () => {
    const sessionId = getSessionId();
    const correlationId = getCorrelationId();

    expect(sessionId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(correlationId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(getSessionId()).toBe(sessionId);
    expect(getCorrelationId()).toBe(correlationId);
  });

  it("refreshes correlation id on navigation without changing session", () => {
    const sessionId = getSessionId();
    const previousCorrelation = getCorrelationId();
    const nextCorrelation = refreshCorrelationOnNavigation();

    expect(nextCorrelation).not.toBe(previousCorrelation);
    expect(getSessionId()).toBe(sessionId);
    expect(getCorrelationId()).toBe(nextCorrelation);
  });

  it("applies observability headers when missing", () => {
    const headers = new Headers();
    applyObservabilityHeaders(headers);

    expect(headers.get(CORRELATION_HEADER)).toBe(getCorrelationId());
    expect(headers.get(SESSION_HEADER)).toBe(getSessionId());
  });

  it("falls back when crypto.randomUUID is unavailable (HTTP dev hosts)", () => {
    const original = crypto.randomUUID;
    // @ts-expect-error simulate insecure context
    crypto.randomUUID = undefined;

    try {
      sessionStorage.removeItem("lio.sessionId");
      sessionStorage.removeItem("lio.correlationId");
      const sessionId = getSessionId();
      expect(sessionId).toMatch(/^[0-9a-f-]{36}$/i);
    } finally {
      crypto.randomUUID = original;
    }
  });
});
