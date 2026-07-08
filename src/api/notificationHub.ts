import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { getHubAccessToken } from "./hubAuth";
import { HUB_LOG_LEVEL, HUB_STOP_GRACE_MS, isBenignHubStopError } from "./hubLifecycle";
import type { NotificationDto } from "./types";

const HUB_URL = "/hubs/notifications";
const EVENT_NAME = "NotificationReceived";

let connection: HubConnection | null = null;
let startPromise: Promise<void> | null = null;
let stopTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<(notification: NotificationDto) => void>();

function cancelScheduledStop() {
  if (stopTimer != null) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }
}

function buildConnection(): HubConnection {
  return new HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: getHubAccessToken,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10_000, 30_000])
    .configureLogging(HUB_LOG_LEVEL)
    .build();
}

const START_MAX_ATTEMPTS = 3;
const START_RETRY_MS = 1500;

async function startWithRetry(conn: HubConnection): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= START_MAX_ATTEMPTS; attempt += 1) {
    try {
      await conn.start();
      return;
    } catch (error) {
      lastError = error;
      if (isBenignHubStopError(error)) {
        return;
      }
      if (attempt < START_MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, START_RETRY_MS * attempt));
      }
    }
  }
  throw lastError;
}

async function ensureStarted(): Promise<HubConnection> {
  cancelScheduledStop();

  if (!connection) {
    connection = buildConnection();
    connection.on(EVENT_NAME, (notification: NotificationDto) => {
      for (const listener of listeners) {
        listener(notification);
      }
    });
  }

  if (connection.state === "Connected") {
    return connection;
  }

  if (!startPromise) {
    const conn = connection;
    startPromise = startWithRetry(conn)
      .catch((error) => {
        startPromise = null;
        if (isBenignHubStopError(error)) {
          return;
        }
        throw error;
      })
      .then(() => {
        startPromise = null;
      });
  }

  await startPromise;
  return connection;
}

function scheduleStopIfIdle() {
  if (listeners.size > 0 || !connection) {
    return;
  }

  cancelScheduledStop();
  const conn = connection;
  stopTimer = setTimeout(() => {
    stopTimer = null;
    if (listeners.size > 0) {
      return;
    }
    void conn.stop().catch(() => {
      // Ignore abort while tearing down an in-flight negotiate.
    });
    if (connection === conn) {
      connection = null;
      startPromise = null;
    }
  }, HUB_STOP_GRACE_MS);
}

export function subscribeToNotificationHub(listener: (notification: NotificationDto) => void): () => void {
  listeners.add(listener);
  cancelScheduledStop();

  void ensureStarted().catch((error) => {
    if (!isBenignHubStopError(error)) {
      // Real failures surface on next remount / invalidate.
    }
  });

  return () => {
    listeners.delete(listener);
    scheduleStopIfIdle();
  };
}

export async function startNotificationHub(): Promise<void> {
  await ensureStarted();
}
