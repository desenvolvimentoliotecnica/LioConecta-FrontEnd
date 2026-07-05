import type { AnalyticsSnapshotDto } from "../api/types";
import {
  filterByModule,
  formatNumber,
  getActivityTrend,
  getDepartmentEngagement,
  getKpis,
  getModuleInsights,
  getPollActivityTrend,
  getPollKpis,
  getPollModuleInsight,
  getServiceBreakdown,
  getTopContent,
  getTopPolls,
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

function formatTopItemValue(item: AnalyticsSnapshotDto["topContent"][number]): string {
  if (item.value <= 0) return "Recente";
  if (item.mod === "enquetes") return `${formatNumber(item.value)} votos`;
  if (item.mod === "documentos") return `${formatNumber(item.value)} downloads`;
  if (item.mod === "servicos") return `${formatNumber(item.value)} acessos`;
  if (item.mod === "grupos") return `${formatNumber(item.value)} interações`;
  return `${formatNumber(item.value)} leituras`;
}

function mapTopContent(snapshot: AnalyticsSnapshotDto): RankedItem[] {
  if (snapshot.topContent.length === 0) return [];

  return snapshot.topContent.map((item, index) => ({
    rank: index + 1,
    title: item.title,
    meta: item.meta,
    value: formatTopItemValue(item),
    href: item.href,
    mod: item.mod as RankedItem["mod"],
  }));
}

function mapTopPolls(snapshot: AnalyticsSnapshotDto): RankedItem[] {
  if (snapshot.topPolls.length === 0) return [];

  return snapshot.topPolls.map((item, index) => ({
    rank: index + 1,
    title: item.title,
    meta: item.meta,
    value: formatTopItemValue(item),
    href: item.href,
    mod: "enquetes",
  }));
}

function buildKpisFromSnapshot(snapshot: AnalyticsSnapshotDto, period: AnalyticsPeriod): KpiMetric[] {
  const mockKpis = getKpis(period);
  const mockById = new Map(mockKpis.map((kpi) => [kpi.id, kpi]));

  const realKpis: KpiMetric[] = [
    {
      id: "active-users",
      label: "Colaboradores ativos",
      value: formatNumber(snapshot.activePeople),
      delta: mockById.get("active-users")?.delta ?? "—",
      trend: "up",
      icon: "fa-user-check",
      mod: "all",
    },
    {
      id: "engagement-rate",
      label: "Usuários ativos no período",
      value: formatNumber(snapshot.activeUsersInPeriod),
      delta: mockById.get("engagement-rate")?.delta ?? "—",
      trend: snapshot.activeUsersInPeriod > 0 ? "up" : "neutral",
      icon: "fa-chart-line",
      mod: "engajamento",
    },
    {
      id: "comunicados-read",
      label: "Comunicados lidos",
      value: formatNumber(snapshot.comunicadoReads),
      delta: mockById.get("comunicados-read")?.delta ?? "—",
      trend: snapshot.comunicadoReads > 0 ? "up" : "neutral",
      icon: "fa-bullhorn",
      mod: "comunicados",
    },
    {
      id: "service-requests",
      label: "Solicitações de serviços",
      value: formatNumber(snapshot.serviceRequests),
      delta: mockById.get("service-requests")?.delta ?? "—",
      trend: snapshot.serviceRequests > 0 ? "up" : "neutral",
      icon: "fa-clipboard-list",
      mod: "servicos",
    },
    {
      id: "feed-posts",
      label: "Publicações no feed",
      value: formatNumber(snapshot.feedPosts),
      delta: mockById.get("feed-posts")?.delta ?? "—",
      trend: snapshot.feedPosts > 0 ? "up" : "neutral",
      icon: "fa-rss",
      mod: "feed",
    },
    {
      id: "doc-downloads",
      label: "Documentos catalogados",
      value: formatNumber(snapshot.documents),
      delta: mockById.get("doc-downloads")?.delta ?? "—",
      trend: "neutral",
      icon: "fa-file-arrow-down",
      mod: "documentos",
    },
    {
      id: "profile-views",
      label: "Notificações enviadas",
      value: formatNumber(snapshot.notifications),
      delta: mockById.get("profile-views")?.delta ?? "—",
      trend: snapshot.notifications > 0 ? "up" : "neutral",
      icon: "fa-bell",
      mod: "pessoas",
    },
    {
      id: "group-interactions",
      label: "Grupos ativos",
      value: formatNumber(snapshot.activeGroups),
      delta: mockById.get("group-interactions")?.delta ?? "—",
      trend: snapshot.activeGroups > 0 ? "up" : "neutral",
      icon: "fa-people-group",
      mod: "grupos",
    },
  ];

  return realKpis.map((kpi) => {
    const mock = mockById.get(kpi.id);
    if (!mock) return kpi;
    const isReal =
      (kpi.id === "active-users" && snapshot.activePeople > 0) ||
      (kpi.id === "engagement-rate" && snapshot.activeUsersInPeriod >= 0) ||
      (kpi.id === "comunicados-read" && snapshot.comunicadoReads >= 0) ||
      (kpi.id === "service-requests" && snapshot.serviceRequests >= 0) ||
      (kpi.id === "feed-posts" && snapshot.feedPosts >= 0) ||
      (kpi.id === "doc-downloads" && snapshot.documents >= 0) ||
      (kpi.id === "profile-views" && snapshot.notifications >= 0) ||
      (kpi.id === "group-interactions" && snapshot.activeGroups > 0);

    return {
      ...kpi,
      delta: isReal ? "dado real" : mock.delta,
      trend: isReal ? kpi.trend : mock.trend,
    };
  });
}

function buildModulesFromSnapshot(snapshot: AnalyticsSnapshotDto, period: AnalyticsPeriod): ModuleInsight[] {
  const mockModules = getModuleInsights(period);
  const mockById = new Map(mockModules.map((mod) => [mod.id, mod]));

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
      highlight: mockById.get("feed")?.highlight,
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
      highlight: mockById.get("comunicados")?.highlight,
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
      highlight: mockById.get("pessoas")?.highlight,
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
      highlight: mockById.get("grupos")?.highlight,
    },
    documentos: {
      id: "documentos",
      title: "Documentos",
      description: "Políticas, manuais, formulários, modelos e biblioteca corporativa.",
      href: "/documentos/politicas-internas",
      stats: [
        { label: "Documentos", value: formatNumber(snapshot.documents) },
        { label: "Visualizações", value: mockById.get("documentos")?.stats[1]?.value ?? "—" },
        { label: "Novos uploads", value: mockById.get("documentos")?.stats[2]?.value ?? "—" },
      ],
      highlight: mockById.get("documentos")?.highlight,
    },
    servicos: {
      id: "servicos",
      title: "Serviços digitais",
      description: "RH, TI, Facilities e Jurídico — solicitações e autoatendimento.",
      href: "/servicos/beneficios",
      stats: [
        { label: "Solicitações", value: formatNumber(snapshot.serviceRequests) },
        { label: "SLA médio", value: mockById.get("servicos")?.stats[1]?.value ?? "—" },
        { label: "Satisfação", value: mockById.get("servicos")?.stats[2]?.value ?? "—" },
      ],
      highlight: mockById.get("servicos")?.highlight,
    },
    engajamento: {
      id: "engajamento",
      title: "Notificações e mensagens",
      description: "Alertas do portal, chat interno e interações em tempo real.",
      href: "/notificacoes",
      stats: [
        { label: "Notificações enviadas", value: formatNumber(snapshot.notifications) },
        { label: "Taxa de abertura", value: mockById.get("engajamento")?.stats[1]?.value ?? "—" },
        { label: "Mensagens no chat", value: mockById.get("engajamento")?.stats[2]?.value ?? "—" },
      ],
      highlight: mockById.get("engajamento")?.highlight,
    },
  };

  return mockModules.map((mock) => realStats[mock.id] ?? mock);
}

