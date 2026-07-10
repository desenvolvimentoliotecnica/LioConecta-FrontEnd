import type { AnalyticsSnapshotDto } from "../api/types";
import {
  filterByModule,
  formatNumber,
  getModuleInsights,
  getPollModuleInsight,
  type AnalyticsModule,
  type AnalyticsPeriod,
  type DepartmentEngagement,
  type KpiMetric,
  type ModuleInsight,
  type PollSectionView,
  type RankedItem,
  type TrendPoint,
} from "../config/analytics";

export type AnalyticsViewModel = {
  kpis: KpiMetric[];
  activityTrend: TrendPoint[];
  activityTrendIsMock: boolean;
  modules: ModuleInsight[];
  topContent: RankedItem[];
  topContentIsMock: boolean;
  serviceBreakdown: { label: string; value: number; color: string }[];
  serviceBreakdownIsMock: boolean;
  departments: DepartmentEngagement[];
  departmentsIsMock: boolean;
  mockSections: string[];
  pollSection: PollSectionView | null;
};

function hasTrendData(points: TrendPoint[]): boolean {
  return points.some((point) => point.value > 0);
}

function emptyTrend(period: AnalyticsPeriod): TrendPoint[] {
  const labels =
    period === "7d"
      ? ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
      : period === "12m"
        ? ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
        : ["S1", "S2", "S3", "S4"];
  return labels.map((label) => ({ label, value: 0 }));
}

function formatTopItemValue(item: AnalyticsSnapshotDto["topContent"][number]): string {
  if (item.value <= 0) return "Recente";
  if (item.mod === "enquetes") return `${formatNumber(item.value)} votos`;
  if (item.mod === "documentos") return `${formatNumber(item.value)} downloads`;
  if (item.mod === "servicos") return `${formatNumber(item.value)} acessos`;
  if (item.mod === "grupos") return `${formatNumber(item.value)} interações`;
  return `${formatNumber(item.value)} leituras`;
}

function mapTopContent(snapshot: AnalyticsSnapshotDto): RankedItem[] {
  const topContent = snapshot.topContent ?? [];
  if (topContent.length === 0) return [];

  return topContent.map((item, index) => ({
    rank: index + 1,
    title: item.title,
    meta: item.meta,
    value: formatTopItemValue(item),
    href: item.href,
    mod: item.mod as RankedItem["mod"],
  }));
}

function snapshotHasPollAnalytics(snapshot: AnalyticsSnapshotDto): boolean {
  return (
    snapshot.pollsCreated !== undefined ||
    snapshot.pollVotes !== undefined ||
    snapshot.activePolls !== undefined ||
    snapshot.pollsClosed !== undefined ||
    snapshot.pollParticipationRate !== undefined ||
    snapshot.pollAvgVotesPerPoll !== undefined ||
    snapshot.pollActivityTrend !== undefined ||
    snapshot.topPolls !== undefined
  );
}

function normalizeSnapshot(snapshot: AnalyticsSnapshotDto): AnalyticsSnapshotDto {
  return {
    ...snapshot,
    activityTrend: snapshot.activityTrend ?? [],
    serviceBreakdown: snapshot.serviceBreakdown ?? [],
    departmentEngagement: snapshot.departmentEngagement ?? [],
    topContent: snapshot.topContent ?? [],
    pollsCreated: snapshot.pollsCreated ?? 0,
    pollVotes: snapshot.pollVotes ?? 0,
    activePolls: snapshot.activePolls ?? 0,
    pollsClosed: snapshot.pollsClosed ?? 0,
    pollParticipationRate: snapshot.pollParticipationRate ?? 0,
    pollAvgVotesPerPoll: snapshot.pollAvgVotesPerPoll ?? 0,
    pollActivityTrend: snapshot.pollActivityTrend ?? [],
    topPolls: snapshot.topPolls ?? [],
  };
}

function mapTopPolls(snapshot: AnalyticsSnapshotDto): RankedItem[] {
  const topPolls = snapshot.topPolls ?? [];
  if (topPolls.length === 0) return [];

  return topPolls.map((item, index) => ({
    rank: index + 1,
    title: item.title,
    meta: item.meta,
    value: formatTopItemValue(item),
    href: item.href,
    mod: "enquetes",
  }));
}

