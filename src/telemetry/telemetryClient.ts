import { apiConfig as config } from "../api/config";
import { TelemetryEventNames, TelemetrySeverity, type TelemetryEventType } from "./eventCatalog";
import { resolveReferrerTemplate, resolveRouteMeta } from "./routeCatalog";
import {
  applyObservabilityHeaders,
  getCorrelationId,
  getSessionId,
} from "./sessionCorrelation";

type TelemetryEventPayload = {
  eventType: TelemetryEventType;
  eventName: string;
  occurredAt: string;
  severity: number;
  properties?: Record<string, unknown>;
};

type PageViewPayload = {
  occurredAt: string;
  pageName: string;
  routeTemplate: string;
  module: string;
  referrerTemplate?: string;
  durationMs?: number;
};

const MAX_BATCH_SIZE = 20;
const FLUSH_INTERVAL_MS = 30_000;

let tokenProvider: () => Promise<string | null> = async () => null;
let eventQueue: TelemetryEventPayload[] = [];
let pageViewQueue: PageViewPayload[] = [];
let flushTimer: number | undefined;
let initialized = false;

export function isTelemetryEnabled(): boolean {
  if (config.useMock) {
    return false;
  }

  return import.meta.env.VITE_OBSERVABILITY_ENABLED !== "false";
}

export function setTelemetryTokenProvider(provider: () => Promise<string | null>) {
  tokenProvider = provider;
}

export function initTelemetryClient() {
  if (initialized || !isTelemetryEnabled()) {
    return;
  }

  initialized = true;
  flushTimer = window.setInterval(() => {
    void flushTelemetry();
  }, FLUSH_INTERVAL_MS);

  window.addEventListener("pagehide", () => {
    void flushTelemetry({ keepalive: true });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      void flushTelemetry({ keepalive: true });
    }
  });
}

export function shutdownTelemetryClient() {
  if (flushTimer !== undefined) {
    window.clearInterval(flushTimer);
    flushTimer = undefined;
  }

  initialized = false;
}

function truncateMessage(message: string, max = 500): string {
  return message.length <= max ? message : `${message.slice(0, max)}…`;
}

function enqueueEvent(event: TelemetryEventPayload) {
  if (!isTelemetryEnabled()) {
    return;
  }

  eventQueue.push(event);

  if (eventQueue.length >= MAX_BATCH_SIZE) {
    void flushTelemetry();
  }
}

