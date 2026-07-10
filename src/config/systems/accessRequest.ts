/**
 * Preferência de categoria ITIL (GLPI) para solicitações de acesso a sistemas.
 *
 * Backend (opcional): chave `helpdesk.systems_access_category_id` em app-settings
 * (id numérico da categoria raiz ou leaf no GLPI).
 *
 * Frontend (opcional): `VITE_HELPDESK_SYSTEMS_ACCESS_CATEGORY_ID` no .env.
 * Sem config, o resolver usa fallback por nome (Identidade e Acessos → Sistemas Corporativos).
 */

export const SYSTEMS_ACCESS_CATEGORY_SETTING_KEY = "helpdesk.systems_access_category_id";

export const SYSTEMS_ACCESS_PREFERRED_ROOT_NAMES = [
  "Identidade e Acessos",
  "Sistemas Corporativos",
] as const;

export const SYSTEMS_ACCESS_TI_AREA_ID = "ti";

export const SYSTEMS_ACCESS_ENVIRONMENTS = [
  { value: "dev", label: "Dev" },
  { value: "hml", label: "HML" },
  { value: "prd", label: "PRD" },
] as const;

export type SystemsAccessEnvironment = (typeof SYSTEMS_ACCESS_ENVIRONMENTS)[number]["value"];

export function parseSystemsAccessCategoryIdFromMap(
  settings: Record<string, string> | undefined | null,
): number | null {
  if (!settings) return null;
  const raw = settings[SYSTEMS_ACCESS_CATEGORY_SETTING_KEY]?.trim();
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function readSystemsAccessCategoryIdFromEnv(): number | null {
  const raw = import.meta.env.VITE_HELPDESK_SYSTEMS_ACCESS_CATEGORY_ID;
  if (typeof raw !== "string" || !raw.trim()) return null;
  const parsed = Number.parseInt(raw.trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
