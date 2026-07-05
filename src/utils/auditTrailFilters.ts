export type AuditPeriod = "24h" | "7d" | "30d" | "90d" | "all" | "custom";

export type AuditHttpStatusFilter = "" | "success" | "error";

export const AUDIT_PERIODS: Array<{ id: AuditPeriod; label: string }> = [
  { id: "24h", label: "24 horas" },
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
  { id: "90d", label: "90 dias" },
  { id: "all", label: "Tudo" },
  { id: "custom", label: "Personalizado" },
];

export const AUDIT_PERIOD_LABELS: Record<AuditPeriod, string> = {
  "24h": "últimas 24 horas",
  "7d": "últimos 7 dias",
  "30d": "últimos 30 dias",
  "90d": "últimos 90 dias",
  all: "todo o histórico",
  custom: "período personalizado",
};

export interface AuditDateRange {
  from?: string;
  to?: string;
}

function toIsoEndOfDay(dateValue: string): string {
  const date = new Date(`${dateValue}T23:59:59.999`);
  return Number.isNaN(date.getTime()) ? dateValue : date.toISOString();
}

export function resolveAuditDateRange(
  period: AuditPeriod,
  customFrom = "",
  customTo = "",
): AuditDateRange {
  if (period === "all") {
    return {};
  }

  if (period === "custom") {
    return {
      from: customFrom ? new Date(`${customFrom}T00:00:00`).toISOString() : undefined,
      to: customTo ? toIsoEndOfDay(customTo) : undefined,
    };
  }

  const now = Date.now();
  const offsets: Record<Exclude<AuditPeriod, "all" | "custom">, number> = {
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
    "90d": 90 * 24 * 60 * 60 * 1000,
  };

  return {
    from: new Date(now - offsets[period]).toISOString(),
    to: new Date(now).toISOString(),
  };
}
