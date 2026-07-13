import type { CompassBootstrapDto, UpdateAppSettingRequest, UserRole } from "../../api/types";

export const COMPASS_SECRET_MASK = "********";

export type CompassSettings = {
  enabled: boolean;
  allowedRoles: UserRole[];
  allowedEmails: string[];
  datalakeHost: string;
  datalakeUsername: string;
  datalakePassword: string;
  datalakeDatabase: string;
  datalakePort: string;
  datalakePasswordHasValue: boolean;
};

export const COMPASS_SETTINGS_STORAGE_KEY = "lioconecta.compass.settings";

export const COMPASS_SETTING_KEYS = {
  enabled: "compass.enabled",
  /** @deprecated Access is RBAC-managed — use PERMISSIONS.compass.access */
  allowedRoles: "compass.allowed_roles",
  /** @deprecated Access is RBAC-managed — use Controle de acesso */
  allowedEmails: "compass.allowed_emails",
  datalakeHost: "compass.datalake.host",
  datalakeUsername: "compass.datalake.username",
  datalakePassword: "compass.datalake.password",
  datalakeDatabase: "compass.datalake.database",
  datalakePort: "compass.datalake.port",
} as const;

export const DEFAULT_COMPASS_SETTINGS: CompassSettings = {
  enabled: true,
  allowedRoles: ["Manager", "Admin", "AnalyticsViewer"],
  allowedEmails: [],
  datalakeHost: "",
  datalakeUsername: "",
  datalakePassword: "",
  datalakeDatabase: "datalake",
  datalakePort: "5432",
  datalakePasswordHasValue: false,
};

export function compassSettingsToAppSettings(settings: CompassSettings): UpdateAppSettingRequest[] {
  const payload: UpdateAppSettingRequest[] = [
    { key: COMPASS_SETTING_KEYS.enabled, value: settings.enabled ? "true" : "false" },
    { key: COMPASS_SETTING_KEYS.allowedRoles, value: JSON.stringify(settings.allowedRoles) },
    { key: COMPASS_SETTING_KEYS.allowedEmails, value: JSON.stringify(settings.allowedEmails) },
    { key: COMPASS_SETTING_KEYS.datalakeHost, value: settings.datalakeHost.trim() },
    { key: COMPASS_SETTING_KEYS.datalakeUsername, value: settings.datalakeUsername.trim() },
    { key: COMPASS_SETTING_KEYS.datalakeDatabase, value: settings.datalakeDatabase.trim() || "datalake" },
    { key: COMPASS_SETTING_KEYS.datalakePort, value: settings.datalakePort.trim() || "5432" },
  ];

  const password = settings.datalakePassword.trim();
  if (password && password !== COMPASS_SECRET_MASK) {
    payload.push({ key: COMPASS_SETTING_KEYS.datalakePassword, value: password });
  }

  return payload;
}

export function flattenAppSettingsMap(
  categories: { settings: { key: string; value: string; hasValue?: boolean }[] }[],
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const category of categories) {
    for (const setting of category.settings) {
      map[setting.key] = setting.value;
    }
  }
  return map;
}

export function flattenAppSettingsHasValueMap(
  categories: { settings: { key: string; hasValue?: boolean }[] }[],
): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  for (const category of categories) {
    for (const setting of category.settings) {
      map[setting.key] = Boolean(setting.hasValue);
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
      datalakeHost: parsed.datalakeHost ?? "",
      datalakeUsername: parsed.datalakeUsername ?? "",
      datalakePassword: "",
      datalakeDatabase: parsed.datalakeDatabase || "datalake",
      datalakePort: parsed.datalakePort || "5432",
      datalakePasswordHasValue: Boolean(parsed.datalakePasswordHasValue),
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
  const toStore: CompassSettings = {
    ...settings,
    datalakePassword: "",
  };
  localStorage.setItem(COMPASS_SETTINGS_STORAGE_KEY, JSON.stringify(toStore));
}

export function compassSettingsFingerprint(settings: CompassSettings): string {
  return JSON.stringify({
    enabled: settings.enabled,
    allowedRoles: [...settings.allowedRoles].sort(),
    allowedEmails: [...settings.allowedEmails].sort(),
    datalakeHost: settings.datalakeHost,
    datalakeUsername: settings.datalakeUsername,
    datalakeDatabase: settings.datalakeDatabase,
    datalakePort: settings.datalakePort,
    datalakePasswordHasValue: settings.datalakePasswordHasValue,
  });
}

export function compassSettingsPresentInMap(map: Record<string, string>): boolean {
  return Object.values(COMPASS_SETTING_KEYS).some((key) => key in map);
}

export function resolveCompassSettingsFromSources(
  map: Record<string, string>,
  fallback: CompassSettings,
  hasValueMap?: Record<string, boolean>,
): CompassSettings {
  if (!compassSettingsPresentInMap(map)) {
    return fallback;
  }

  return parseCompassSettingsFromAppSettings(map, false, hasValueMap);
}

export function compassSettingsPresentInCategories(
  categories: { settings: { key: string; value: string }[] }[],
): boolean {
  return compassSettingsPresentInMap(flattenAppSettingsMap(categories));
}

export function parseCompassSettingsFromBootstrap(bootstrap: CompassBootstrapDto): CompassSettings {
  return {
    ...DEFAULT_COMPASS_SETTINGS,
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
  hasValueMap?: Record<string, boolean>,
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

  const passwordRaw = settings[COMPASS_SETTING_KEYS.datalakePassword] ?? "";
  const passwordHasValue =
    hasValueMap?.[COMPASS_SETTING_KEYS.datalakePassword] ??
    (passwordRaw === COMPASS_SECRET_MASK || Boolean(passwordRaw));

  return {
    enabled,
    allowedRoles,
    allowedEmails,
    datalakeHost: settings[COMPASS_SETTING_KEYS.datalakeHost] ?? "",
    datalakeUsername: settings[COMPASS_SETTING_KEYS.datalakeUsername] ?? "",
    datalakePassword: passwordHasValue ? COMPASS_SECRET_MASK : "",
    datalakeDatabase: settings[COMPASS_SETTING_KEYS.datalakeDatabase] || "datalake",
    datalakePort: settings[COMPASS_SETTING_KEYS.datalakePort] || "5432",
    datalakePasswordHasValue: passwordHasValue,
  };
}
