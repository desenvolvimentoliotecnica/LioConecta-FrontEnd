export type AnalyticsPeriod = "7d" | "30d" | "90d" | "12m";

export type AnalyticsModule =
  | "all"
  | "feed"
  | "comunicados"
  | "pessoas"
  | "grupos"
  | "documentos"
  | "servicos"
  | "engajamento";

export const ANALYTICS_PERIODS: { id: AnalyticsPeriod; label: string }[] = [
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
  { id: "90d", label: "90 dias" },
  { id: "12m", label: "12 meses" },
];

export const ANALYTICS_MODULES: { id: AnalyticsModule; label: string; icon: string }[] = [
  { id: "all", label: "Visão geral", icon: "fa-chart-pie" },
  { id: "feed", label: "Feed", icon: "fa-rss" },
  { id: "comunicados", label: "Comunicados", icon: "fa-bullhorn" },
  { id: "pessoas", label: "Pessoas", icon: "fa-users" },
  { id: "grupos", label: "Grupos", icon: "fa-people-group" },
  { id: "documentos", label: "Documentos", icon: "fa-folder-open" },
  { id: "servicos", label: "Serviços", icon: "fa-briefcase" },
  { id: "engajamento", label: "Engajamento", icon: "fa-heart-pulse" },
];

export type KpiMetric = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
  icon: string;
  mod: AnalyticsModule;
};

export type TrendPoint = {
  label: string;
  value: number;
};

export type ModuleInsight = {
  id: AnalyticsModule;
  title: string;
  description: string;
  href: string;
  stats: { label: string; value: string }[];
  highlight?: string;
};

export type RankedItem = {
  rank: number;
  title: string;
  meta: string;
  value: string;
  href: string;
  mod: AnalyticsModule;
};

export type DepartmentEngagement = {
  name: string;
  activeUsers: number;
  engagement: number;
};

const PERIOD_MULTIPLIER: Record<AnalyticsPeriod, number> = {
  "7d": 0.28,
  "30d": 1,
  "90d": 2.6,
  "12m": 9.5,
};

