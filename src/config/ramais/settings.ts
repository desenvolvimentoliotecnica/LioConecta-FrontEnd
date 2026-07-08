import type { MeDto, UserRole } from "../../api/types";

export type RamaisSettings = {
  allowedRoles: UserRole[];
  allowedEmails: string[];
};

export const RAMAIS_SETTING_KEYS = {
  allowedRoles: "ramais.allowed_roles",
  allowedEmails: "ramais.allowed_emails",
} as const;

export const DEFAULT_RAMAIS_SETTINGS: RamaisSettings = {
  allowedRoles: ["HR"],
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

export function canManageRamais(me: MeDto | undefined, settings: RamaisSettings | undefined): boolean {
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

export function ramaisSettingsToAppSettings(settings: RamaisSettings) {
  return [
    { key: RAMAIS_SETTING_KEYS.allowedRoles, value: JSON.stringify(settings.allowedRoles) },
    { key: RAMAIS_SETTING_KEYS.allowedEmails, value: JSON.stringify(settings.allowedEmails) },
  ];
}

export function parseRamaisSettingsFromAppSettings(
  settings: Record<string, string> | undefined,
): RamaisSettings {
  if (!settings) {
    return DEFAULT_RAMAIS_SETTINGS;
  }

  let allowedRoles = DEFAULT_RAMAIS_SETTINGS.allowedRoles;
  let allowedEmails: string[] = [];

  try {
    if (settings[RAMAIS_SETTING_KEYS.allowedRoles]) {
      allowedRoles = JSON.parse(settings[RAMAIS_SETTING_KEYS.allowedRoles]) as UserRole[];
    }
    if (settings[RAMAIS_SETTING_KEYS.allowedEmails]) {
      allowedEmails = JSON.parse(settings[RAMAIS_SETTING_KEYS.allowedEmails]) as string[];
    }
  } catch {
    // keep defaults
  }

  return { allowedRoles, allowedEmails };
}
