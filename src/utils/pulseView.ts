import {
  PULSE_BOARD_COLUMNS,
  PULSE_MOOD_LABELS,
  PULSE_RETRO_CATEGORIES,
} from "../config/pulse/constants";
import { PULSE_MOCK_DATA } from "../config/pulse/mockData";
import type {
  EnrichedAction,
  EnrichedDailyEntry,
  EnrichedImpediment,
  EnrichedMeeting,
  EnrichedRetroNote,
  EnrichedStory,
  PulseAlert,
  PulseBoardView,
  PulseDashboardView,
  PulseDataset,
  PulseFilters,
  PulseKpi,
  PulsePersonaContext,
  PulseSprintView,
  PulseStory,
} from "../config/pulse/types";
import type { MeDto } from "../api/types";

const EMAIL_TO_PERSON: Record<string, string> = {
  "leonardo.mendes@liotecnica.com.br": "p-leonardo",
  "patricia@liotecnica.com.br": "p-patricia",
};

const SLUG_TO_PERSON: Record<string, string> = {
  "leonardo-mendes": "p-leonardo",
  "patricia-lima": "p-patricia",
  "ricardo-alencar": "p-ricardo",
  "felipe-andrade": "p-felipe",
  "juliana-costa": "p-juliana",
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function getPersonName(data: PulseDataset, id: string): string {
  return data.people.find((p) => p.id === id)?.name ?? "—";
}

function getTeamName(data: PulseDataset, id: string): string {
  return data.teams.find((t) => t.id === id)?.name ?? "—";
}

function matchesSearch(text: string, search?: string): boolean {
  if (!search?.trim()) return true;
  return text.toLowerCase().includes(search.trim().toLowerCase());
}

function resolvePersonId(me?: MeDto | null): string {
  if (!me) return "p-leonardo";
  if (me.email && EMAIL_TO_PERSON[me.email.toLowerCase()]) {
    return EMAIL_TO_PERSON[me.email.toLowerCase()];
  }
  if (me.slug && SLUG_TO_PERSON[me.slug]) {
    return SLUG_TO_PERSON[me.slug];
  }
  const byName = PULSE_MOCK_DATA.people.find(
    (p) => me.name && p.name.toLowerCase().includes(me.name.split(" ")[0].toLowerCase()),
  );
  return byName?.id ?? "p-leonardo";
}

export function resolvePulsePersona(me?: MeDto | null, data: PulseDataset = PULSE_MOCK_DATA): PulsePersonaContext {
  const personId = resolvePersonId(me);
  const managedTeams = data.teams.filter((t) => t.managerId === personId).map((t) => t.id);
  const memberTeams = data.teams.filter((t) => t.memberIds.includes(personId)).map((t) => t.id);

  if (managedTeams.length > 0) {
    return {
      persona: "manager",
      personId,
      visibleTeamIds: managedTeams,
      label: "Gestor de Squad",
    };
  }

  if (memberTeams.length > 0) {
    return {
      persona: "member",
      personId,
      visibleTeamIds: [memberTeams[0]],
      label: "Membro do Squad",
    };
  }

  return {
    persona: "observer",
    personId,
    visibleTeamIds: data.teams.map((t) => t.id),
    label: "Observador",
  };
}

function applyPersonaScope(
  filters: PulseFilters,
  persona: PulsePersonaContext,
): PulseFilters {
  if (filters.teamId) return filters;
  if (persona.persona === "observer") return filters;
  if (persona.visibleTeamIds.length === 1) {
    return { ...filters, teamId: persona.visibleTeamIds[0] };
  }
  return filters;
}

function filterStories(data: PulseDataset, filters: PulseFilters): PulseStory[] {
  return data.stories.filter((s) => {
    if (filters.teamId && s.teamId !== filters.teamId) return false;
    if (filters.sprintId && s.sprintId !== filters.sprintId) return false;
    if (filters.status && s.status !== filters.status) return false;
    if (!matchesSearch(`${s.title} ${s.description} ${s.labels.join(" ")}`, filters.search)) return false;
    return true;
  });
}

function enrichStory(data: PulseDataset, story: PulseStory): EnrichedStory {
  return {
    ...story,
    assigneeName: story.assigneeId ? getPersonName(data, story.assigneeId) : "—",
    teamName: getTeamName(data, story.teamId),
  };
}

function enrichStories(data: PulseDataset, filters: PulseFilters): EnrichedStory[] {
  return filterStories(data, filters).map((s) => enrichStory(data, s));
}

export function getPulseData(): PulseDataset {
  return PULSE_MOCK_DATA;
}

export function formatPulseDate(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(dateStr));
}

