import type { CompassBootstrapDto, UpdateAppSettingRequest, UserRole } from "../../api/types";

export type CompassSettings = {
  enabled: boolean;
  allowedRoles: UserRole[];
  allowedEmails: string[];
};

export const COMPASS_SETTINGS_STORAGE_KEY = "lioconecta.compass.settings";

export const COMPASS_SETTING_KEYS = {
  enabled: "compass.enabled",
  allowedRoles: "compass.allowed_roles",
  allowedEmails: "compass.allowed_emails",
} as const;

export const DEFAULT_COMPASS_SETTINGS: CompassSettings = {
  enabled: true,
  allowedRoles: ["Manager", "Admin", "AnalyticsViewer"],
  allowedEmails: [],
};

export function compassSettingsToAppSettings(settings: CompassSettings): UpdateAppSettingRequest[] {
  return [
    { key: COMPASS_SETTING_KEYS.enabled, value: settings.enabled ? "true" : "false" },
    { key: COMPASS_SETTING_KEYS.allowedRoles, value: JSON.stringify(settings.allowedRoles) },
    { key: COMPASS_SETTING_KEYS.allowedEmails, value: JSON.stringify(settings.allowedEmails) },
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

export function parseCompassSettings(raw: string | null | undefined): CompassSettings {
  if (!raw?.trim()) return DEFAULT_COMPASS_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<CompassSettings>;
    return {
      enabled: parsed.enabled ?? DEFAULT_COMPASS_SETTINGS.enabled,
      allowedRoles: Array.isArray(parsed.allowedRoles)
        ? (parsed.allowedRoles as UserRole[])
        : DEFAULT_COMPASS_SETTINGS.allowedRoles,
      allowedEmails: Array.isArray(parsed.allowedEmails)
        ? parsed.allowedEmails.filter((e): e is string => typeof e === "string")
        : DEFAULT_COMPASS_SETTINGS.allowedEmails,
    };
  } catch {
    return DEFAULT_COMPASS_SETTINGS;
  }
}

export function readCompassSettingsFromStorage(): CompassSettings {
  if (typeof window === "undefined") return DEFAULT_COMPASS_SETTINGS;
  return parseCompassSettings(localStorage.getItem(COMPASS_SETTINGS_STORAGE_KEY));
}

export function writeCompassSettingsToStorage(settings: CompassSettings): void {
  localStorage.setItem(COMPASS_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function compassSettingsFingerprint(settings: CompassSettings): string {
  return JSON.stringify({
    enabled: settings.enabled,
    allowedRoles: [...settings.allowedRoles].sort(),
    allowedEmails: [...settings.allowedEmails].sort(),
  });
}

export function compassSettingsPresentInMap(map: Record<string, string>): boolean {
  return Object.values(COMPASS_SETTING_KEYS).some((key) => key in map);
}

export function resolveCompassSettingsFromSources(
  map: Record<string, string>,
  fallback: CompassSettings,
): CompassSettings {
  if (!compassSettingsPresentInMap(map)) {
    return fallback;
  }

  return parseCompassSettingsFromAppSettings(map, false);
}

export function compassSettingsPresentInCategories(
  categories: { settings: { key: string; value: string }[] }[],
): boolean {
  return compassSettingsPresentInMap(flattenAppSettingsMap(categories));
}

export function parseCompassSettingsFromBootstrap(bootstrap: CompassBootstrapDto): CompassSettings {
  return {
    enabled: bootstrap.enabled,
    allowedRoles: Array.isArray(bootstrap.allowedRoles)
      ? bootstrap.allowedRoles
      : DEFAULT_COMPASS_SETTINGS.allowedRoles,
    allowedEmails: Array.isArray(bootstrap.allowedEmails)
      ? bootstrap.allowedEmails.filter((email): email is string => typeof email === "string")
      : DEFAULT_COMPASS_SETTINGS.allowedEmails,
  };
}

export function parseCompassSettingsFromAppSettings(
  settings: Record<string, string> | undefined,
  fallbackToStorage = true,
): CompassSettings {
  if (!settings) {
    return fallbackToStorage ? readCompassSettingsFromStorage() : DEFAULT_COMPASS_SETTINGS;
  }

  const enabled = settings[COMPASS_SETTING_KEYS.enabled] !== "false";
  let allowedRoles = DEFAULT_COMPASS_SETTINGS.allowedRoles;
  let allowedEmails: string[] = [];

  try {
    if (settings[COMPASS_SETTING_KEYS.allowedRoles]) {
      allowedRoles = JSON.parse(settings[COMPASS_SETTING_KEYS.allowedRoles]) as UserRole[];
    }
    if (settings[COMPASS_SETTING_KEYS.allowedEmails]) {
      allowedEmails = JSON.parse(settings[COMPASS_SETTING_KEYS.allowedEmails]) as string[];
    }
  } catch {
    // keep defaults
  }

  return { enabled, allowedRoles, allowedEmails };
}
