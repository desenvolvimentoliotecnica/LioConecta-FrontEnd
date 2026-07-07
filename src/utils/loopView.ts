import {
  ACTIVE_PROJECT_STATUSES,
  CLOSED_STATUSES,
  IN_PROGRESS_ACTIVITY_STATUSES,
  OCCUPANCY_THRESHOLDS,
  PERFORMANCE_WEIGHTS,
} from "../config/loop/constants";
import { LOOP_MOCK_DATA } from "../config/loop/mockData";
import type {
  LoopActivity,
  LoopAlert,
  LoopApproval,
  LoopDataset,
  LoopFilters,
  LoopKpi,
  LoopProject,
  LoopRisk,
  LoopTeam,
} from "../config/loop/types";
import type { TrendPoint } from "../config/analytics";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function isOverdue(dateStr: string, status: string): boolean {
  if (CLOSED_STATUSES.has(status)) return false;
  return dateStr < todayStr();
}

function getPersonName(data: LoopDataset, id: string): string {
  return data.people.find((p) => p.id === id)?.name ?? "—";
}

function getTeamName(data: LoopDataset, id: string): string {
  return data.teams.find((t) => t.id === id)?.name ?? "—";
}

function getProjectName(data: LoopDataset, id: string): string {
  return data.projects.find((p) => p.id === id)?.name ?? "—";
}

function matchesSearch(text: string, search?: string): boolean {
  if (!search?.trim()) return true;
  return text.toLowerCase().includes(search.trim().toLowerCase());
}

function filterProjects(data: LoopDataset, filters: LoopFilters): LoopProject[] {
  return data.projects.filter((p) => {
    if (filters.teamId && p.teamId !== filters.teamId) return false;
    if (filters.projectId && p.id !== filters.projectId) return false;
    if (filters.status && p.status !== filters.status) return false;
    if (filters.priority && p.priority !== filters.priority) return false;
    if (!matchesSearch(`${p.name} ${p.code} ${p.description}`, filters.search)) return false;
    return true;
  });
}

function filterActivities(data: LoopDataset, filters: LoopFilters, projectIds?: Set<string>): LoopActivity[] {
  return data.activities.filter((a) => {
    if (projectIds && !projectIds.has(a.projectId)) return false;
    if (filters.teamId && a.teamId !== filters.teamId) return false;
    if (filters.projectId && a.projectId !== filters.projectId) return false;
    if (filters.status && a.status !== filters.status) return false;
    if (filters.priority && a.priority !== filters.priority) return false;
    if (!matchesSearch(a.title, filters.search)) return false;
    return true;
  });
}

function computeProjectProgress(data: LoopDataset, projectId: string): number {
  const acts = data.activities.filter((a) => a.projectId === projectId);
  if (acts.length === 0) return 0;
  const completed = acts.filter((a) => a.status === "concluida").length;
  return Math.round((completed / acts.length) * 100);
}

function computeHealth(data: LoopDataset, project: LoopProject): LoopProject["health"] {
  const overdueMilestone = data.milestones.some(
    (m) => m.projectId === project.id && isOverdue(m.plannedDate, m.status === "concluido" ? "concluido" : "pendente"),
  );
  const highRisk = data.risks.some(
    (r) => r.projectId === project.id && r.status === "aberto" && (r.severity === "alto" || r.severity === "critico"),
  );
  const blockedActivity = data.activities.some(
    (a) => a.projectId === project.id && a.status === "bloqueada",
  );
  const overdueActivities = data.activities.filter(
    (a) => a.projectId === project.id && isOverdue(a.dueDate, a.status),
  ).length;

  if (overdueMilestone || highRisk || blockedActivity || overdueActivities >= 2) return "critico";
  if (overdueActivities >= 1 || project.status === "atencao") return "atencao";
  return "no_prazo";
}