function buildPollKpisFromSnapshot(snapshot: AnalyticsSnapshotDto, period: AnalyticsPeriod): KpiMetric[] {
  const mockKpis = getPollKpis(period);
  const mockById = new Map(mockKpis.map((kpi) => [kpi.id, kpi]));

  const realKpis: KpiMetric[] = [
    {
      id: "polls-created",
      label: "Enquetes criadas",
      value: formatNumber(snapshot.pollsCreated),
      delta: mockById.get("polls-created")?.delta ?? "—",
      trend: snapshot.pollsCreated > 0 ? "up" : "neutral",
      icon: "fa-square-plus",
      mod: "enquetes",
    },
    {
      id: "poll-votes",
      label: "Total de votos",
      value: formatNumber(snapshot.pollVotes),
      delta: mockById.get("poll-votes")?.delta ?? "—",
      trend: snapshot.pollVotes > 0 ? "up" : "neutral",
      icon: "fa-check-to-slot",
      mod: "enquetes",
    },
    {
      id: "polls-active",
      label: "Enquetes ativas",
      value: formatNumber(snapshot.activePolls),
      delta: "—",
      trend: "neutral",
      icon: "fa-circle-play",
      mod: "enquetes",
    },
    {
      id: "poll-participation",
      label: "Taxa de participação",
      value: `${snapshot.pollParticipationRate}%`,
      delta: mockById.get("poll-participation")?.delta ?? "—",
      trend: snapshot.pollParticipationRate > 0 ? "up" : "neutral",
      icon: "fa-users-viewfinder",
      mod: "enquetes",
    },
    {
      id: "poll-avg-votes",
      label: "Média de votos/enquete",
      value: formatNumber(snapshot.pollAvgVotesPerPoll),
      delta: mockById.get("poll-avg-votes")?.delta ?? "—",
      trend: snapshot.pollAvgVotesPerPoll > 0 ? "up" : "neutral",
      icon: "fa-chart-simple",
      mod: "enquetes",
    },
    {
      id: "polls-closed",
      label: "Enquetes encerradas",
      value: formatNumber(snapshot.pollsClosed),
      delta: mockById.get("polls-closed")?.delta ?? "—",
      trend: snapshot.pollsClosed > 0 ? "up" : "neutral",
      icon: "fa-circle-stop",
      mod: "enquetes",
    },
  ];

  return realKpis.map((kpi) => {
    const mock = mockById.get(kpi.id);
    if (!mock) return kpi;
    const hasRealData =
      (kpi.id === "polls-created" && snapshot.pollsCreated >= 0) ||
      (kpi.id === "poll-votes" && snapshot.pollVotes >= 0) ||
      (kpi.id === "polls-active" && snapshot.activePolls >= 0) ||
      (kpi.id === "poll-participation" && snapshot.pollParticipationRate >= 0) ||
      (kpi.id === "poll-avg-votes" && snapshot.pollAvgVotesPerPoll >= 0) ||
      (kpi.id === "polls-closed" && snapshot.pollsClosed >= 0);

    return {
      ...kpi,
      delta: hasRealData ? "dado real" : mock.delta,
      trend: hasRealData ? kpi.trend : mock.trend,
    };
  });
}