export function formatPulseDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(dateStr));
}

export function buildPulseKpis(filters: PulseFilters, data: PulseDataset = PULSE_MOCK_DATA): PulseKpi[] {
  const stories = filterStories(data, filters);
  const sprints = data.sprints.filter((s) => {
    if (filters.teamId && s.teamId !== filters.teamId) return false;
    if (filters.sprintId && s.id !== filters.sprintId) return false;
    return true;
  });
  const activeSprints = sprints.filter((s) => s.phase === "active").length;
  const inProgress = stories.filter((s) => s.status === "in_progress").length;
  const done = stories.filter((s) => s.status === "done").length;
  const openImpediments = data.impediments.filter((i) => {
    if (filters.teamId && i.teamId !== filters.teamId) return false;
    return i.status !== "resolvido";
  }).length;
  const totalPoints = stories.reduce((sum, s) => sum + s.points, 0);
  const donePoints = stories.filter((s) => s.status === "done").reduce((sum, s) => sum + s.points, 0);
  const velocity = sprints.length > 0 ? Math.round(sprints.reduce((s, sp) => s + sp.velocity, 0) / sprints.length) : 0;

  return [
    {
      id: "active-sprints",
      label: "Sprints ativos",
      value: String(activeSprints),
      delta: "em execução",
      trend: "neutral",
      icon: "fa-flag",
      mod: "sprint",
      href: "/pulse/sprint",
    },
    {
      id: "in-progress",
      label: "Histórias em andamento",
      value: String(inProgress),
      delta: `${done} concluídas`,
      trend: "up",
      icon: "fa-bolt",
      mod: "board",
      href: "/pulse/board",
    },
    {
      id: "impediments",
      label: "Impedimentos abertos",
      value: String(openImpediments),
      delta: openImpediments > 2 ? "atenção" : "controlado",
      trend: openImpediments > 2 ? "down" : "neutral",
      icon: "fa-road-barrier",
      mod: "impedimentos",
      href: "/pulse/impedimentos",
    },
    {
      id: "velocity",
      label: "Velocidade média",
      value: `${velocity} pts`,
      delta: "últimos sprints",
      trend: "up",
      icon: "fa-gauge-high",
      mod: "velocity",
      href: "/pulse/sprint",
    },
    {
      id: "burndown",
      label: "Pontos entregues",
      value: `${donePoints}/${totalPoints}`,
      delta: totalPoints > 0 ? `${Math.round((donePoints / totalPoints) * 100)}%` : "0%",
      trend: "up",
      icon: "fa-chart-line",
      mod: "burndown",
      href: "/pulse/sprint",
    },
  ];
}

export function buildPulseAlerts(filters: PulseFilters, data: PulseDataset = PULSE_MOCK_DATA): PulseAlert[] {
  const alerts: PulseAlert[] = [];
  const impediments = data.impediments.filter((i) => {
    if (filters.teamId && i.teamId !== filters.teamId) return false;
    return i.status !== "resolvido";
  });
  const critical = impediments.filter((i) => i.severity === "critico").length;
  const missingDailys = countMissingDailys(filters, data);

  if (critical > 0) {
    alerts.push({
      id: "alert-critical-imp",
      type: "impedimentos_criticos",
      severity: "critical",
      title: "Impedimentos críticos",
      description: "Bloqueando entregas do sprint",
      quantity: critical,
      date: todayStr(),
      origin: "Impedimentos",
      link: "/pulse/impedimentos",
    });
  }
  if (impediments.length > 0) {
    alerts.push({
      id: "alert-open-imp",
      type: "impedimentos_abertos",
      severity: "warning",
      title: "Impedimentos em aberto",
      description: "Requerem acompanhamento do gestor",
      quantity: impediments.length,
      date: todayStr(),
      origin: "Impedimentos",
      link: "/pulse/impedimentos",
    });
  }
  if (missingDailys > 0) {
    alerts.push({
      id: "alert-missing-daily",
      type: "dailys_pendentes",
      severity: "info",
      title: "Dailys pendentes",
      description: "Membros sem atualização hoje",
      quantity: missingDailys,
      date: todayStr(),
      origin: "Rituais",
      link: "/pulse/dailys",
    });
  }

  return alerts;
}