function countOverdueItems(data: LoopDataset, filters: LoopFilters): number {
  const projectIds = new Set(filterProjects(data, filters).map((p) => p.id));
  let count = 0;

  for (const a of filterActivities(data, filters, projectIds)) {
    if (isOverdue(a.dueDate, a.status)) count++;
  }
  for (const m of data.milestones) {
    if (!projectIds.has(m.projectId)) continue;
    if (m.status !== "concluido" && isOverdue(m.plannedDate, "pendente")) count++;
  }
  for (const ap of data.approvals) {
    if (!projectIds.has(ap.projectId)) continue;
    if (ap.status === "pendente" && isOverdue(ap.dueDate, ap.status)) count++;
  }
  return count;
}

function weekDeliverables(data: LoopDataset, filters: LoopFilters): number {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const projectIds = new Set(filterProjects(data, filters).map((p) => p.id));

  return data.deliverables.filter((d) => {
    if (!projectIds.has(d.projectId)) return false;
    const planned = new Date(d.plannedDate);
    return planned >= now && planned <= weekEnd;
  }).length;
}

function computePerformanceIndex(filters: LoopFilters, data: LoopDataset = LOOP_MOCK_DATA): number {
  const projectIds = new Set(filterProjects(data, filters).map((p) => p.id));
  const activities = filterActivities(data, filters, projectIds);
  const deliverables = data.deliverables.filter((d) => projectIds.has(d.projectId));
  const risks = data.risks.filter((r) => projectIds.has(r.projectId) && r.status === "aberto");

  const onTimeDeliveries =
    deliverables.length === 0
      ? 1
      : deliverables.filter((d) => d.status !== "atrasado").length / deliverables.length;

  const completedActivities =
    activities.length === 0
      ? 0
      : activities.filter((a) => a.status === "concluida").length / activities.length;

  const scheduleAdherence =
    activities.length === 0
      ? 1
      : 1 - activities.filter((a) => isOverdue(a.dueDate, a.status)).length / activities.length;

  const noCriticalBlockers =
    activities.length === 0
      ? 1
      : 1 - activities.filter((a) => a.status === "bloqueada").length / activities.length;

  const riskControl =
    risks.length === 0 ? 1 : 1 - risks.filter((r) => r.severity === "alto" || r.severity === "critico").length / risks.length;

  const w = PERFORMANCE_WEIGHTS;
  return Math.round(
    (onTimeDeliveries * w.onTimeDeliveries +
      completedActivities * w.completedActivities +
      scheduleAdherence * w.scheduleAdherence +
      noCriticalBlockers * w.noCriticalBlockers +
      riskControl * w.riskControl) *
      100,
  );
}

export function buildLoopKpis(filters: LoopFilters, data: LoopDataset = LOOP_MOCK_DATA): LoopKpi[] {
  const projects = filterProjects(data, filters);
  const activities = filterActivities(data, filters, new Set(projects.map((p) => p.id)));
  const teams = filters.teamId ? data.teams.filter((t) => t.id === filters.teamId) : data.teams;

  const activeProjects = projects.filter((p) => ACTIVE_PROJECT_STATUSES.has(p.status)).length;
  const inProgressActivities = activities.filter((a) => IN_PROGRESS_ACTIVITY_STATUSES.has(a.status)).length;
  const overdue = countOverdueItems(data, filters);
  const weekDel = weekDeliverables(data, filters);

  return [
    {
      id: "active-projects",
      label: "Projetos ativos",
      value: String(activeProjects),
      delta: "+2 vs. semana anterior",
      trend: "up",
      icon: "fa-folder-tree",
      mod: "projetos",
      href: "/loop/projetos",
    },
    {
      id: "in-progress",
      label: "Atividades em andamento",
      value: String(inProgressActivities),
      delta: "+8 vs. semana anterior",
      trend: "up",
      icon: "fa-list-check",
      mod: "atividades",
      href: "/loop/atividades",
    },
    {
      id: "overdue",
      label: "Itens atrasados",
      value: String(overdue),
      delta: overdue > 15 ? "acima da meta" : "dentro da meta",
      trend: overdue > 15 ? "down" : "neutral",
      icon: "fa-clock",
      mod: "alertas",
      href: "/loop/atividades",
    },
    {
      id: "teams",
      label: "Equipes",
      value: String(teams.length),
      delta: "ativas no período",
      trend: "neutral",
      icon: "fa-people-group",
      mod: "equipes",
      href: "/loop/equipes",
    },
    {
      id: "week-deliveries",
      label: "Entregas da semana",
      value: String(weekDel),
      delta: "+3 vs. semana anterior",
      trend: "up",
      icon: "fa-box-open",
      mod: "entregas",
      href: "/loop/planejamento",
    },
  ];
}