function buildPollSection(
  snapshot: AnalyticsSnapshotDto | null | undefined,
  period: AnalyticsPeriod,
  mockSections: string[],
): PollSectionView {
  if (!snapshot) {
    return {
      kpis: getPollKpis(period),
      activityTrend: getPollActivityTrend(period),
      activityTrendIsMock: true,
      topPolls: getTopPolls(period),
      topPollsIsMock: true,
      moduleInsight: getPollModuleInsight(period),
    };
  }

  const pollTrend = snapshot.pollActivityTrend.map((point) => ({ label: point.label, value: point.value }));
  const pollTrendIsMock = !hasTrendData(pollTrend);
  if (pollTrendIsMock) mockSections.push("tendência de votos em enquetes");

  const mappedTopPolls = mapTopPolls(snapshot);
  const topPollsIsMock = mappedTopPolls.length === 0;
  if (topPollsIsMock) mockSections.push("ranking de enquetes");

  const mockInsight = getPollModuleInsight(period);
  const kpis = buildPollKpisFromSnapshot(snapshot, period);
  const byId = new Map(kpis.map((kpi) => [kpi.id, kpi]));

  return {
    kpis,
    activityTrend: pollTrendIsMock ? getPollActivityTrend(period) : pollTrend,
    activityTrendIsMock: pollTrendIsMock,
    topPolls: topPollsIsMock ? getTopPolls(period) : mappedTopPolls,
    topPollsIsMock,
    moduleInsight: {
      ...mockInsight,
      stats: [
        { label: "Criadas", value: byId.get("polls-created")?.value ?? "—" },
        { label: "Votos", value: byId.get("poll-votes")?.value ?? "—" },
        { label: "Participação", value: byId.get("poll-participation")?.value ?? "—" },
      ],
      highlight:
        snapshot.pollVotes > 0
          ? `${formatNumber(snapshot.pollVotes)} votos registrados no período`
          : mockInsight.highlight,
    },
  };
}

