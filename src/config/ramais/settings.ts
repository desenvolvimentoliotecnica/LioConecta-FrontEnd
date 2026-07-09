import type { MeDto, UserRole } from "../../api/types";
import { hasPermission } from "../../api/auth";
import { PERMISSIONS } from "../rbac/permissions";

export type RamaisSettings = {
  allowedRoles: UserRole[];
  allowedEmails: string[];
};

export const RAMAIS_SETTING_KEYS = {
  /** @deprecated Access is RBAC-managed — use PERMISSIONS.ramais.manage */
  allowedRoles: "ramais.allowed_roles",
  /** @deprecated Access is RBAC-managed — use Controle de acesso */
  allowedEmails: "ramais.allowed_emails",
} as const;

export const DEFAULT_RAMAIS_SETTINGS: RamaisSettings = {
  allowedRoles: ["HR"],
  allowedEmails: [],
};

export function canManageRamais(me: MeDto | undefined, _settings?: RamaisSettings): boolean {
  return hasPermission(me, PERMISSIONS.ramais.manage);
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
