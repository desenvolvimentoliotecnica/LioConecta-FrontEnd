import type { LoopPeriod } from "./types";

export const LOOP_PERIODS: { id: LoopPeriod; label: string }[] = [
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
  { id: "90d", label: "90 dias" },
  { id: "quarter", label: "Trimestre" },
];

export const ACTIVE_PROJECT_STATUSES = new Set([
  "planejamento",
  "em_andamento",
  "execucao",
  "revisao",
  "atencao",
  "bloqueado",
]);

export const IN_PROGRESS_ACTIVITY_STATUSES = new Set([
  "planejada",
  "pendente",
  "em_andamento",
  "bloqueada",
  "em_revisao",
]);

export const CLOSED_STATUSES = new Set(["concluida", "concluido", "cancelada", "cancelado", "arquivado"]);

export const PHASE_COLORS: Record<string, string> = {
  planejamento: "#6366f1",
  execucao: "#0ea5e9",
  revisao: "#f59e0b",
  entrega: "#10b981",
};

export const HEALTH_LABELS = {
  no_prazo: "No prazo",
  atencao: "Atenção",
  critico: "Crítico",
} as const;

export const PERFORMANCE_WEIGHTS = {
  onTimeDeliveries: 0.3,
  completedActivities: 0.25,
  scheduleAdherence: 0.2,
  noCriticalBlockers: 0.15,
  riskControl: 0.1,
};

export const OCCUPANCY_THRESHOLDS = {
  healthy: 70,
  attention: 85,
  high: 100,
};