export function buildMockAnalyticsView(period: AnalyticsPeriod, module: AnalyticsModule): AnalyticsViewModel {
  const pollSection = buildPollSection(null, period, []);
  return {
    kpis:
      module === "enquetes"
        ? pollSection.kpis
        : filterByModule(getKpis(period), module),
    activityTrend: getActivityTrend(period),
    activityTrendIsMock: true,
    modules:
      module === "all"
        ? [...getModuleInsights(period), getPollModuleInsight(period)]
        : module === "enquetes"
          ? [pollSection.moduleInsight]
          : getModuleInsights(period).filter((m) => m.id === module),
    topContent:
      module === "enquetes"
        ? pollSection.topPolls
        : filterByModule(getTopContent(period), module),
    topContentIsMock: true,
    serviceBreakdown: getServiceBreakdown(period),
    serviceBreakdownIsMock: true,
    departments: getDepartmentEngagement(),
    departmentsIsMock: true,
    mockSections: ["todos os indicadores"],
    pollSection: module === "all" || module === "enquetes" ? pollSection : null,
  };
}

export function buildAnalyticsView(
  snapshot: AnalyticsSnapshotDto | null | undefined,
  period: AnalyticsPeriod,
  module: AnalyticsModule,
): AnalyticsViewModel {
  if (!snapshot) {
    return buildMockAnalyticsView(period, module);
  }

  const mockSections: string[] = [];
  const activityTrend = snapshot.activityTrend.map((p) => ({ label: p.label, value: p.value }));
  const activityTrendIsMock = !hasTrendData(activityTrend);
  const trend = activityTrendIsMock ? getActivityTrend(period) : activityTrend;
  if (activityTrendIsMock) mockSections.push("tendência de atividade");

  const serviceBreakdownIsMock = snapshot.serviceBreakdown.length === 0;
  const serviceBreakdown = serviceBreakdownIsMock
    ? getServiceBreakdown(period)
    : snapshot.serviceBreakdown;
  if (serviceBreakdownIsMock) mockSections.push("solicitações por área");

  const departmentsIsMock = snapshot.departmentEngagement.length === 0;
  const departments = departmentsIsMock
    ? getDepartmentEngagement()
    : snapshot.departmentEngagement.map((d) => ({
        name: d.name,
        activeUsers: d.activeUsers,
        engagement: d.engagement,
      }));
  if (departmentsIsMock) mockSections.push("engajamento por departamento");

  const mappedTop = mapTopContent(snapshot);
  const topContentIsMock = mappedTop.length === 0;
  const topContent = topContentIsMock
    ? filterByModule(getTopContent(period), module)
    : filterByModule(
        mappedTop.map((item, index) => ({ ...item, rank: index + 1 })),
        module,
      );
  if (topContentIsMock) mockSections.push("conteúdo em destaque");

  const pollSection =
    module === "all" || module === "enquetes"
      ? buildPollSection(snapshot, period, mockSections)
      : null;

  const modules =
    module === "all"
      ? [...buildModulesFromSnapshot(snapshot, period), pollSection!.moduleInsight]
      : module === "enquetes"
        ? [pollSection!.moduleInsight]
        : buildModulesFromSnapshot(snapshot, period).filter((m) => m.id === module);

  return {
    kpis:
      module === "enquetes"
        ? pollSection!.kpis
        : filterByModule(buildKpisFromSnapshot(snapshot, period), module),
    activityTrend: trend,
    activityTrendIsMock,
    modules,
    topContent:
      module === "enquetes"
        ? pollSection!.topPolls
        : topContent,
    topContentIsMock: module === "enquetes" ? pollSection!.topPollsIsMock : topContentIsMock,
    serviceBreakdown,
    serviceBreakdownIsMock,
    departments,
    departmentsIsMock,
    mockSections,
    pollSection,
  };
}
