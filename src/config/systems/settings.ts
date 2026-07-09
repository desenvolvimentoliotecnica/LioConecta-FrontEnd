import type { MeDto, UserRole } from "../../api/types";
import { hasPermission } from "../../api/auth";
import { PERMISSIONS } from "../rbac/permissions";

export type SystemsSettings = {
  allowedRoles: UserRole[];
  allowedEmails: string[];
};

export const SYSTEMS_SETTING_KEYS = {
  /** @deprecated Access is RBAC-managed — use PERMISSIONS.systems.manage */
  allowedRoles: "systems.allowed_roles",
  /** @deprecated Access is RBAC-managed — use Controle de acesso */
  allowedEmails: "systems.allowed_emails",
} as const;

export const DEFAULT_SYSTEMS_SETTINGS: SystemsSettings = {
  allowedRoles: ["TI"],
  allowedEmails: [],
};

export function canManageSystems(me: MeDto | undefined, _settings?: SystemsSettings): boolean {
  return hasPermission(me, PERMISSIONS.systems.manage);
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
