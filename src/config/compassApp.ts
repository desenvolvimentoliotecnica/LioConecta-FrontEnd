import { getStoredToken } from "../api/hooks/useAuth";

/** Base URL da SPA Compass standalone (sem barra final). Vazio = módulo embutido no portal. */
export function getCompassAppBaseUrl(): string {
  const raw = (import.meta.env.VITE_COMPASS_APP_URL ?? "").trim();
  return raw.replace(/\/$/, "");
}

export function isCompassExternalEnabled(): boolean {
  return getCompassAppBaseUrl().length > 0;
}

/**
 * URL de lançamento do Compass (app própria) com token JWT do portal.
 * Ex.: http://localhost:5174/compass?token=...
 */
export function buildCompassLaunchUrl(path = "/compass"): string {
  const base = getCompassAppBaseUrl();
  if (!base) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(normalizedPath, `${base}/`);
  const token = getStoredToken();
  if (token) {
    url.searchParams.set("token", token);
  }
  return url.toString();
}
