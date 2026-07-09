import type { Location } from "react-router-dom";

const RETURN_URL_KEY = "lio.auth.returnUrl";
const LOGIN_PATH = "/acesso";

function isSafeInternalPath(path: string): boolean {
  if (!path.startsWith("/")) {
    return false;
  }
  if (path.startsWith("//")) {
    return false;
  }
  if (/^\/[^/]*:/i.test(path)) {
    return false;
  }
  if (path === LOGIN_PATH || path.startsWith(`${LOGIN_PATH}?`) || path.startsWith(`${LOGIN_PATH}#`)) {
    return false;
  }
  return true;
}

export function buildReturnUrl(location: Pick<Location, "pathname" | "search" | "hash">): string {
  return `${location.pathname}${location.search}${location.hash}`;
}

export function saveReturnUrl(url: string): void {
  if (isSafeInternalPath(url)) {
    sessionStorage.setItem(RETURN_URL_KEY, url);
  }
}

export function clearReturnUrl(): void {
  sessionStorage.removeItem(RETURN_URL_KEY);
}

function readStoredReturnUrl(): string | null {
  const stored = sessionStorage.getItem(RETURN_URL_KEY);
  return stored && isSafeInternalPath(stored) ? stored : null;
}

export function resolvePostLoginRedirect(
  location: Pick<Location, "state" | "search">,
  options?: { includeStored?: boolean },
): string {
  const fromState = (location.state as { from?: string } | null)?.from;
  if (fromState && isSafeInternalPath(fromState)) {
    return fromState;
  }

  if (options?.includeStored) {
    const stored = readStoredReturnUrl();
    if (stored) {
      return stored;
    }
  }

  const returnUrl = new URLSearchParams(location.search).get("returnUrl");
  if (returnUrl && isSafeInternalPath(returnUrl)) {
    return returnUrl;
  }

  return "/";
}

export function buildLoginRedirect(returnTo: string): { pathname: string; search?: string; state: { from: string } } {
  saveReturnUrl(returnTo);
  const safeReturnTo = isSafeInternalPath(returnTo) ? returnTo : "/";

  return {
    pathname: LOGIN_PATH,
    search: safeReturnTo !== "/" ? `returnUrl=${encodeURIComponent(safeReturnTo)}` : undefined,
    state: { from: safeReturnTo },
  };
}
