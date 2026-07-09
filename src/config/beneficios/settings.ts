import type { MeDto, UserRole } from "../../api/types";
import { hasPermission } from "../../api/auth";
import { PERMISSIONS } from "../rbac/permissions";

export type BeneficiosSettings = {
  allowedRoles: UserRole[];
  allowedEmails: string[];
};

export const BENEFICIOS_SETTING_KEYS = {
  /** @deprecated Access is RBAC-managed — use PERMISSIONS.benefits.manage */
  allowedRoles: "benefits.allowed_roles",
  /** @deprecated Access is RBAC-managed — use Controle de acesso */
  allowedEmails: "benefits.allowed_emails",
} as const;

export const DEFAULT_BENEFICIOS_SETTINGS: BeneficiosSettings = {
  allowedRoles: ["HR"],
  allowedEmails: [],
};

export function canManageBeneficios(me: MeDto | undefined, _settings?: BeneficiosSettings): boolean {
  return hasPermission(me, PERMISSIONS.benefits.manage);
}

export function beneficiosSettingsToAppSettings(settings: BeneficiosSettings) {
  return [
    { key: BENEFICIOS_SETTING_KEYS.allowedRoles, value: JSON.stringify(settings.allowedRoles) },
    { key: BENEFICIOS_SETTING_KEYS.allowedEmails, value: JSON.stringify(settings.allowedEmails) },
  ];
}

export function parseBeneficiosSettingsFromAppSettings(
  settings: Record<string, string> | undefined,
): BeneficiosSettings {
  if (!settings) {
    return DEFAULT_BENEFICIOS_SETTINGS;
  }

  let allowedRoles = DEFAULT_BENEFICIOS_SETTINGS.allowedRoles;
  let allowedEmails: string[] = [];

  try {
    if (settings[BENEFICIOS_SETTING_KEYS.allowedRoles]) {
      allowedRoles = JSON.parse(settings[BENEFICIOS_SETTING_KEYS.allowedRoles]) as UserRole[];
    }
    if (settings[BENEFICIOS_SETTING_KEYS.allowedEmails]) {
      allowedEmails = JSON.parse(settings[BENEFICIOS_SETTING_KEYS.allowedEmails]) as string[];
    }
  } catch {
    // keep defaults
  }

  return { allowedRoles, allowedEmails };
}

export const BENEFIT_CATEGORIES = [
  { id: "saude", label: "Saúde" },
  { id: "alimentacao", label: "Alimentação" },
  { id: "mobilidade", label: "Mobilidade" },
  { id: "qualidade", label: "Qualidade de vida" },
  { id: "familia", label: "Família" },
] as const;

export const BENEFIT_STATUSES = [
  { id: "obrigatorio", label: "Obrigatório" },
  { id: "opcional", label: "Opcional" },
  { id: "flexivel", label: "Flexível" },
] as const;