function countMissingDailys(filters: PulseFilters, data: PulseDataset): number {
  const today = todayStr();
  const sprints = data.sprints.filter((s) => {
    if (filters.teamId && s.teamId !== filters.teamId) return false;
    if (filters.sprintId && s.id !== filters.sprintId) return false;
    return s.phase === "active";
  });
  let missing = 0;
  for (const sprint of sprints) {
    const team = data.teams.find((t) => t.id === sprint.teamId);
    if (!team) continue;
    for (const memberId of team.memberIds) {
      const hasEntry = data.dailyEntries.some(
        (d) => d.sprintId === sprint.id && d.memberId === memberId && d.date === today,
      );
      if (!hasEntry) missing++;
    }
  }
  return missing;
}

function buildSprintView(data: PulseDataset, sprintId: string, filters: PulseFilters): PulseSprintView {
  const sprint = data.sprints.find((s) => s.id === sprintId)!;
  const sprintFilters = { ...filters, sprintId };
  const stories = enrichStories(data, sprintFilters);
  const burndown = data.burndown[sprintId] ?? [];
  const completionPercent =
    sprint.committedPoints > 0
      ? Math.round((sprint.completedPoints / sprint.committedPoints) * 100)
      : 0;

  return {
    ...sprint,
    teamName: getTeamName(data, sprint.teamId),
    stories,
    burndown,
    completionPercent,
  };
}

export function buildPulseDashboardView(
  filters: PulseFilters,
  persona: PulsePersonaContext,
  data: PulseDataset = PULSE_MOCK_DATA,
): PulseDashboardView {
  const scoped = applyPersonaScope(filters, persona);
  const activeSprintIds = data.sprints
    .filter((s) => {
      if (scoped.teamId && s.teamId !== scoped.teamId) return false;
      if (scoped.sprintId && s.id !== scoped.sprintId) return false;
      return s.phase === "active";
    })
    .map((s) => s.id);

  const recentDailys = buildDailysView(scoped, persona, data)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  return {
    kpis: buildPulseKpis(scoped, data),
    alerts: buildPulseAlerts(scoped, data),
    activeSprints: activeSprintIds.map((id) => buildSprintView(data, id, scoped)),
    recentDailys,
    openImpediments: buildImpedimentsView(scoped, persona, data).filter((i) => i.status !== "resolvido").slice(0, 5),
    upcomingMeetings: buildMeetingsView(scoped, persona, data).slice(0, 5),
    pendingActions: buildRetroView(scoped, persona, data).actions.filter((a) => a.status !== "concluida").slice(0, 5),
  };
}

export function buildDailysView(
  filters: PulseFilters,
  persona: PulsePersonaContext,
  data: PulseDataset = PULSE_MOCK_DATA,
): EnrichedDailyEntry[] {
  const scoped = applyPersonaScope(filters, persona);
  return data.dailyEntries
    .filter((d) => {
      const sprint = data.sprints.find((s) => s.id === d.sprintId);
      if (!sprint) return false;
      if (scoped.teamId && sprint.teamId !== scoped.teamId) return false;
      if (scoped.sprintId && d.sprintId !== scoped.sprintId) return false;
      if (!matchesSearch(`${d.yesterday} ${d.today} ${d.blockers}`, scoped.search)) return false;
      return true;
    })
    .map((d) => ({
      ...d,
      memberName: getPersonName(data, d.memberId),
      moodLabel: PULSE_MOOD_LABELS[d.mood] ?? "—",
    }))
    .sort((a, b) => b.date.localeCompare(a.date) || a.memberName.localeCompare(b.memberName));
}

export function buildSprintViewList(
  filters: PulseFilters,
  persona: PulsePersonaContext,
  data: PulseDataset = PULSE_MOCK_DATA,
): PulseSprintView[] {
  const scoped = applyPersonaScope(filters, persona);
  return data.sprints
    .filter((s) => {
      if (scoped.teamId && s.teamId !== scoped.teamId) return false;
      if (scoped.sprintId && s.id !== scoped.sprintId) return false;
      if (!matchesSearch(`${s.name} ${s.goal}`, scoped.search)) return false;
      return true;
    })
    .map((s) => buildSprintView(data, s.id, scoped));
}

export function buildBacklogView(
  filters: PulseFilters,
  persona: PulsePersonaContext,
  data: PulseDataset = PULSE_MOCK_DATA,
): EnrichedStory[] {
  const scoped = applyPersonaScope(filters, persona);
  return enrichStories(data, { ...scoped, status: "backlog" });
}

export function buildBoardView(
  filters: PulseFilters,
  persona: PulsePersonaContext,
  data: PulseDataset = PULSE_MOCK_DATA,
): PulseBoardView {
  const scoped = applyPersonaScope(filters, persona);
  const stories = enrichStories(data, scoped).filter((s) => s.sprintId);

  return {
    columns: PULSE_BOARD_COLUMNS.map((col) => ({
      id: col.id,
      label: col.label,
      stories: stories.filter((s) => s.status === col.id),
    })),
  };
}

