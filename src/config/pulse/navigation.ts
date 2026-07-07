export type PulseNavItem = {
  id: string;
  label: string;
  path: string;
  icon: string;
  badge?: number;
};

export const PULSE_NAV_ITEMS: PulseNavItem[] = [
  { id: "overview", label: "Visão Geral", path: "/pulse", icon: "fa-chart-pie" },
  { id: "dailys", label: "Dailys", path: "/pulse/dailys", icon: "fa-comments" },
  { id: "sprint", label: "Sprint", path: "/pulse/sprint", icon: "fa-flag" },
  { id: "backlog", label: "Backlog", path: "/pulse/backlog", icon: "fa-list" },
  { id: "board", label: "Board", path: "/pulse/board", icon: "fa-table-columns" },
  { id: "planning", label: "Planning", path: "/pulse/planning", icon: "fa-calendar-plus" },
  { id: "review", label: "Review", path: "/pulse/review", icon: "fa-magnifying-glass-chart" },
  { id: "retro", label: "Retro", path: "/pulse/retro", icon: "fa-rotate" },
  { id: "impediments", label: "Impedimentos", path: "/pulse/impedimentos", icon: "fa-road-barrier", badge: 3 },
  { id: "meetings", label: "Reuniões", path: "/pulse/meetings", icon: "fa-calendar-days" },
];