export function buildLoopAlerts(filters: LoopFilters, data: LoopDataset = LOOP_MOCK_DATA): LoopAlert[] {
  const projects = filterProjects(data, filters);
  const criticalProjects = projects.filter((p) => computeHealth(data, p) === "critico").length;
  const overdue = countOverdueItems(data, filters);
  const pendingApprovals = data.approvals.filter(
    (a) => a.status === "pendente" && (!filters.projectId || a.projectId === filters.projectId),
  ).length;
  const overloadedTeams = data.teams.filter((t) => {
    if (filters.teamId && t.id !== filters.teamId) return false;
    return (t.allocatedHours / t.availableHours) * 100 > OCCUPANCY_THRESHOLDS.high;
  }).length;

  const alerts: LoopAlert[] = [];

  if (criticalProjects > 0) {
    alerts.push({
      id: "alert-critical",
      type: "projetos_criticos",
      severity: "critical",
      title: "Projetos críticos",
      description: "Requerem atenção imediata da diretoria",
      quantity: criticalProjects,
      date: todayStr(),
      origin: "Saúde do projeto",
      link: "/loop/projetos",
    });
  }
  if (overdue > 0) {
    alerts.push({
      id: "alert-overdue",
      type: "itens_atrasados",
      severity: "warning",
      title: "Itens atrasados",
      description: "Impactando prazos de entrega",
      quantity: overdue,
      date: todayStr(),
      origin: "Cronograma",
      link: "/loop/atividades",
    });
  }
  if (pendingApprovals > 0) {
    alerts.push({
      id: "alert-approvals",
      type: "aprovacoes_pendentes",
      severity: "warning",
      title: "Aprovações pendentes",
      description: "Aguardando decisão de gestores",
      quantity: pendingApprovals,
      date: todayStr(),
      origin: "Governança",
      link: "/loop/aprovacoes",
    });
  }
  if (overloadedTeams > 0) {
    alerts.push({
      id: "alert-capacity",
      type: "equipe_sobrecarregada",
      severity: "info",
      title: "Equipes sobrecarregadas",
      description: "Ocupação acima de 100%",
      quantity: overloadedTeams,
      date: todayStr(),
      origin: "Capacidade",
      link: "/loop/equipes",
    });
  }

  return alerts;
}

export type EnrichedProject = LoopProject & {
  ownerName: string;
  teamName: string;
  computedProgress: number;
  computedHealth: LoopProject["health"];
};

export function buildLoopProjectsView(filters: LoopFilters, data: LoopDataset = LOOP_MOCK_DATA): EnrichedProject[] {
  return filterProjects(data, filters).map((p) => ({
    ...p,
    ownerName: getPersonName(data, p.ownerId),
    teamName: getTeamName(data, p.teamId),
    computedProgress: computeProjectProgress(data, p.id),
    computedHealth: computeHealth(data, p),
  }));
}

export type EnrichedActivity = LoopActivity & {
  projectName: string;
  assigneeName: string;
  isOverdue: boolean;
};

