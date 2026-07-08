const FAKE_PATTERNS = [
  /^\/avatar-[^/]+\.png$/i,
  /^avatar-[^/]+\.png$/i,
  /^\/avatar-ti\.png$/i,
  /^avatar-ti\.png$/i,
  /\/avatar-placeholder/i,
  /\/images\/avatar\//i,
];

export const PORTAL_AVATAR_BASE = "/assets/avatars/animals/";

function normalizePath(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function isPortalAvatarUrl(url: string | null | undefined): boolean {
  const normalized = normalizePath(String(url ?? ""));
  if (!normalized) return false;
  const path = normalized.split("?")[0].toLowerCase();
  return path.startsWith(`${PORTAL_AVATAR_BASE}avatar-`) && path.endsWith(".png");
}

export function isGraphPhotoUrl(url: string | null | undefined): boolean {
  const normalized = normalizePath(String(url ?? ""));
  if (!normalized) return false;

  if (/^(https?:|data:|blob:)/i.test(normalized)) {
    return /\/media\/people\//i.test(normalized);
  }

  const path = normalized.split("?")[0].toLowerCase();
  if (FAKE_PATTERNS.some((pattern) => pattern.test(path))) {
    return false;
  }

  return path.startsWith("/media/people/");
}

export function resolveGraphPhotoUrl(url: string | null | undefined): string | null {
  return isGraphPhotoUrl(url) ? normalizePath(String(url)) : null;
}

/** Portal avatar (edição manual) prevalece sobre foto do Graph. */
export function resolvePhotoUrl(url: string | null | undefined): string | null {
  if (isPortalAvatarUrl(url)) return normalizePath(String(url));
  return resolveGraphPhotoUrl(url);
}

export function resolvePhotoUrlFromSource(source: {
  photoUrl?: string | null;
  PhotoUrl?: string | null;
  img?: string | null;
  portalPhotoUrl?: string | null;
  PortalPhotoUrl?: string | null;
  graphPhotoUrl?: string | null;
  GraphPhotoUrl?: string | null;
} | string | null | undefined): string | null {
  if (!source) return null;
  if (typeof source === "string") return resolvePhotoUrl(source);

  const portal = source.portalPhotoUrl ?? source.PortalPhotoUrl ?? "";
  if (isPortalAvatarUrl(portal)) return normalizePath(portal);

  const primary = source.photoUrl ?? source.PhotoUrl ?? source.img ?? "";
  if (isPortalAvatarUrl(primary)) return normalizePath(primary);

  const graph = source.graphPhotoUrl ?? source.GraphPhotoUrl ?? primary;
  return resolveGraphPhotoUrl(graph);
}
