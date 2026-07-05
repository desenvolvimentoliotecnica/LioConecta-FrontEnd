import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import type { NotificationDto } from "./types";

const HUB_URL = "/hubs/notifications";
const EVENT_NAME = "NotificationReceived";

let connection: HubConnection | null = null;
let startPromise: Promise<void> | null = null;
const listeners = new Set<(notification: NotificationDto) => void>();

function buildConnection(): HubConnection {
  return new HubConnectionBuilder()
    .withUrl(HUB_URL, {
      withCredentials: true,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10_000, 30_000])
    .configureLogging(LogLevel.Warning)
    .build();
}

async function ensureStarted(): Promise<HubConnection> {
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
    startPromise = connection
      .start()
      .catch((error) => {
        startPromise = null;
        throw error;
      })
      .then(() => {
        startPromise = null;
      });
  }

  await startPromise;
  return connection;
}

export function subscribeToNotificationHub(listener: (notification: NotificationDto) => void): () => void {
  listeners.add(listener);

  void ensureStarted().catch(() => {
    // Connection retries on next invalidate or remount.
  });

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && connection) {
      void connection.stop();
      connection = null;
      startPromise = null;
    }
  };
}

export async function startNotificationHub(): Promise<void> {
  await ensureStarted();
}
