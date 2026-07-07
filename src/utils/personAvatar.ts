const FAKE_PATTERNS = [
  /^\/avatar-[^/]+\.png$/i,
  /^avatar-[^/]+\.png$/i,
  /^\/avatar-ti\.png$/i,
  /^avatar-ti\.png$/i,
  /\/avatar-placeholder/i,
  /\/images\/avatar\//i,
];

function normalizePath(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
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
