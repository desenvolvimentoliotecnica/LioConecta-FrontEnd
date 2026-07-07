import { getStoredToken } from "./hooks/useAuth";

/** JWT para negociação SignalR (query `access_token` + header no negotiate). */
export async function getHubAccessToken(): Promise<string> {
  return getStoredToken() ?? "";
}

export function hasPortalSession(): boolean {
  return Boolean(getStoredToken());
}