export function buildPlanningView(
  filters: PulseFilters,
  persona: PulsePersonaContext,
  data: PulseDataset = PULSE_MOCK_DATA,
) {
  const scoped = applyPersonaScope(filters, persona);
  const planningSprints = data.sprints.filter((s) => {
    if (scoped.teamId && s.teamId !== scoped.teamId) return false;
    return s.phase === "planning" || s.phase === "active";
  });
  const backlog = enrichStories(data, { ...scoped, status: "backlog" });
  const meetings = buildMeetingsView(scoped, persona, data).filter((m) => m.type === "planning" || m.type === "refinement");

  return { planningSprints, backlog, meetings };
}

export function buildReviewView(
  filters: PulseFilters,
  persona: PulsePersonaContext,
  data: PulseDataset = PULSE_MOCK_DATA,
) {
  const scoped = applyPersonaScope(filters, persona);
  const sprints = data.sprints.filter((s) => {
    if (scoped.teamId && s.teamId !== scoped.teamId) return false;
    return s.phase === "review" || s.phase === "active";
  });
  const doneStories = enrichStories(data, scoped).filter((s) => s.status === "done" && s.sprintId);
  const meetings = buildMeetingsView(scoped, persona, data).filter((m) => m.type === "review");

  return { sprints, doneStories, meetings };
}

export function buildRetroView(
  filters: PulseFilters,
  persona: PulsePersonaContext,
  data: PulseDataset = PULSE_MOCK_DATA,
): { notes: EnrichedRetroNote[]; actions: EnrichedAction[]; categories: typeof PULSE_RETRO_CATEGORIES } {
  const scoped = applyPersonaScope(filters, persona);
  const notes = data.retroNotes
    .filter((n) => {
      if (scoped.teamId && n.teamId !== scoped.teamId) return false;
      if (scoped.sprintId && n.sprintId !== scoped.sprintId) return false;
      return true;
    })
    .map((n) => ({
      ...n,
      authorName: getPersonName(data, n.authorId),
    }))
    .sort((a, b) => b.votes - a.votes);

  const actions: EnrichedAction[] = data.actions
    .filter((a) => {
      if (scoped.teamId && a.teamId !== scoped.teamId) return false;
      if (scoped.sprintId && a.sprintId !== scoped.sprintId) return false;
      return true;
    })
    .map((a) => ({
      ...a,
      assigneeName: getPersonName(data, a.assigneeId),
    }));

  return { notes, actions, categories: PULSE_RETRO_CATEGORIES };
}

export function buildImpedimentsView(
  filters: PulseFilters,
  persona: PulsePersonaContext,
  data: PulseDataset = PULSE_MOCK_DATA,
): EnrichedImpediment[] {
  const scoped = applyPersonaScope(filters, persona);
  return data.impediments
    .filter((i) => {
      if (scoped.teamId && i.teamId !== scoped.teamId) return false;
      if (scoped.sprintId && i.sprintId !== scoped.sprintId) return false;
      if (!matchesSearch(`${i.title} ${i.description}`, scoped.search)) return false;
      return true;
    })
    .map((i) => ({
      ...i,
      ownerName: getPersonName(data, i.ownerId),
      reporterName: getPersonName(data, i.reportedById),
      teamName: getTeamName(data, i.teamId),
    }))
    .sort((a, b) => {
      const severityOrder = { critico: 0, alto: 1, medio: 2, baixo: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
}

export function buildMeetingsView(
  filters: PulseFilters,
  persona: PulsePersonaContext,
  data: PulseDataset = PULSE_MOCK_DATA,
): EnrichedMeeting[] {
  const scoped = applyPersonaScope(filters, persona);
  return data.meetings
    .filter((m) => {
      if (scoped.teamId && m.teamId !== scoped.teamId) return false;
      if (scoped.sprintId && m.sprintId !== scoped.sprintId) return false;
      if (!matchesSearch(m.title, scoped.search)) return false;
      return true;
    })
    .map((m) => ({
      ...m,
      facilitatorName: getPersonName(data, m.facilitatorId),
      teamName: getTeamName(data, m.teamId),
      agenda: data.agendaItems
        .filter((a) => a.meetingId === m.id)
        .sort((a, b) => a.sequence - b.sequence)
        .map((a) => ({
          ...a,
          ownerName: getPersonName(data, a.ownerId),
        })),
    }))
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}

export { getPersonName, getTeamName };
