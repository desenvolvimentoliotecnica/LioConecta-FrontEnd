export type LoopNavItem = {
  id: string;
  label: string;
  path: string;
  icon: string;
  badge?: number;
};

export const LOOP_NAV_ITEMS: LoopNavItem[] = [
  { id: "overview", label: "Visão Geral", path: "/loop", icon: "fa-chart-pie" },
  { id: "projects", label: "Projetos", path: "/loop/projetos", icon: "fa-folder-tree" },
  { id: "activities", label: "Atividades", path: "/loop/atividades", icon: "fa-list-check" },
  { id: "teams", label: "Equipes", path: "/loop/equipes", icon: "fa-people-group" },
  { id: "planning", label: "Planejamento", path: "/loop/planejamento", icon: "fa-calendar-days" },
  { id: "risks", label: "Riscos", path: "/loop/riscos", icon: "fa-triangle-exclamation" },
  { id: "approvals", label: "Aprovações", path: "/loop/aprovacoes", icon: "fa-stamp", badge: 2 },
  { id: "lessons", label: "Aprendizados", path: "/loop/aprendizados", icon: "fa-lightbulb" },
  { id: "reports", label: "Relatórios", path: "/loop/relatorios", icon: "fa-file-lines" },
];

export const LOOP_CYCLE_PHASES = [
  { id: "planejamento", label: "Planejamento", icon: "fa-compass" },
  { id: "execucao", label: "Execução", icon: "fa-gears" },
  { id: "revisao", label: "Revisão", icon: "fa-magnifying-glass" },
  { id: "entrega", label: "Entrega", icon: "fa-box-open" },
  { id: "aprendizados", label: "Aprendizados", icon: "fa-lightbulb" },
] as const;
