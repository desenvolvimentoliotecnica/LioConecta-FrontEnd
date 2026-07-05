import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../api/config", () => ({
  apiConfig: {
    apiBaseUrl: "http://localhost:5148/api/v1",
    useMock: false,
  },
}));

describe("telemetryClient", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_OBSERVABILITY_ENABLED", "true");
    sessionStorage.clear();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 202 }));
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function loadTelemetryClient() {
    return import("./telemetryClient");
  }

  it("batches events and flushes at max batch size", async () => {
    const { trackAction, flushTelemetry } = await loadTelemetryClient();

    for (let index = 0; index < 20; index += 1) {
      trackAction(`action-${index}`);
    }

    await flushTelemetry();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = vi.mocked(globalThis.fetch).mock.calls[0] ?? [];
    expect(String(url)).toContain("/telemetry/events");
    expect(init?.method).toBe("POST");
  });

  it("does not throw when telemetry endpoint fails", async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error("network down"));

    const { trackAction, flushTelemetry } = await loadTelemetryClient();
    trackAction("safe-action");

    await expect(flushTelemetry()).resolves.toBeUndefined();
  });

  it("queues page views without crashing when disabled", async () => {
    vi.stubEnv("VITE_OBSERVABILITY_ENABLED", "false");
    vi.resetModules();

    const { trackPageView, flushTelemetry } = await import("./telemetryClient");
    trackPageView("/admin/observabilidade");

    await expect(flushTelemetry()).resolves.toBeUndefined();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
