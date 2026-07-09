import type { UniLioContentType, UniLioPersona } from "./types";

export const UNILIO_ACCENT = "#059669";

export const PERSONA_LABELS: Record<UniLioPersona, string> = {
  learner: "Aprendiz",
  manager: "Gestor",
  instructor: "Instrutor",
  admin: "Administrador",
};

export const CONTENT_TYPE_LABELS: Record<UniLioContentType, string> = {
  video: "Vídeo",
  article: "Artigo",
  quiz: "Questionário",
  scorm: "SCORM",
  live: "Ao vivo",
  external: "Externo",
  pdf: "PDF",
};

/** Tipos disponíveis ao criar/editar módulos no authoring (independente do meta da API). */
export const MODULE_CONTENT_TYPE_OPTIONS = [
  { value: "article", label: "Artigo" },
  { value: "video", label: "Vídeo" },
  { value: "external", label: "Externo" },
  { value: "pdf", label: "PDF" },
  { value: "quiz", label: "Questionário" },
] as const;

export const UNILIO_PERIODS = [
  { id: "month", label: "Este mês" },
  { id: "quarter", label: "Trimestre" },
  { id: "year", label: "Ano" },
] as const;

export const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  not_started: "Não iniciado",
  not_enrolled: "Disponível",
  in_progress: "Em andamento",
  completed: "Concluído",
  overdue: "Atrasado",
};

export const COMPLIANCE_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  completed: "Concluído",
  overdue: "Vencido",
};
