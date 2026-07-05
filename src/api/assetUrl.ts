import { apiConfig } from "./config";

const DEFAULT_DEV_API_ORIGIN = "http://localhost:5148";

/** Origin da API (sem path). */
export function getApiOrigin(): string {
  const explicit = import.meta.env.VITE_API_ORIGIN?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const base = apiConfig.apiBaseUrl;
  if (/^https?:\/\//i.test(base)) {
    return new URL(base).origin;
  }

  if (import.meta.env.DEV) {
    return DEFAULT_DEV_API_ORIGIN;
  }

  return "";
}

/** Resolve URLs de arquivos servidos pelo backend (/posts/medias, /media/...). */
export function resolveBackendAssetUrl(url: string | null | undefined): string {
  if (!url?.trim()) {
    return "";
  }

  const trimmed = url.trim();
  if (/^(https?:|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const servedByBackend =
    normalized.startsWith("/posts/") || normalized.startsWith("/media/");

  if (!servedByBackend) {
    return normalized;
  }

  const origin = getApiOrigin();
  return origin ? `${origin}${normalized}` : normalized;
}
