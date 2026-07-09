import { ApiError } from "../../../api/client";
import type { BusinessArea, DataScope, RbacSubjectType } from "../../../api/types";

export const BUSINESS_AREAS: BusinessArea[] = [
  "Core",
  "RH",
  "Financeiro",
  "Contabil",
  "TI",
  "Facilities",
  "Juridico",
  "Marketing",
  "Pessoas",
  "Projetos",
  "Planejamento",
  "Plataforma",
  "Analytics",
  "Quiosque",
  "UniLio",
];

export type AssignmentSubject = {
  subjectType: RbacSubjectType;
  subjectId: string;
  label: string;
};

export type AssignmentGroup = AssignmentSubject & {
  key: string;
  typeLabel: string;
  roles: { id: string; name: string }[];
};

export type BulkAssignmentMode = "replace" | "add" | "remove";

export function businessAreaLabel(area: BusinessArea | null | undefined): string {
  if (area === null || area === undefined) return "—";
  if (typeof area === "number") {
    const label = BUSINESS_AREAS[area];
    return label !== undefined ? String(label) : String(area);
  }
  return area;
}

export function subjectTypeLabel(value: string | number): string {
  if (typeof value === "number") {
    return ["PortalUser", "Person", "TestUser"][value] ?? String(value);
  }
  return value;
}

export function normalizeRbacSubjectType(
  value: RbacSubjectType,
): "PortalUser" | "Person" | "TestUser" {
  if (value === 0 || value === "PortalUser") return "PortalUser";
  if (value === 1 || value === "Person") return "Person";
  return "TestUser";
}

export function toRbacSubjectTypeApiValue(value: RbacSubjectType): 0 | 1 | 2 {
  if (value === 0 || value === "PortalUser") return 0;
  if (value === 1 || value === "Person") return 1;
  return 2;
}

export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.body && typeof error.body === "object") {
      const record = error.body as Record<string, unknown>;
      const errors = record.errors;
      if (errors && typeof errors === "object") {
        const details = Object.entries(errors as Record<string, unknown>)
          .flatMap(([field, messages]) => {
            if (Array.isArray(messages)) {
              return messages.map((message) => `${field}: ${String(message)}`);
            }
            return [`${field}: ${String(messages)}`];
          })
          .join(" · ");
        if (details.trim()) return details;
      }
      const title = record.title ?? record.message ?? record.detail;
      if (typeof title === "string" && title.trim()) return title;
    }
    if (typeof error.body === "string" && error.body.trim()) return error.body;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Operação não concluída.";
}

export function scopeLabel(scope: string | number): string {
  if (typeof scope === "number") {
    return ["Self", "Team", "Department", "Global"][scope] ?? String(scope);
  }
  return scope;
}

export function toDataScopeApiValue(scope: DataScope): 0 | 1 | 2 | 3 {
  if (typeof scope === "number") return scope as 0 | 1 | 2 | 3;
  const map: Record<string, 0 | 1 | 2 | 3> = {
    Self: 0,
    Team: 1,
    Department: 2,
    Global: 3,
  };
  return map[scope] ?? 0;
}

export function fromBusinessAreaApiValue(area: BusinessArea | null | undefined): BusinessArea | "" {
  if (area === null || area === undefined) return "";
  if (typeof area === "string") return area;
  const label = BUSINESS_AREAS[area];
  return label ?? "";
}

export function fromBusinessAreaApiValueRequired(area: BusinessArea | null | undefined): BusinessArea {
  return fromBusinessAreaApiValue(area) || "Core";
}

export function toBusinessAreaApiValue(area: BusinessArea | "" | null | undefined): BusinessArea | null {
  if (area === null || area === undefined || area === "") return null;
  if (typeof area === "number") return area;
  const index = BUSINESS_AREAS.indexOf(area);
  return index >= 0 ? index : null;
}

export function toBusinessAreaApiValueRequired(area: BusinessArea): BusinessArea {
  return toBusinessAreaApiValue(area) ?? 0;
}

export function isRolePermissionsEditable(role: {
  isSystem: boolean;
  isKeyUserTemplate: boolean;
}): boolean {
  return !role.isSystem && !role.isKeyUserTemplate;
}

export function computeBulkRoleIds(
  mode: BulkAssignmentMode,
  currentRoleIds: string[],
  selectedRoleIds: string[],
): string[] {
  if (mode === "replace") return [...new Set(selectedRoleIds)];
  if (mode === "add") return [...new Set([...currentRoleIds, ...selectedRoleIds])];
  return currentRoleIds.filter((roleId) => !selectedRoleIds.includes(roleId));
}
