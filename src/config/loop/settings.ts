import type { UserRole } from "../../api/types";

export type LoopSettings = {
  enabled: boolean;
  allowedRoles: UserRole[];
  allowedEmails: string[];
};

export const LOOP_SETTINGS_STORAGE_KEY = "lioconecta.loop.settings";

export const DEFAULT_LOOP_SETTINGS: LoopSettings = {
  enabled: true,
  allowedRoles: ["Manager", "Admin", "AnalyticsViewer"],
  allowedEmails: [],
};

export function parseLoopSettings(raw: string | null | undefined): LoopSettings {
  if (!raw?.trim()) return DEFAULT_LOOP_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<LoopSettings>;
    return {
      enabled: parsed.enabled ?? DEFAULT_LOOP_SETTINGS.enabled,
      allowedRoles: Array.isArray(parsed.allowedRoles)
        ? (parsed.allowedRoles as UserRole[])
        : DEFAULT_LOOP_SETTINGS.allowedRoles,
      allowedEmails: Array.isArray(parsed.allowedEmails)
        ? parsed.allowedEmails.filter((e): e is string => typeof e === "string")
        : DEFAULT_LOOP_SETTINGS.allowedEmails,
    };
  } catch {
    return DEFAULT_LOOP_SETTINGS;
  }
}

export function readLoopSettingsFromStorage(): LoopSettings {
  if (typeof window === "undefined") return DEFAULT_LOOP_SETTINGS;
  return parseLoopSettings(localStorage.getItem(LOOP_SETTINGS_STORAGE_KEY));
}

export function writeLoopSettingsToStorage(settings: LoopSettings): void {
  localStorage.setItem(LOOP_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function parseLoopSettingsFromAppSettings(
  settings: Record<string, string> | undefined,
): LoopSettings {
  if (!settings) return readLoopSettingsFromStorage();

  const enabled = settings["loop.enabled"] !== "false";
  let allowedRoles = DEFAULT_LOOP_SETTINGS.allowedRoles;
  let allowedEmails: string[] = [];

  try {
    if (settings["loop.allowed_roles"]) {
      allowedRoles = JSON.parse(settings["loop.allowed_roles"]) as UserRole[];
    }
    if (settings["loop.allowed_emails"]) {
      allowedEmails = JSON.parse(settings["loop.allowed_emails"]) as string[];
    }
  } catch {
    // keep defaults
  }

  return { enabled, allowedRoles, allowedEmails };
}
