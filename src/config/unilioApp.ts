import { getStoredToken } from "../api/hooks/useAuth";

/** Base URL da SPA UniLio standalone (sem barra final). Vazio = módulo embutido no portal. */
export function getUniLioAppBaseUrl(): string {
  const raw = (import.meta.env.VITE_UNILIO_APP_URL ?? "").trim();
  return raw.replace(/\/$/, "");
}

export function isUniLioExternalEnabled(): boolean {
  return getUniLioAppBaseUrl().length > 0;
}

/**
 * URL de lançamento do UniLio (app própria) com token JWT do portal.
 * Ex.: http://localhost:5176/unilio?token=...
 */
export function buildUniLioLaunchUrl(path = "/unilio"): string {
  const base = getUniLioAppBaseUrl();
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
