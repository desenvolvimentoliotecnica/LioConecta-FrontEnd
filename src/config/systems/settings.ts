import type { MeDto, UserRole } from "../../api/types";

export type SystemsSettings = {
  allowedRoles: UserRole[];
  allowedEmails: string[];
};

export const SYSTEMS_SETTING_KEYS = {
  allowedRoles: "systems.allowed_roles",
  allowedEmails: "systems.allowed_emails",
} as const;

export const DEFAULT_SYSTEMS_SETTINGS: SystemsSettings = {
  allowedRoles: ["TI"],
  allowedEmails: [],
};

function roleToIndex(role: UserRole): number {
  const map: Record<UserRole, number> = {
    Employee: 0,
    Manager: 1,
    HR: 2,
    TI: 3,
    Facilities: 4,
    Legal: 5,
    Admin: 6,
    AnalyticsViewer: 7,
    KioskReader: 8,
  };
  return map[role];
}

export function canManageSystems(me: MeDto | undefined, settings: SystemsSettings | undefined): boolean {
  if (!me) return false;
  if (me.roles.some((role) => role === "Admin" || role === 6)) return true;
  if (!settings) return false;

  if (settings.allowedEmails.some((email) => email.toLowerCase() === me.email.toLowerCase())) {
    return true;
  }

  return settings.allowedRoles.some((role) =>
    me.roles.some((value) => value === role || value === roleToIndex(role)),
  );
}

export function systemsSettingsToAppSettings(settings: SystemsSettings) {
  return [
    { key: SYSTEMS_SETTING_KEYS.allowedRoles, value: JSON.stringify(settings.allowedRoles) },
    { key: SYSTEMS_SETTING_KEYS.allowedEmails, value: JSON.stringify(settings.allowedEmails) },
  ];
}

export function parseSystemsSettingsFromAppSettings(
  settings: Record<string, string> | undefined,
): SystemsSettings {
  if (!settings) {
    return DEFAULT_SYSTEMS_SETTINGS;
  }

  let allowedRoles = DEFAULT_SYSTEMS_SETTINGS.allowedRoles;
  let allowedEmails: string[] = [];

  try {
    if (settings[SYSTEMS_SETTING_KEYS.allowedRoles]) {
      allowedRoles = JSON.parse(settings[SYSTEMS_SETTING_KEYS.allowedRoles]) as UserRole[];
    }
    if (settings[SYSTEMS_SETTING_KEYS.allowedEmails]) {
      allowedEmails = JSON.parse(settings[SYSTEMS_SETTING_KEYS.allowedEmails]) as string[];
    }
  } catch {
    // keep defaults
  }

  return { allowedRoles, allowedEmails };
}
