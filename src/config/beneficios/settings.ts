import type { MeDto, UserRole } from "../../api/types";

export type BeneficiosSettings = {
  allowedRoles: UserRole[];
  allowedEmails: string[];
};

export const BENEFICIOS_SETTING_KEYS = {
  allowedRoles: "benefits.allowed_roles",
  allowedEmails: "benefits.allowed_emails",
} as const;

export const DEFAULT_BENEFICIOS_SETTINGS: BeneficiosSettings = {
  allowedRoles: ["HR"],
  allowedEmails: [],
};

const ROLE_INDEX: Record<UserRole, number> = {
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

export function canManageBeneficios(
  me: MeDto | undefined,
  settings: BeneficiosSettings | undefined,
): boolean {
  if (!me) return false;
  if (me.roles.some((role) => role === "Admin" || role === ROLE_INDEX.Admin)) return true;
  if (!settings) return false;

  if (settings.allowedEmails.some((email) => email.toLowerCase() === me.email.toLowerCase())) {
    return true;
  }

  return settings.allowedRoles.some((role) =>
    me.roles.some((value) => value === role || value === ROLE_INDEX[role]),
  );
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
