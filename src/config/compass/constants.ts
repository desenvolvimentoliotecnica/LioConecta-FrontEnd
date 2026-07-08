import type { CompassCyclePhase, CompassPeriod, GapArea, GapSeverity, GapType } from "./types";
import { COMPASS_IBP_PHASES } from "./navigation";

export { COMPASS_IBP_PHASES };

export const COMPASS_PERIODS: { id: CompassPeriod; label: string }[] = [
  { id: "month", label: "Mensal" },
  { id: "quarter", label: "Trimestral" },
  { id: "year", label: "Anual" },
];

export const COMPASS_ACCENT = "#2563eb";

export const GAP_SEVERITY_LABELS: Record<GapSeverity, string> = {
  critico: "Crítico",
  alto: "Alto",
  medio: "Médio",
  baixo: "Baixo",
};

export const SEVERITY_LABELS = GAP_SEVERITY_LABELS;

export const GAP_SEVERITY_COLORS: Record<GapSeverity, string> = {
  critico: "#dc2626",
  alto: "#ea580c",
  medio: "#f59e0b",
  baixo: "#10b981",
};

export const CYCLE_STATUS_LABELS = {
  ativo: "Ativo",
  fechado: "Fechado",
  planejado: "Planejado",
} as const;

export const CYCLE_PHASE_LABELS: Record<CompassCyclePhase, string> = {
  coleta: "Coleta de dados",
  pre_sop_demanda: "Pré-S&OP Demanda",
  pre_sop_supply: "Pré-S&OP Supply",
  sop_integrado: "S&OP Integrado",
  revisao_financeira: "Revisão Financeira",
  executive: "Comitê Executivo",
  fechado: "Fechado",
};

export const GAP_TYPE_LABELS: Record<GapType, string> = {
  demanda_supply: "Demanda × Supply",
  supply_financeiro: "Supply × Financeiro",
  demanda_financeiro: "Demanda × Financeiro",
  capacidade: "Capacidade",
};

export const GAP_AREA_LABELS: Record<GapArea, string> = {
  demand: "Demanda",
  supply: "Supply",
  finance: "Financeiro",
};

export const PERSONA_LABELS: Record<string, string> = {
  executive: "Executivo",
  planner: "Planejador IBP",
  contributor: "Contribuidor",
};

export const IB_MEETING_TYPE_LABELS: Record<string, string> = {
  pre_sop_demanda: "Pré-S&OP Demanda",
  pre_sop_supply: "Pré-S&OP Supply",
  sop_integrado: "S&OP Integrado",
  revisao_financeira: "Revisão Financeira",
  executive: "Comitê Executivo",
  follow_up: "Follow-up",
};

export const ALIGNMENT_THRESHOLDS = {
  healthy: 80,
  attention: 65,
};

export const PHASE_CHECKLIST: Record<string, string[]> = {
  coleta: ["Extrair dados ERP", "Validar cadastro produtos", "Consolidar histórico de vendas"],
  pre_sop_demanda: ["Revisar forecast estatístico", "Incorporar input comercial", "Publicar consenso de demanda"],
  pre_sop_supply: ["Calcular capacidade disponível", "Identificar restrições", "Propor plano de produção"],
  sop_integrado: ["Balancear demanda e supply", "Priorizar gaps críticos", "Preparar recomendações"],
  revisao_financeira: ["Atualizar P&L integrado", "Validar margens por BU", "Simular cenários financeiros"],
  executive: ["Apresentar plano integrado", "Decidir trade-offs", "Aprovar ciclo IBP"],
};