export function buildLoopActivitiesView(filters: LoopFilters, data: LoopDataset = LOOP_MOCK_DATA): EnrichedActivity[] {
  const projectIds = new Set(filterProjects(data, filters).map((p) => p.id));
  return filterActivities(data, filters, projectIds)
    .map((a) => ({
      ...a,
      projectName: getProjectName(data, a.projectId),
      assigneeName: getPersonName(data, a.assigneeId),
      isOverdue: isOverdue(a.dueDate, a.status),
    }))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export type TeamCapacityView = LoopTeam & {
  occupancyPercent: number;
  occupancyLevel: "healthy" | "attention" | "high" | "overload";
  managerName: string;
};

export function buildLoopTeamsView(filters: LoopFilters, data: LoopDataset = LOOP_MOCK_DATA): TeamCapacityView[] {
  const teams = filters.teamId ? data.teams.filter((t) => t.id === filters.teamId) : data.teams;

  return teams.map((t) => {
    const occupancyPercent = Math.round((t.allocatedHours / t.availableHours) * 100);
    let occupancyLevel: TeamCapacityView["occupancyLevel"] = "healthy";
    if (occupancyPercent > OCCUPANCY_THRESHOLDS.high) occupancyLevel = "overload";
    else if (occupancyPercent > OCCUPANCY_THRESHOLDS.attention) occupancyLevel = "high";
    else if (occupancyPercent > OCCUPANCY_THRESHOLDS.healthy) occupancyLevel = "attention";

    return {
      ...t,
      occupancyPercent,
      occupancyLevel,
      managerName: getPersonName(data, t.managerId),
    };
  });
}

export type RiskSummary = {
  total: number;
  bySeverity: { label: string; value: number; color: string }[];
  byCategory: { label: string; value: number; color: string }[];
  items: (LoopRisk & { projectName: string; ownerName: string })[];
};

const RISK_CATEGORY_COLORS: Record<string, string> = {
  Técnico: "#6366f1",
  Integração: "#0ea5e9",
  Dados: "#8b5cf6",
  Organizacional: "#ec4899",
  Financeiro: "#f59e0b",
  Processo: "#64748b",
  Recursos: "#14b8a6",
  Escopo: "#f97316",
  Compliance: "#dc2626",
  Externo: "#84cc16",
  Operacional: "#a855f7",
};

const FALLBACK_CATEGORY_COLORS = ["#6366f1", "#0ea5e9", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899"];

export function buildLoopRisksView(filters: LoopFilters, data: LoopDataset = LOOP_MOCK_DATA): RiskSummary {
  const projectIds = new Set(filterProjects(data, filters).map((p) => p.id));
  const items = data.risks
    .filter((r) => projectIds.has(r.projectId) && r.status === "aberto")
    .map((r) => ({
      ...r,
      projectName: getProjectName(data, r.projectId),
      ownerName: getPersonName(data, r.ownerId),
    }));

  const severityMap: Record<string, { color: string }> = {
    critico: { color: "#dc2626" },
    alto: { color: "#ea580c" },
    medio: { color: "#f59e0b" },
    baixo: { color: "#10b981" },
  };

  const counts = { critico: 0, alto: 0, medio: 0, baixo: 0 };
  for (const r of items) counts[r.severity]++;

  const categoryCounts = new Map<string, number>();
  for (const r of items) {
    categoryCounts.set(r.category, (categoryCounts.get(r.category) ?? 0) + 1);
  }

  const byCategory = [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], index) => ({
      label,
      value,
      color: RISK_CATEGORY_COLORS[label] ?? FALLBACK_CATEGORY_COLORS[index % FALLBACK_CATEGORY_COLORS.length],
    }));

  return {
    total: items.length,
    bySeverity: (["critico", "alto", "medio", "baixo"] as const).map((s) => ({
      label: s.charAt(0).toUpperCase() + s.slice(1),
      value: counts[s],
      color: severityMap[s].color,
    })),
    byCategory,
    items,
  };
}

export type EnrichedApproval = LoopApproval & {
  projectName: string;
  requesterName: string;
  approverName: string;
  isOverdue: boolean;
};