function scale(base: number, period: AnalyticsPeriod): number {
  return Math.round(base * PERIOD_MULTIPLIER[period]);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(".0", "")}k`;
  return String(n);
}

export function getKpis(period: AnalyticsPeriod): KpiMetric[] {
  const activeUsers = scale(842, period);
  const engagement = period === "7d" ? 68 : period === "30d" ? 72 : period === "90d" ? 74 : 71;
  const comunicadosRead = scale(1240, period);
  const serviceRequests = scale(386, period);
  const feedPosts = scale(218, period);
  const docDownloads = scale(512, period);
  const profileViews = scale(980, period);
  const groupInteractions = scale(312, period);

  return [
    {
      id: "active-users",
      label: "Colaboradores ativos",
      value: formatNumber(activeUsers),
      delta: "+4,2%",
      trend: "up",
      icon: "fa-user-check",
      mod: "all",
    },
    {
      id: "engagement-rate",
      label: "Taxa de engajamento",
      value: `${engagement}%`,
      delta: period === "12m" ? "-1,1%" : "+2,8%",
      trend: period === "12m" ? "down" : "up",
      icon: "fa-chart-line",
      mod: "engajamento",
    },
    {
      id: "comunicados-read",
      label: "Comunicados lidos",
      value: formatNumber(comunicadosRead),
      delta: "+6,5%",
      trend: "up",
      icon: "fa-bullhorn",
      mod: "comunicados",
    },
    {
      id: "service-requests",
      label: "Solicitações de serviços",
      value: formatNumber(serviceRequests),
      delta: "+11%",
      trend: "up",
      icon: "fa-clipboard-list",
      mod: "servicos",
    },
    {
      id: "feed-posts",
      label: "Publicações no feed",
      value: formatNumber(feedPosts),
      delta: "+9,3%",
      trend: "up",
      icon: "fa-rss",
      mod: "feed",
    },
    {
      id: "doc-downloads",
      label: "Downloads de documentos",
      value: formatNumber(docDownloads),
      delta: "+3,7%",
      trend: "up",
      icon: "fa-file-arrow-down",
      mod: "documentos",
    },
    {
      id: "profile-views",
      label: "Perfis visitados",
      value: formatNumber(profileViews),
      delta: "+5,4%",
      trend: "up",
      icon: "fa-id-card",
      mod: "pessoas",
    },
    {
      id: "group-interactions",
      label: "Interações em grupos",
      value: formatNumber(groupInteractions),
      delta: "+7,9%",
      trend: "up",
      icon: "fa-people-group",
      mod: "grupos",
    },
  ];
}

export function getActivityTrend(period: AnalyticsPeriod): TrendPoint[] {
  if (period === "7d") {
    return [
      { label: "Seg", value: 62 },
      { label: "Ter", value: 78 },
      { label: "Qua", value: 71 },
      { label: "Qui", value: 84 },
      { label: "Sex", value: 69 },
      { label: "Sáb", value: 28 },
      { label: "Dom", value: 22 },
    ];
  }
  if (period === "30d") {
    return [
      { label: "Sem 1", value: 420 },
      { label: "Sem 2", value: 468 },
      { label: "Sem 3", value: 512 },
      { label: "Sem 4", value: 489 },
    ];
  }
  if (period === "90d") {
    return [
      { label: "Abr", value: 1180 },
      { label: "Mai", value: 1246 },
      { label: "Jun", value: 1312 },
    ];
  }
  return [
    { label: "Ago", value: 980 },
    { label: "Set", value: 1040 },
    { label: "Out", value: 1120 },
    { label: "Nov", value: 1180 },
    { label: "Dez", value: 1090 },
    { label: "Jan", value: 1160 },
    { label: "Fev", value: 1220 },
    { label: "Mar", value: 1280 },
    { label: "Abr", value: 1340 },
    { label: "Mai", value: 1410 },
    { label: "Jun", value: 1480 },
    { label: "Jul", value: 1520 },
  ];
}

export function getModuleInsights(period: AnalyticsPeriod): ModuleInsight[] {
  const p = period;
  return [
    {
      id: "feed",
      title: "Feed social",
      description: "Publicações, reações, comentários e enquetes da timeline corporativa.",
      href: "/",
      stats: [
        { label: "Publicações", value: formatNumber(scale(218, p)) },
        { label: "Reações", value: formatNumber(scale(1840, p)) },
        { label: "Comentários", value: formatNumber(scale(620, p)) },
      ],
      highlight: "Enquete sobre trabalho remoto com 78% de participação",
    },
    {
      id: "comunicados",
      title: "Comunicados",
      description: "Oficiais, departamentais, urgentes e arquivo institucional.",
      href: "/comunicados/oficiais",
      stats: [
        { label: "Visualizações", value: formatNumber(scale(3240, p)) },
        { label: "Taxa de leitura", value: "87%" },
        { label: "Compartilhamentos", value: formatNumber(scale(156, p)) },
      ],
      highlight: "Estratégia 2026 lidera leituras com 412 acessos",
    },
    {
      id: "pessoas",
      title: "Pessoas",
      description: "Diretório, organograma, novos colaboradores e aniversariantes.",
      href: "/pessoas/diretorio",
      stats: [
        { label: "Perfis visitados", value: formatNumber(scale(980, p)) },
        { label: "Busca no diretório", value: formatNumber(scale(740, p)) },
        { label: "Parabenizações", value: formatNumber(scale(94, p)) },
      ],
      highlight: "Organograma com pico de acesso após reorganização",
    },
    {
      id: "grupos",
      title: "Grupos e comunidades",
      description: "Grupos internos, comunidades temáticas e colaboração entre áreas.",
      href: "/grupos/meus-grupos",
      stats: [
        { label: "Grupos ativos", value: "48" },
        { label: "Novos membros", value: formatNumber(scale(126, p)) },
        { label: "Posts em grupos", value: formatNumber(scale(312, p)) },
      ],
      highlight: "Data & Analytics é o grupo com maior crescimento",
    },
    {
      id: "documentos",
      title: "Documentos",
      description: "Políticas, manuais, formulários, modelos e biblioteca corporativa.",
      href: "/documentos/politicas-internas",
      stats: [
        { label: "Downloads", value: formatNumber(scale(512, p)) },
        { label: "Visualizações", value: formatNumber(scale(890, p)) },
        { label: "Novos uploads", value: formatNumber(scale(18, p)) },
      ],
      highlight: "Política de viagens é o documento mais acessado",
    },
    {
      id: "servicos",
      title: "Serviços digitais",
      description: "RH, TI, Facilities e Jurídico — solicitações e autoatendimento.",
      href: "/servicos/beneficios",
      stats: [
        { label: "Solicitações", value: formatNumber(scale(386, p)) },
        { label: "SLA médio", value: "1,8 dias" },
        { label: "Satisfação", value: "4,6/5" },
      ],
      highlight: "Contracheque e férias concentram 42% das demandas",
    },
    {
      id: "engajamento",
      title: "Notificações e mensagens",
      description: "Alertas do portal, chat interno e interações em tempo real.",
      href: "/notificacoes",
      stats: [
        { label: "Notificações enviadas", value: formatNumber(scale(2140, p)) },
        { label: "Taxa de abertura", value: "76%" },
        { label: "Mensagens no chat", value: formatNumber(scale(1680, p)) },
      ],
      highlight: "Comunicados oficiais têm maior taxa de abertura (91%)",
    },
  ];
}

export function getTopContent(period: AnalyticsPeriod): RankedItem[] {
  const views = (n: number) => formatNumber(scale(n, period));
  return [
    {
      rank: 1,
      title: "Atualização importante sobre nossa estratégia 2026",
      meta: "Comunicado oficial · RH",
      value: `${views(412)} leituras`,
      href: "/comunicados/leitura?id=estrategia-2026",
      mod: "comunicados",
    },
    {
      rank: 2,
      title: "Política de viagens e despesas",
      meta: "Documento · Biblioteca corporativa",
      value: `${views(286)} downloads`,
      href: "/documentos/biblioteca",
      mod: "documentos",
    },
    {
      rank: 3,
      title: "Enquete: modelo de trabalho híbrido",
      meta: "Feed · Enquete",
      value: `${views(248)} votos`,
      href: "/",
      mod: "feed",
    },
    {
      rank: 4,
      title: "Solicitação de férias e ausências",
      meta: "Serviço · RH & Pessoas",
      value: `${views(198)} acessos`,
      href: "/servicos/ferias-ausencias",
      mod: "servicos",
    },
    {
      rank: 5,
      title: "Grupo Data & Analytics",
      meta: "Grupos · Comunidade",
      value: `${views(176)} interações`,
      href: "/grupos/explorar",
      mod: "grupos",
    },
  ];
}

export function getServiceBreakdown(period: AnalyticsPeriod): { label: string; value: number; color: string }[] {
  const base = [
    { label: "RH & Pessoas", value: scale(142, period), color: "#2563eb" },
    { label: "TI & Suporte", value: scale(98, period), color: "#7c3aed" },
    { label: "Facilities", value: scale(76, period), color: "#0d9488" },
    { label: "Jurídico", value: scale(42, period), color: "#d97706" },
    { label: "Financeiro", value: scale(28, period), color: "#db2777" },
  ];
  return base;
}

export function getDepartmentEngagement(): DepartmentEngagement[] {
  return [
    { name: "Tecnologia", activeUsers: 124, engagement: 89 },
    { name: "Comercial", activeUsers: 98, engagement: 76 },
    { name: "Operações", activeUsers: 156, engagement: 71 },
    { name: "RH & Admin", activeUsers: 64, engagement: 84 },
    { name: "Marketing", activeUsers: 52, engagement: 82 },
    { name: "Financeiro", activeUsers: 48, engagement: 68 },
    { name: "Jurídico", activeUsers: 22, engagement: 74 },
    { name: "Facilities", activeUsers: 18, engagement: 65 },
  ];
}

export function filterByModule<T extends { mod: AnalyticsModule }>(
  items: T[],
  module: AnalyticsModule,
): T[] {
  if (module === "all") return items;
  return items.filter((item) => item.mod === module || item.mod === "all");
}
