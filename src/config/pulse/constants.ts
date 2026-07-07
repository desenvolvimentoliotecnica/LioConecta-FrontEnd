import type { PulseRetroCategory, PulseSprintPhase, PulseStoryStatus } from "./types";

export const PULSE_BOARD_COLUMNS: { id: PulseStoryStatus; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "A fazer" },
  { id: "in_progress", label: "Em andamento" },
  { id: "done", label: "Concluído" },
];

export const PULSE_SPRINT_PHASES: { id: PulseSprintPhase; label: string; icon: string }[] = [
  { id: "planning", label: "Planejamento", icon: "fa-clipboard-list" },
  { id: "active", label: "Execução", icon: "fa-bolt" },
  { id: "review", label: "Review", icon: "fa-magnifying-glass-chart" },
  { id: "retro", label: "Retrospectiva", icon: "fa-rotate" },
  { id: "closed", label: "Encerrado", icon: "fa-flag-checkered" },
];

export const PULSE_MOOD_LABELS: Record<number, string> = {
  1: "Bloqueado",
  2: "Difícil",
  3: "Neutro",
  4: "Bom",
  5: "Ótimo",
};

export const PULSE_RETRO_CATEGORIES: { id: PulseRetroCategory; label: string; icon: string }[] = [
  { id: "start", label: "Começar", icon: "fa-play" },
  { id: "stop", label: "Parar", icon: "fa-stop" },
  { id: "continue", label: "Continuar", icon: "fa-forward" },
  { id: "action", label: "Ação", icon: "fa-bolt" },
];

export const PULSE_MEETING_TYPE_LABELS: Record<string, string> = {
  daily: "Daily",
  planning: "Planning",
  review: "Review",
  retro: "Retrospectiva",
  refinement: "Refinamento",
};

export const PULSE_SEVERITY_COLORS: Record<string, string> = {
  critico: "#dc2626",
  alto: "#ea580c",
  medio: "#f59e0b",
  baixo: "#10b981",
};

export const PULSE_ACCENT = "#0d9488";

export const PERSONA_LABELS: Record<string, string> = {
  manager: "Gestor de Squad",
  member: "Membro do Squad",
  observer: "Observador",
};
