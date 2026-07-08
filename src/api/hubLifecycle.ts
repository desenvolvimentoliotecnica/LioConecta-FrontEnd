import { LogLevel } from "@microsoft/signalr";

/** SignalR's own console logger — silence Expected Strict Mode abort noise. */
export const HUB_LOG_LEVEL = LogLevel.None;

/** Grace period so React Strict Mode remount can re-subscribe before stop. */
export const HUB_STOP_GRACE_MS = 300;

export function isBenignHubStopError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /stopped during negotiation|connection was stopped|AbortError|The connection is being stopped/i.test(
    message,
  );
}