async function postJson(path: string, body: unknown, keepalive = false): Promise<void> {
  if (!isTelemetryEnabled()) {
    return;
  }

  try {
    const token = await tokenProvider();
    const headers = new Headers({ "Content-Type": "application/json" });

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    applyObservabilityHeaders(headers);

    await fetch(`${config.apiBaseUrl}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      keepalive,
    });
  } catch {
    // Telemetria nunca deve derrubar a aplicação.
  }
}

export async function flushTelemetry(options: { keepalive?: boolean } = {}) {
  if (!isTelemetryEnabled()) {
    return;
  }

  const events = eventQueue.splice(0, MAX_BATCH_SIZE);
  const views = pageViewQueue.splice(0, MAX_BATCH_SIZE);

  if (events.length === 0 && views.length === 0) {
    return;
  }

  const keepalive = options.keepalive ?? false;

  if (events.length > 0) {
    await postJson(
      "/telemetry/events",
      {
        sessionId: getSessionId(),
        correlationId: getCorrelationId(),
        events,
      },
      keepalive
    );
  }

  if (views.length > 0) {
    await postJson(
      "/telemetry/page-views",
      {
        sessionId: getSessionId(),
        correlationId: getCorrelationId(),
        views,
      },
      keepalive
    );
  }

  if (eventQueue.length > 0 || pageViewQueue.length > 0) {
    await flushTelemetry(options);
  }
}

export function trackApplicationError(input: {
  eventName?: string;
  message: string;
  routeTemplate?: string;
  componentStack?: string;
  severity?: number;
}) {
  enqueueEvent({
    eventType: "Application",
    eventName: input.eventName ?? TelemetryEventNames.Application.Error,
    occurredAt: new Date().toISOString(),
    severity: input.severity ?? TelemetrySeverity.Error,
    properties: {
      routeTemplate: input.routeTemplate ?? resolveRouteMeta(window.location.pathname).routeTemplate,
      message: truncateMessage(input.message),
      componentStack: input.componentStack ? truncateMessage(input.componentStack, 2000) : undefined,
    },
  });
}

export function trackUnhandledRejection(reason: unknown) {
  const message =
    reason instanceof Error
      ? reason.message
      : typeof reason === "string"
        ? reason
        : "Unhandled promise rejection";

  enqueueEvent({
    eventType: "Application",
    eventName: TelemetryEventNames.Application.UnhandledRejection,
    occurredAt: new Date().toISOString(),
    severity: TelemetrySeverity.Error,
    properties: {
      routeTemplate: resolveRouteMeta(window.location.pathname).routeTemplate,
      message: truncateMessage(message),
    },
  });
}

export function trackNetworkError(path: string, status: number, correlationId?: string) {
  enqueueEvent({
    eventType: "Application",
    eventName: TelemetryEventNames.Application.NetworkError,
    occurredAt: new Date().toISOString(),
    severity: status >= 500 ? TelemetrySeverity.Error : TelemetrySeverity.Warning,
    properties: {
      path,
      status,
      correlationId,
      routeTemplate: resolveRouteMeta(window.location.pathname).routeTemplate,
    },
  });
}

export function trackAction(action: string, properties?: Record<string, unknown>) {
  enqueueEvent({
    eventType: "Action",
    eventName: TelemetryEventNames.Action.Performed,
    occurredAt: new Date().toISOString(),
    severity: TelemetrySeverity.Information,
    properties: {
      action,
      routeTemplate: resolveRouteMeta(window.location.pathname).routeTemplate,
      ...properties,
    },
  });
}

export function trackResourceView(resource: string, properties?: Record<string, unknown>) {
  enqueueEvent({
    eventType: "Resource",
    eventName: TelemetryEventNames.Resource.Viewed,
    occurredAt: new Date().toISOString(),
    severity: TelemetrySeverity.Information,
    properties: {
      resource,
      routeTemplate: resolveRouteMeta(window.location.pathname).routeTemplate,
      ...properties,
    },
  });
}

export function trackPageView(pathname: string, referrerPath?: string) {
  if (!isTelemetryEnabled()) {
    return;
  }

  const meta = resolveRouteMeta(pathname);

  pageViewQueue.push({
    occurredAt: new Date().toISOString(),
    pageName: meta.pageName,
    routeTemplate: meta.routeTemplate,
    module: meta.module,
    referrerTemplate: resolveReferrerTemplate(referrerPath),
  });

  enqueueEvent({
    eventType: "Navigation",
    eventName: TelemetryEventNames.Navigation.PageViewed,
    occurredAt: new Date().toISOString(),
    severity: TelemetrySeverity.Information,
    properties: {
      pageName: meta.pageName,
      routeTemplate: meta.routeTemplate,
      module: meta.module,
    },
  });

  if (pageViewQueue.length >= MAX_BATCH_SIZE) {
    void flushTelemetry();
  }
}

export function trackPageLeave(pathname: string, durationMs: number) {
  if (!isTelemetryEnabled()) {
    return;
  }

  const meta = resolveRouteMeta(pathname);

  pageViewQueue.push({
    occurredAt: new Date().toISOString(),
    pageName: meta.pageName,
    routeTemplate: meta.routeTemplate,
    module: meta.module,
    durationMs,
  });

  enqueueEvent({
    eventType: "Navigation",
    eventName: TelemetryEventNames.Navigation.PageLeft,
    occurredAt: new Date().toISOString(),
    severity: TelemetrySeverity.Information,
    properties: {
      pageName: meta.pageName,
      routeTemplate: meta.routeTemplate,
      durationMs,
    },
  });
}