function buildKpisFromSnapshot(snapshot: AnalyticsSnapshotDto): KpiMetric[] {
  return [
    {
      id: "active-users",
      label: "Colaboradores ativos",
      value: formatNumber(snapshot.activePeople),
      delta: "dado real",
      trend: snapshot.activePeople > 0 ? "up" : "neutral",
      icon: "fa-user-check",
      mod: "all",
    },
    {
      id: "engagement-rate",
      label: "Usuários ativos no período",
      value: formatNumber(snapshot.activeUsersInPeriod),
      delta: "dado real",
      trend: snapshot.activeUsersInPeriod > 0 ? "up" : "neutral",
      icon: "fa-chart-line",
      mod: "engajamento",
    },
    {
      id: "comunicados-read",
      label: "Comunicados lidos",
      value: formatNumber(snapshot.comunicadoReads),
      delta: "dado real",
      trend: snapshot.comunicadoReads > 0 ? "up" : "neutral",
      icon: "fa-bullhorn",
      mod: "comunicados",
    },
    {
      id: "service-requests",
      label: "Solicitações de serviços",
      value: formatNumber(snapshot.serviceRequests),
      delta: "dado real",
      trend: snapshot.serviceRequests > 0 ? "up" : "neutral",
      icon: "fa-clipboard-list",
      mod: "servicos",
    },
    {
      id: "feed-posts",
      label: "Publicações no feed",
      value: formatNumber(snapshot.feedPosts),
      delta: "dado real",
      trend: snapshot.feedPosts > 0 ? "up" : "neutral",
      icon: "fa-rss",
      mod: "feed",
    },
    {
      id: "doc-downloads",
      label: "Documentos catalogados",
      value: formatNumber(snapshot.documents),
      delta: "dado real",
      trend: "neutral",
      icon: "fa-file-arrow-down",
      mod: "documentos",
    },
    {
      id: "profile-views",
      label: "Notificações enviadas",
      value: formatNumber(snapshot.notifications),
      delta: "dado real",
      trend: snapshot.notifications > 0 ? "up" : "neutral",
      icon: "fa-bell",
      mod: "pessoas",
    },
    {
      id: "group-interactions",
      label: "Grupos ativos",
      value: formatNumber(snapshot.activeGroups),
      delta: "dado real",
      trend: snapshot.activeGroups > 0 ? "up" : "neutral",
      icon: "fa-people-group",
      mod: "grupos",
    },
  ];
}

function buildModulesFromSnapshot(snapshot: AnalyticsSnapshotDto, period: AnalyticsPeriod): ModuleInsight[] {
  const templates = getModuleInsights(period);
  const realStats: Record<string, ModuleInsight> = {
    feed: {
      id: "feed",
      title: "Feed social",
      description: "Publicações, reações, comentários e enquetes da timeline corporativa.",
      href: "/",
      stats: [
        { label: "Publicações", value: formatNumber(snapshot.feedPosts) },
        { label: "Reações", value: formatNumber(snapshot.feedReactions) },
        { label: "Comentários", value: formatNumber(snapshot.feedComments) },
      ],
    },
    comunicados: {
      id: "comunicados",
      title: "Comunicados",
      description: "Oficiais, departamentais, urgentes e arquivo institucional.",
      href: "/comunicados/oficiais",
      stats: [
        { label: "Comunicados ativos", value: formatNumber(snapshot.comunicados) },
        { label: "Leituras no período", value: formatNumber(snapshot.comunicadoReads) },
        { label: "Notificações", value: formatNumber(snapshot.notifications) },
      ],
    },
    pessoas: {
      id: "pessoas",
      title: "Pessoas",
      description: "Diretório, organograma, novos colaboradores e aniversariantes.",
      href: "/pessoas/diretorio",
      stats: [
        { label: "Colaboradores ativos", value: formatNumber(snapshot.activePeople) },
        { label: "Ativos no período", value: formatNumber(snapshot.activeUsersInPeriod) },
        { label: "Mood checks", value: formatNumber(snapshot.moodChecks) },
      ],
    },
    grupos: {
      id: "grupos",
      title: "Grupos e comunidades",
      description: "Grupos internos, comunidades temáticas e colaboração entre áreas.",
      href: "/grupos/explorar",
      stats: [
        { label: "Grupos ativos", value: formatNumber(snapshot.activeGroups) },
        { label: "Novos membros", value: formatNumber(snapshot.groupMembers) },
        { label: "Posts em grupos", value: formatNumber(snapshot.groupPosts) },
      ],
    },
    documentos: {
      id: "documentos",
      title: "Documentos",
      description: "Políticas, manuais, formulários, modelos e biblioteca corporativa.",
      href: "/documentos/biblioteca",
      stats: [
        { label: "Documentos", value: formatNumber(snapshot.documents) },
        { label: "Visualizações", value: "—" },
        { label: "Novos uploads", value: "—" },
      ],
    },
    servicos: {
      id: "servicos",
      title: "Serviços digitais",
      description: "RH, TI, Facilities e Jurídico — solicitações e autoatendimento.",
      href: "/servicos/beneficios",
      stats: [
        { label: "Solicitações", value: formatNumber(snapshot.serviceRequests) },
        { label: "SLA médio", value: "—" },
        { label: "Satisfação", value: "—" },
      ],
    },
    engajamento: {
      id: "engajamento",
      title: "Notificações e mensagens",
      description: "Alertas do portal, chat interno e interações em tempo real.",
      href: "/notificacoes",
      stats: [
        { label: "Notificações enviadas", value: formatNumber(snapshot.notifications) },
        { label: "Taxa de abertura", value: "—" },
        { label: "Mensagens no chat", value: "—" },
      ],
    },
  };

  return templates.map((template) => realStats[template.id] ?? { ...template, stats: template.stats.map((s) => ({ ...s, value: "—" })), highlight: undefined });
}

