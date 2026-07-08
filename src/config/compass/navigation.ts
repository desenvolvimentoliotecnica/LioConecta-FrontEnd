export type CompassNavItem = {
  id: string;
  label: string;
  path: string;
  icon: string;
  badge?: number;
};

export const COMPASS_NAV_ITEMS: CompassNavItem[] = [
  { id: "overview", label: "Visão Geral", path: "/compass", icon: "fa-chart-pie" },
  { id: "analise-ytd", label: "Análise YTD", path: "/compass/analise-ytd", icon: "fa-table" },
  { id: "ciclo", label: "Ciclo IBP", path: "/compass/ciclo", icon: "fa-arrows-spin" },
  { id: "volume", label: "Volume", path: "/compass/volume", icon: "fa-chart-line" },
  { id: "canais", label: "Canais", path: "/compass/canais", icon: "fa-truck-ramp-box" },
  { id: "financeiro", label: "Financeiro", path: "/compass/financeiro", icon: "fa-coins" },
  { id: "reconciliacao", label: "Reconciliação", path: "/compass/reconciliacao", icon: "fa-scale-balanced", badge: 2 },
  { id: "reunioes", label: "Reuniões", path: "/compass/reunioes", icon: "fa-calendar-days" },
  { id: "decisoes", label: "Decisões", path: "/compass/decisoes", icon: "fa-gavel" },
  { id: "cenarios", label: "Cenários", path: "/compass/cenarios", icon: "fa-code-branch" },
  { id: "relatorios", label: "Relatórios", path: "/compass/relatorios", icon: "fa-file-lines" },
];

export const COMPASS_IBP_PHASES = [
  { id: "coleta", label: "Coleta", icon: "fa-database" },
  { id: "pre_sop_demanda", label: "Pré-S&OP Demanda", icon: "fa-chart-line" },
  { id: "pre_sop_supply", label: "Pré-S&OP Supply", icon: "fa-truck-ramp-box" },
  { id: "sop_integrado", label: "S&OP Integrado", icon: "fa-arrows-spin" },
  { id: "revisao_financeira", label: "Revisão Financeira", icon: "fa-coins" },
  { id: "executive", label: "Comitê Executivo", icon: "fa-user-tie" },
] as const;
