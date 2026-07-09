import type { MeDto, MenuDayStatus, MenuMealType, MenuSectionDto, UserRole } from "../../api/types";
import { hasPermission } from "../../api/auth";
import { PERMISSIONS } from "../rbac/permissions";

export type MenuSectionTemplate = {
  key: string;
  label: string;
};

export type MenuEditorSettings = {
  allowedRoles: UserRole[];
  allowedEmails: string[];
  emailRecipients: string[];
};

export const MENU_SETTING_KEYS = {
  /** @deprecated Access is RBAC-managed — use PERMISSIONS.facilities.menuManage */
  allowedRoles: "facilities.menu.allowed_roles",
  /** @deprecated Access is RBAC-managed — use Controle de acesso */
  allowedEmails: "facilities.menu.allowed_emails",
  emailRecipients: "facilities.menu.email_recipients",
} as const;

export const DEFAULT_MENU_EDITOR_SETTINGS: MenuEditorSettings = {
  allowedRoles: ["Facilities", "Admin"],
  allowedEmails: [],
  emailRecipients: [],
};

export const MEAL_TYPES: MenuMealType[] = [
  "breakfast",
  "lunch",
  "afternoon_coffee",
  "dinner",
  "shift",
];

export const MEAL_LABELS: Record<MenuMealType, string> = {
  breakfast: "Café da manhã",
  lunch: "Almoço",
  afternoon_coffee: "Café da tarde",
  dinner: "Janta",
  shift: "Plantão",
};

export const LUNCH_SECTIONS: MenuSectionTemplate[] = [
  { key: "entrada", label: "Entrada (Sopas)" },
  { key: "main_1", label: "Prato principal 1" },
  { key: "main_2", label: "Prato principal 2" },
  { key: "guarnicao", label: "Guarnição" },
  { key: "salada_1", label: "Salada 1*" },
  { key: "salada_2", label: "Salada 2*" },
  { key: "salada_3", label: "Salada 3*" },
  { key: "farofa", label: "Farofa Qualimax" },
  { key: "gourmet", label: "Espaço Gourmet" },
  { key: "sobremesa", label: "Sobremesa" },
  { key: "fruta", label: "Fruta*" },
  { key: "light", label: "Light" },
];

export const DAY_LABELS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"] as const;

export function createEmptyLunchSections(): MenuSectionDto[] {
  return LUNCH_SECTIONS.map((section) => ({
    key: section.key,
    label: section.label,
    value: "",
  }));
}

export function createEmptyDailyMenu(date: string) {
  return {
    date,
    dayStatus: "normal" as MenuDayStatus,
    dayStatusLabel: null,
    meals: [
      {
        mealType: "lunch" as MenuMealType,
        sections: createEmptyLunchSections(),
      },
    ],
    notes: null,
    published: false,
  };
}

export function getMondayOfWeek(date: Date): Date {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
}

export function getWeekDates(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, index) => addDaysToDateKey(weekStart, index));
}

export function formatWeekRangeLabel(weekStart: string): string {
  const start = parseDateKey(weekStart);
  const end = parseDateKey(addDaysToDateKey(weekStart, 6));
  const fmt = (date: Date) =>
    date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
  return `${fmt(start)} à ${fmt(end)}`;
}

export function formatDisplayDate(dateKey: string): string {
  return parseDateKey(dateKey).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export function canEditMenu(me: MeDto | undefined, _settings?: MenuEditorSettings): boolean {
  return hasPermission(me, PERMISSIONS.facilities.menuManage);
}

export function menuEditorSettingsToAppSettings(settings: MenuEditorSettings) {
  return [
    { key: MENU_SETTING_KEYS.allowedRoles, value: JSON.stringify(settings.allowedRoles) },
    { key: MENU_SETTING_KEYS.allowedEmails, value: JSON.stringify(settings.allowedEmails) },
    { key: MENU_SETTING_KEYS.emailRecipients, value: JSON.stringify(settings.emailRecipients) },
  ];
}

export function defaultWeekStartForToday(): string {
  return formatDateKey(getMondayOfWeek(new Date()));
}

export function parseMenuEditorSettingsFromAppSettings(
  settings: Record<string, string> | undefined,
): MenuEditorSettings {
  if (!settings) {
    return DEFAULT_MENU_EDITOR_SETTINGS;
  }

  let allowedRoles = DEFAULT_MENU_EDITOR_SETTINGS.allowedRoles;
  let allowedEmails: string[] = [];
  let emailRecipients: string[] = [];

  try {
    if (settings[MENU_SETTING_KEYS.allowedRoles]) {
      allowedRoles = JSON.parse(settings[MENU_SETTING_KEYS.allowedRoles]) as UserRole[];
    }
    if (settings[MENU_SETTING_KEYS.allowedEmails]) {
      allowedEmails = JSON.parse(settings[MENU_SETTING_KEYS.allowedEmails]) as string[];
    }
    if (settings[MENU_SETTING_KEYS.emailRecipients]) {
      emailRecipients = JSON.parse(settings[MENU_SETTING_KEYS.emailRecipients]) as string[];
    }
  } catch {
    // keep defaults
  }

  return { allowedRoles, allowedEmails, emailRecipients };
}

export function getLunchSections(menu: { meals: { mealType: MenuMealType; sections: MenuSectionDto[] }[] }) {
  const lunch = menu.meals.find((meal) => meal.mealType === "lunch");
  return lunch?.sections ?? [];
}

export function getFilledSections(sections: MenuSectionDto[]): MenuSectionDto[] {
  return sections.filter((section) => section.value.trim().length > 0);
}