function buildPollKpisFromSnapshot(snapshot: AnalyticsSnapshotDto): KpiMetric[] {
  return [
    {
      id: "polls-created",
      label: "Enquetes criadas",
      value: formatNumber(snapshot.pollsCreated ?? 0),
      delta: "dado real",
      trend: (snapshot.pollsCreated ?? 0) > 0 ? "up" : "neutral",
      icon: "fa-square-plus",
      mod: "enquetes",
    },
    {
      id: "poll-votes",
      label: "Total de votos",
      value: formatNumber(snapshot.pollVotes ?? 0),
      delta: "dado real",
      trend: (snapshot.pollVotes ?? 0) > 0 ? "up" : "neutral",
      icon: "fa-check-to-slot",
      mod: "enquetes",
    },
    {
      id: "polls-active",
      label: "Enquetes ativas",
      value: formatNumber(snapshot.activePolls ?? 0),
      delta: "dado real",
      trend: "neutral",
      icon: "fa-circle-play",
      mod: "enquetes",
    },
    {
      id: "poll-participation",
      label: "Taxa de participação",
      value: `${snapshot.pollParticipationRate ?? 0}%`,
      delta: "dado real",
      trend: (snapshot.pollParticipationRate ?? 0) > 0 ? "up" : "neutral",
      icon: "fa-users-viewfinder",
      mod: "enquetes",
    },
    {
      id: "poll-avg-votes",
      label: "Média de votos/enquete",
      value: formatNumber(snapshot.pollAvgVotesPerPoll ?? 0),
      delta: "dado real",
      trend: (snapshot.pollAvgVotesPerPoll ?? 0) > 0 ? "up" : "neutral",
      icon: "fa-chart-simple",
      mod: "enquetes",
    },
    {
      id: "polls-closed",
      label: "Enquetes encerradas",
      value: formatNumber(snapshot.pollsClosed ?? 0),
      delta: "dado real",
      trend: (snapshot.pollsClosed ?? 0) > 0 ? "up" : "neutral",
      icon: "fa-circle-stop",
      mod: "enquetes",
    },
  ];
}

function buildEmptyPollSection(period: AnalyticsPeriod): PollSectionView {
  const insight = getPollModuleInsight(period);
  return {
    kpis: buildPollKpisFromSnapshot({
      period,
      activePeople: 0,
      activeUsersInPeriod: 0,
      feedPosts: 0,
      feedComments: 0,
      feedReactions: 0,
      comunicados: 0,
      comunicadoReads: 0,
      activeGroups: 0,
      groupMembers: 0,
      groupPosts: 0,
      notifications: 0,
      serviceRequests: 0,
      documents: 0,
      moodChecks: 0,
      activityTrend: [],
      serviceBreakdown: [],
      departmentEngagement: [],
      topContent: [],
    }),
    activityTrend: emptyTrend(period),
    activityTrendIsMock: false,
    topPolls: [],
    topPollsIsMock: false,
    moduleInsight: {
      ...insight,
      stats: [
        { label: "Criadas", value: "—" },
        { label: "Votos", value: "—" },
        { label: "Participação", value: "—" },
      ],
      highlight: undefined,
    },
  };
}

