import type { LoopBootstrapDto, UpdateAppSettingRequest, UserRole } from "../../api/types";

export type LoopSettings = {
  enabled: boolean;
  allowedRoles: UserRole[];
  allowedEmails: string[];
};

export const LOOP_SETTINGS_STORAGE_KEY = "lioconecta.loop.settings";

export const LOOP_SETTING_KEYS = {
  enabled: "loop.enabled",
  allowedRoles: "loop.allowed_roles",
  allowedEmails: "loop.allowed_emails",
} as const;

export const DEFAULT_LOOP_SETTINGS: LoopSettings = {
  enabled: true,
  allowedRoles: ["Manager", "Admin", "AnalyticsViewer"],
  allowedEmails: [],
};

export function loopSettingsToAppSettings(settings: LoopSettings): UpdateAppSettingRequest[] {
  return [
    { key: LOOP_SETTING_KEYS.enabled, value: settings.enabled ? "true" : "false" },
    { key: LOOP_SETTING_KEYS.allowedRoles, value: JSON.stringify(settings.allowedRoles) },
    { key: LOOP_SETTING_KEYS.allowedEmails, value: JSON.stringify(settings.allowedEmails) },
  ];
}

export function flattenAppSettingsMap(
  categories: { settings: { key: string; value: string }[] }[],
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const category of categories) {
    for (const setting of category.settings) {
      map[setting.key] = setting.value;
    }
  }
  return map;
}

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

export function loopSettingsFingerprint(settings: LoopSettings): string {
  return JSON.stringify({
    enabled: settings.enabled,
    allowedRoles: [...settings.allowedRoles].sort(),
    allowedEmails: [...settings.allowedEmails].sort(),
  });
}

export function loopSettingsPresentInMap(map: Record<string, string>): boolean {
  return Object.values(LOOP_SETTING_KEYS).some((key) => key in map);
}

export function resolveLoopSettingsFromSources(
  map: Record<string, string>,
  fallback: LoopSettings,
): LoopSettings {
  if (!loopSettingsPresentInMap(map)) {
    return fallback;
  }

  return parseLoopSettingsFromAppSettings(map, false);
}

export function loopSettingsPresentInCategories(
  categories: { settings: { key: string; value: string }[] }[],
): boolean {
  return loopSettingsPresentInMap(flattenAppSettingsMap(categories));
}

export function parseLoopSettingsFromBootstrap(bootstrap: LoopBootstrapDto): LoopSettings {
  return {
    enabled: bootstrap.enabled,
    allowedRoles: Array.isArray(bootstrap.allowedRoles)
      ? bootstrap.allowedRoles
      : DEFAULT_LOOP_SETTINGS.allowedRoles,
    allowedEmails: Array.isArray(bootstrap.allowedEmails)
      ? bootstrap.allowedEmails.filter((email): email is string => typeof email === "string")
      : DEFAULT_LOOP_SETTINGS.allowedEmails,
  };
}

export function parseLoopSettingsFromAppSettings(
  settings: Record<string, string> | undefined,
  fallbackToStorage = true,
): LoopSettings {
  if (!settings) {
    return fallbackToStorage ? readLoopSettingsFromStorage() : DEFAULT_LOOP_SETTINGS;
  }

  const enabled = settings[LOOP_SETTING_KEYS.enabled] !== "false";
  let allowedRoles = DEFAULT_LOOP_SETTINGS.allowedRoles;
  let allowedEmails: string[] = [];

  try {
    if (settings[LOOP_SETTING_KEYS.allowedRoles]) {
      allowedRoles = JSON.parse(settings[LOOP_SETTING_KEYS.allowedRoles]) as UserRole[];
    }
    if (settings[LOOP_SETTING_KEYS.allowedEmails]) {
      allowedEmails = JSON.parse(settings[LOOP_SETTING_KEYS.allowedEmails]) as string[];
    }
  } catch {
    // keep defaults
  }

  return { enabled, allowedRoles, allowedEmails };
}