export function buildLoopApprovalsView(filters: LoopFilters, data: LoopDataset = LOOP_MOCK_DATA): EnrichedApproval[] {
  const projectIds = new Set(filterProjects(data, filters).map((p) => p.id));
  return data.approvals
    .filter((a) => projectIds.has(a.projectId))
    .map((a) => ({
      ...a,
      projectName: getProjectName(data, a.projectId),
      requesterName: getPersonName(data, a.requesterId),
      approverName: getPersonName(data, a.approverId),
      isOverdue: a.status === "pendente" && isOverdue(a.dueDate, a.status),
    }))
    .sort((a, b) => {
      if (a.status === "pendente" && b.status !== "pendente") return -1;
      if (a.status !== "pendente" && b.status === "pendente") return 1;
      return a.dueDate.localeCompare(b.dueDate);
    });
}

export function buildLoopPerformanceHistory(filters: LoopFilters, data: LoopDataset = LOOP_MOCK_DATA): TrendPoint[] {
  const current = computePerformanceIndex(filters, data);
  const history = data.performanceHistory.map((h) => ({
    label: new Date(h.referenceDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    value: h.value,
  }));
  if (history.length > 0) {
    history[history.length - 1] = {
      ...history[history.length - 1],
      value: current,
    };
  }
  return history;
}

export type RoadmapRow = {
  projectId: string;
  projectName: string;
  teamName: string;
  startDate: string;
  endDate: string;
  progress: number;
  health: LoopProject["health"];
  phases: { id: string; name: string; type: string; startDate: string; endDate: string; color: string; progress: number }[];
  milestones: { id: string; name: string; date: string; status: string; criticality: string }[];
};

export function buildLoopRoadmap(filters: LoopFilters, data: LoopDataset = LOOP_MOCK_DATA): RoadmapRow[] {
  return filterProjects(data, filters).map((p) => ({
    projectId: p.id,
    projectName: p.name,
    teamName: getTeamName(data, p.teamId),
    startDate: p.startDate,
    endDate: p.plannedEndDate,
    progress: computeProjectProgress(data, p.id),
    health: computeHealth(data, p),
    phases: data.phases
      .filter((ph) => ph.projectId === p.id)
      .sort((a, b) => a.sequence - b.sequence)
      .map((ph) => ({
        id: ph.id,
        name: ph.name,
        type: ph.type,
        startDate: ph.startDate,
        endDate: ph.endDate,
        color: ph.color,
        progress: ph.progress,
      })),
    milestones: data.milestones
      .filter((m) => m.projectId === p.id)
      .map((m) => ({
        id: m.id,
        name: m.name,
        date: m.plannedDate,
        status: m.status,
        criticality: m.criticality,
      })),
  }));
}

export type LoopDashboardView = {
  kpis: LoopKpi[];
  alerts: LoopAlert[];
  projects: EnrichedProject[];
  recentActivities: EnrichedActivity[];
  teams: TeamCapacityView[];
  risks: RiskSummary;
  pendingApprovals: EnrichedApproval[];
  performanceIndex: number;
  performanceDelta: number;
  performanceHistory: TrendPoint[];
};

export function buildLoopDashboardView(
  filters: LoopFilters,
  data: LoopDataset = LOOP_MOCK_DATA,
): LoopDashboardView {
  const performanceIndex = computePerformanceIndex(filters, data);
  const history = data.performanceHistory;
  const previous = history.length >= 2 ? history[history.length - 2].value : performanceIndex;

  return {
    kpis: buildLoopKpis(filters, data),
    alerts: buildLoopAlerts(filters, data),
    projects: buildLoopProjectsView(filters, data).slice(0, 6),
    recentActivities: buildLoopActivitiesView(filters, data).slice(0, 8),
    teams: buildLoopTeamsView(filters, data),
    risks: buildLoopRisksView(filters, data),
    pendingApprovals: buildLoopApprovalsView(filters, data).filter((a) => a.status === "pendente"),
    performanceIndex,
    performanceDelta: performanceIndex - previous,
    performanceHistory: buildLoopPerformanceHistory(filters, data),
  };
}

export function getLoopData(): LoopDataset {
  return LOOP_MOCK_DATA;
}

export { getPersonName, getProjectName, getTeamName, formatLoopDate };

function formatLoopDate(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(dateStr));
}
