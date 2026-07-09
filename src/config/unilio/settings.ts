import type { UniLioBootstrapDto, UpdateAppSettingRequest, UserRole } from "../../api/types";

export type UniLioSettings = {
  enabled: boolean;
  allowedRoles: UserRole[];
  allowedEmails: string[];
};

export const UNILIO_SETTINGS_STORAGE_KEY = "lioconecta.unilio.settings";

export const UNILIO_SETTING_KEYS = {
  enabled: "unilio.enabled",
  /** @deprecated Access is RBAC-managed — use PERMISSIONS.unilio.access */
  allowedRoles: "unilio.allowed_roles",
  /** @deprecated Access is RBAC-managed — use Controle de acesso */
  allowedEmails: "unilio.allowed_emails",
} as const;

export const DEFAULT_UNILIO_SETTINGS: UniLioSettings = {
  enabled: true,
  allowedRoles: ["Employee", "Manager", "HR", "Admin"],
  allowedEmails: [],
};

export function unilioSettingsToAppSettings(settings: UniLioSettings): UpdateAppSettingRequest[] {
  return [
    { key: UNILIO_SETTING_KEYS.enabled, value: settings.enabled ? "true" : "false" },
    { key: UNILIO_SETTING_KEYS.allowedRoles, value: JSON.stringify(settings.allowedRoles) },
    { key: UNILIO_SETTING_KEYS.allowedEmails, value: JSON.stringify(settings.allowedEmails) },
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

export function parseUniLioSettings(raw: string | null | undefined): UniLioSettings {
  if (!raw?.trim()) return DEFAULT_UNILIO_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<UniLioSettings>;
    return {
      enabled: parsed.enabled ?? DEFAULT_UNILIO_SETTINGS.enabled,
      allowedRoles: Array.isArray(parsed.allowedRoles)
        ? (parsed.allowedRoles as UserRole[])
        : DEFAULT_UNILIO_SETTINGS.allowedRoles,
      allowedEmails: Array.isArray(parsed.allowedEmails)
        ? parsed.allowedEmails.filter((e): e is string => typeof e === "string")
        : DEFAULT_UNILIO_SETTINGS.allowedEmails,
    };
  } catch {
    return DEFAULT_UNILIO_SETTINGS;
  }
}

export function readUniLioSettingsFromStorage(): UniLioSettings {
  if (typeof window === "undefined") return DEFAULT_UNILIO_SETTINGS;
  return parseUniLioSettings(localStorage.getItem(UNILIO_SETTINGS_STORAGE_KEY));
}

export function writeUniLioSettingsToStorage(settings: UniLioSettings): void {
  localStorage.setItem(UNILIO_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function unilioSettingsFingerprint(settings: UniLioSettings): string {
  return JSON.stringify({
    enabled: settings.enabled,
    allowedRoles: [...settings.allowedRoles].sort(),
    allowedEmails: [...settings.allowedEmails].sort(),
  });
}

export function unilioSettingsPresentInMap(map: Record<string, string>): boolean {
  return Object.values(UNILIO_SETTING_KEYS).some((key) => key in map);
}

export function resolveUniLioSettingsFromSources(
  map: Record<string, string>,
  fallback: UniLioSettings,
): UniLioSettings {
  if (!unilioSettingsPresentInMap(map)) {
    return fallback;
  }
  return parseUniLioSettingsFromAppSettings(map, false);
}

export function unilioSettingsPresentInCategories(
  categories: { settings: { key: string; value: string }[] }[],
): boolean {
  return unilioSettingsPresentInMap(flattenAppSettingsMap(categories));
}

export function parseUniLioSettingsFromBootstrap(bootstrap: UniLioBootstrapDto): UniLioSettings {
  return {
    enabled: bootstrap.enabled,
    allowedRoles: Array.isArray(bootstrap.allowedRoles)
      ? (bootstrap.allowedRoles as UserRole[])
      : DEFAULT_UNILIO_SETTINGS.allowedRoles,
    allowedEmails: Array.isArray(bootstrap.allowedEmails)
      ? bootstrap.allowedEmails.filter((email): email is string => typeof email === "string")
      : DEFAULT_UNILIO_SETTINGS.allowedEmails,
  };
}

export function parseUniLioSettingsFromAppSettings(
  settings: Record<string, string> | undefined,
  fallbackToStorage = true,
): UniLioSettings {
  if (!settings) {
    return fallbackToStorage ? readUniLioSettingsFromStorage() : DEFAULT_UNILIO_SETTINGS;
  }

  const enabled = settings[UNILIO_SETTING_KEYS.enabled] !== "false";
  let allowedRoles = DEFAULT_UNILIO_SETTINGS.allowedRoles;
  let allowedEmails: string[] = [];

  try {
    if (settings[UNILIO_SETTING_KEYS.allowedRoles]) {
      allowedRoles = JSON.parse(settings[UNILIO_SETTING_KEYS.allowedRoles]) as UserRole[];
    }
    if (settings[UNILIO_SETTING_KEYS.allowedEmails]) {
      allowedEmails = JSON.parse(settings[UNILIO_SETTING_KEYS.allowedEmails]) as string[];
    }
  } catch {
    // keep defaults
  }

  return { enabled, allowedRoles, allowedEmails };
}