function buildPollSection(
  snapshot: AnalyticsSnapshotDto | null | undefined,
  period: AnalyticsPeriod,
): PollSectionView {
  if (!snapshot || !snapshotHasPollAnalytics(snapshot)) {
    return buildEmptyPollSection(period);
  }

  const pollTrend = (snapshot.pollActivityTrend ?? []).map((point) => ({
    label: point.label,
    value: point.value,
  }));
  const mappedTopPolls = mapTopPolls(snapshot);
  const kpis = buildPollKpisFromSnapshot(snapshot);
  const byId = new Map(kpis.map((kpi) => [kpi.id, kpi]));
  const insight = getPollModuleInsight(period);

  return {
    kpis,
    activityTrend: hasTrendData(pollTrend) ? pollTrend : emptyTrend(period),
    activityTrendIsMock: false,
    topPolls: mappedTopPolls,
    topPollsIsMock: false,
    moduleInsight: {
      ...insight,
      stats: [
        { label: "Criadas", value: byId.get("polls-created")?.value ?? "—" },
        { label: "Votos", value: byId.get("poll-votes")?.value ?? "—" },
        { label: "Participação", value: byId.get("poll-participation")?.value ?? "—" },
      ],
      highlight:
        (snapshot.pollVotes ?? 0) > 0
          ? `${formatNumber(snapshot.pollVotes ?? 0)} votos registrados no período`
          : undefined,
    },
  };
}

export function buildEmptyAnalyticsView(period: AnalyticsPeriod, module: AnalyticsModule): AnalyticsViewModel {
  const pollSection = buildEmptyPollSection(period);
  const emptySnapshot = normalizeSnapshot({
    period,
    activePeople: 0,
    activeUsersInPeriod: 0,
    feedPosts: 0,
    feedComments: 0,
    feedReactions: 0,
    comunicados: 0,
    comunicadoReads: 0,
    activeGroups: 0,
    groupMembers: 0,
    groupPosts: 0,
    notifications: 0,
    serviceRequests: 0,
    documents: 0,
    moodChecks: 0,
    activityTrend: [],
    serviceBreakdown: [],
    departmentEngagement: [],
    topContent: [],
  });

  return {
    kpis:
      module === "enquetes"
        ? pollSection.kpis
        : filterByModule(buildKpisFromSnapshot(emptySnapshot), module),
    activityTrend: emptyTrend(period),
    activityTrendIsMock: false,
    modules:
      module === "all"
        ? [...buildModulesFromSnapshot(emptySnapshot, period), pollSection.moduleInsight]
        : module === "enquetes"
          ? [pollSection.moduleInsight]
          : buildModulesFromSnapshot(emptySnapshot, period).filter((m) => m.id === module),
    topContent: [],
    topContentIsMock: false,
    serviceBreakdown: [],
    serviceBreakdownIsMock: false,
    departments: [],
    departmentsIsMock: false,
    mockSections: [],
    pollSection: module === "all" || module === "enquetes" ? pollSection : null,
  };
}

/** @deprecated Use buildEmptyAnalyticsView — kept for call-site compatibility. */
export function buildMockAnalyticsView(period: AnalyticsPeriod, module: AnalyticsModule): AnalyticsViewModel {
  return buildEmptyAnalyticsView(period, module);
}

export function buildAnalyticsView(
  snapshot: AnalyticsSnapshotDto | null | undefined,
  period: AnalyticsPeriod,
  module: AnalyticsModule,
): AnalyticsViewModel {
  if (!snapshot) {
    return buildEmptyAnalyticsView(period, module);
  }

  const normalized = normalizeSnapshot(snapshot);
  const activityTrend = normalized.activityTrend.map((p) => ({ label: p.label, value: p.value }));
  const trend = hasTrendData(activityTrend) ? activityTrend : emptyTrend(period);

  const serviceBreakdown = normalized.serviceBreakdown;
  const departments = normalized.departmentEngagement.map((d) => ({
    name: d.name,
    activeUsers: d.activeUsers,
    engagement: d.engagement,
  }));

  const mappedTop = mapTopContent(normalized);
  const topContent = filterByModule(
    mappedTop.map((item, index) => ({ ...item, rank: index + 1 })),
    module,
  );

  const pollSection =
    module === "all" || module === "enquetes" ? buildPollSection(normalized, period) : null;

  const modules =
    module === "all"
      ? [...buildModulesFromSnapshot(normalized, period), pollSection!.moduleInsight]
      : module === "enquetes"
        ? [pollSection!.moduleInsight]
        : buildModulesFromSnapshot(normalized, period).filter((m) => m.id === module);

  return {
    kpis:
      module === "enquetes"
        ? pollSection!.kpis
        : filterByModule(buildKpisFromSnapshot(normalized), module),
    activityTrend: trend,
    activityTrendIsMock: false,
    modules,
    topContent: module === "enquetes" ? pollSection!.topPolls : topContent,
    topContentIsMock: false,
    serviceBreakdown,
    serviceBreakdownIsMock: false,
    departments,
    departmentsIsMock: false,
    mockSections: [],
    pollSection,
  };
}
