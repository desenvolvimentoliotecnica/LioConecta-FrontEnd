import { LOOP_MOCK_DATA } from "../loop/mockData";
import type { PulseDataset } from "./types";

const today = new Date();

function daysFromNow(offset: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function daysAgo(offset: number): string {
  return daysFromNow(-offset);
}

function weekdayDates(count: number): string[] {
  const dates: string[] = [];
  const d = new Date(today);
  while (dates.length < count) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(d.toISOString().slice(0, 10));
    }
    d.setDate(d.getDate() - 1);
  }
  return dates.reverse();
}

const loopPeople = LOOP_MOCK_DATA.people;
const loopTeams = LOOP_MOCK_DATA.teams.filter((t) =>
  ["team-ti", "team-rh", "team-ops"].includes(t.id),
);

const lastWeekdays = weekdayDates(5);

export const PULSE_MOCK_DATA: PulseDataset = {
  people: loopPeople.map((p) => ({
    id: p.id,
    name: p.name,
    role: p.role,
    area: p.area,
  })),
  teams: [
    {
      id: "team-ti",
      name: loopTeams.find((t) => t.id === "team-ti")!.name,
      description: "Squad de desenvolvimento e infraestrutura",
      managerId: "p-leonardo",
      memberIds: ["p-leonardo", "p-ricardo", "p-mariana", "p-andre"],
    },
    {
      id: "team-rh",
      name: loopTeams.find((t) => t.id === "team-rh")!.name,
      description: "Squad de jornada do colaborador",
      managerId: "p-patricia",
      memberIds: ["p-patricia", "p-juliana", "p-camila"],
    },
    {
      id: "team-ops",
      name: loopTeams.find((t) => t.id === "team-ops")!.name,
      description: "Squad de analytics e processos",
      managerId: "p-felipe",
      memberIds: ["p-felipe", "p-camila"],
    },
  ],
  sprints: [
    {
      id: "spr-ti-14",
      teamId: "team-ti",
      name: "Sprint 14 — Intranet",
      goal: "Entregar módulo de comunicados e integração SSO",
      phase: "active",
      startDate: daysAgo(7),
      endDate: daysFromNow(7),
      committedPoints: 34,
      completedPoints: 18,
      velocity: 32,
    },
    {
      id: "spr-rh-08",
      teamId: "team-rh",
      name: "Sprint 08 — Portal RH",
      goal: "Holerite digital e fluxo de férias",
      phase: "active",
      startDate: daysAgo(5),
      endDate: daysFromNow(9),
      committedPoints: 28,
      completedPoints: 12,
      velocity: 26,
    },
    {
      id: "spr-ops-05",
      teamId: "team-ops",
      name: "Sprint 05 — Analytics",
      goal: "Dashboards executivos e alertas automáticos",
      phase: "active",
      startDate: daysAgo(3),
      endDate: daysFromNow(11),
      committedPoints: 22,
      completedPoints: 8,
      velocity: 20,
    },
  ],
  stories: [
    { id: "st-01", teamId: "team-ti", sprintId: "spr-ti-14", title: "API de comunicados oficiais", description: "Endpoints CRUD com permissões", status: "done", points: 5, assigneeId: "p-ricardo", priority: "alta", labels: ["backend"], createdAt: daysAgo(14) },
    { id: "st-02", teamId: "team-ti", sprintId: "spr-ti-14", title: "Tela de listagem de comunicados", description: "Grid com filtros e paginação", status: "in_progress", points: 3, assigneeId: "p-mariana", priority: "alta", labels: ["frontend"], createdAt: daysAgo(12) },
    { id: "st-03", teamId: "team-ti", sprintId: "spr-ti-14", title: "Integração SSO Azure AD", description: "Fluxo OAuth2 com refresh token", status: "in_progress", points: 8, assigneeId: "p-andre", priority: "alta", labels: ["auth"], createdAt: daysAgo(10) },
    { id: "st-04", teamId: "team-ti", sprintId: "spr-ti-14", title: "Testes E2E do módulo chat", description: "Cobertura dos fluxos principais", status: "todo", points: 5, assigneeId: "p-mariana", priority: "media", labels: ["qa"], createdAt: daysAgo(8) },
    { id: "st-05", teamId: "team-ti", sprintId: "spr-ti-14", title: "Deploy pipeline staging", description: "CI/CD com aprovação manual", status: "todo", points: 3, assigneeId: "p-ricardo", priority: "media", labels: ["devops"], createdAt: daysAgo(7) },
    { id: "st-06", teamId: "team-ti", sprintId: "spr-ti-14", title: "Documentação API OpenAPI", description: "Swagger atualizado", status: "done", points: 2, assigneeId: "p-andre", priority: "baixa", labels: ["docs"], createdAt: daysAgo(6) },
    { id: "st-07", teamId: "team-ti", sprintId: "spr-ti-14", title: "Otimização de bundle frontend", description: "Code splitting e lazy loading", status: "in_progress", points: 5, assigneeId: "p-ricardo", priority: "media", labels: ["performance"], createdAt: daysAgo(5) },
    { id: "st-08", teamId: "team-ti", title: "Módulo de enquetes", description: "Backlog — próximo sprint", status: "backlog", points: 8, assigneeId: "p-mariana", priority: "media", labels: ["feature"], createdAt: daysAgo(20) },
    { id: "st-09", teamId: "team-rh", sprintId: "spr-rh-08", title: "Tela de holerite digital", description: "Visualização e download PDF", status: "in_progress", points: 5, assigneeId: "p-juliana", priority: "alta", labels: ["frontend"], createdAt: daysAgo(10) },
    { id: "st-10", teamId: "team-rh", sprintId: "spr-rh-08", title: "Fluxo de solicitação de férias", description: "Wizard com aprovação do gestor", status: "todo", points: 8, assigneeId: "p-juliana", priority: "alta", labels: ["feature"], createdAt: daysAgo(9) },
    { id: "st-11", teamId: "team-rh", sprintId: "spr-rh-08", title: "Integração TOTVS RM — férias", description: "Sincronização de saldos", status: "in_progress", points: 5, assigneeId: "p-camila", priority: "alta", labels: ["integração"], createdAt: daysAgo(8) },
    { id: "st-12", teamId: "team-rh", sprintId: "spr-rh-08", title: "Notificações de aprovação RH", description: "E-mail e push interno", status: "done", points: 3, assigneeId: "p-patricia", priority: "media", labels: ["notificações"], createdAt: daysAgo(7) },
    { id: "st-13", teamId: "team-rh", sprintId: "spr-rh-08", title: "Relatório de absenteísmo", description: "Dashboard gerencial", status: "todo", points: 5, assigneeId: "p-camila", priority: "media", labels: ["analytics"], createdAt: daysAgo(6) },
    { id: "st-14", teamId: "team-rh", title: "Benefícios flexíveis", description: "Backlog — Q3", status: "backlog", points: 13, priority: "baixa", labels: ["feature"], createdAt: daysAgo(30) },
    { id: "st-15", teamId: "team-ops", sprintId: "spr-ops-05", title: "Dashboard executivo v2", description: "KPIs em tempo real", status: "in_progress", points: 8, assigneeId: "p-felipe", priority: "alta", labels: ["analytics"], createdAt: daysAgo(8) },
    { id: "st-16", teamId: "team-ops", sprintId: "spr-ops-05", title: "Alertas automáticos por threshold", description: "Regras configuráveis", status: "todo", points: 5, assigneeId: "p-felipe", priority: "alta", labels: ["alertas"], createdAt: daysAgo(7) },
    { id: "st-17", teamId: "team-ops", sprintId: "spr-ops-05", title: "Exportação CSV de métricas", description: "Download agendado", status: "done", points: 3, assigneeId: "p-camila", priority: "media", labels: ["export"], createdAt: daysAgo(6) },
    { id: "st-18", teamId: "team-ops", sprintId: "spr-ops-05", title: "Integração Power BI", description: "Dataset semântico", status: "in_progress", points: 5, assigneeId: "p-felipe", priority: "media", labels: ["integração"], createdAt: daysAgo(5) },
    { id: "st-19", teamId: "team-ti", title: "App mobile PWA", description: "Backlog estratégico", status: "backlog", points: 21, priority: "baixa", labels: ["mobile"], createdAt: daysAgo(45) },
    { id: "st-20", teamId: "team-ops", title: "Automação de relatórios semanais", description: "Backlog", status: "backlog", points: 5, priority: "media", labels: ["automação"], createdAt: daysAgo(15) },
  ],
  dailyEntries: (() => {
    const entries: PulseDataset["dailyEntries"] = [];
    const membersBySprint: Record<string, string[]> = {
      "spr-ti-14": ["p-ricardo", "p-mariana", "p-andre"],
      "spr-rh-08": ["p-juliana", "p-camila", "p-patricia"],
      "spr-ops-05": ["p-felipe", "p-camila"],
    };
    const moods: (1 | 2 | 3 | 4 | 5)[] = [4, 5, 3, 4, 5];
    let idx = 0;
    for (const [sprintId, members] of Object.entries(membersBySprint)) {
      for (const date of lastWeekdays) {
        for (const memberId of members) {
          entries.push({
            id: `de-${sprintId}-${memberId}-${date}`,
            sprintId,
            date,
            memberId,
            yesterday: "Finalizei tarefas do sprint anterior e revisei PRs pendentes.",
            today: "Continuo implementação das histórias comprometidas no planning.",
            blockers: idx % 7 === 0 ? "Aguardando acesso ao ambiente de homologação." : "",
            mood: moods[idx % moods.length],
          });
          idx++;
        }
      }
    }
    return entries;
  })(),
  impediments: [
    {
      id: "imp-01",
      teamId: "team-ti",
      sprintId: "spr-ti-14",
      title: "Ambiente de homologação indisponível",
      description: "Servidor HML fora do ar desde segunda-feira, bloqueando deploy de testes.",
      severity: "critico",
      status: "aberto",
      ownerId: "p-leonardo",
      reportedById: "p-ricardo",
      reportedAt: daysAgo(2),
    },
    {
      id: "imp-02",
      teamId: "team-rh",
      sprintId: "spr-rh-08",
      title: "Credenciais TOTVS expiradas",
      description: "Token de integração precisa ser renovado pelo time de infra.",
      severity: "alto",
      status: "em_andamento",
      ownerId: "p-patricia",
      reportedById: "p-camila",
      reportedAt: daysAgo(4),
    },
    {
      id: "imp-03",
      teamId: "team-ops",
      sprintId: "spr-ops-05",
      title: "Dados inconsistentes no warehouse",
      description: "Métricas de ocupação com divergência de 12% vs. fonte operacional.",
      severity: "medio",
      status: "aberto",
      ownerId: "p-felipe",
      reportedById: "p-felipe",
      reportedAt: daysAgo(1),
    },
  ],
  meetings: [
    {
      id: "mtg-ti-daily",
      teamId: "team-ti",
      sprintId: "spr-ti-14",
      type: "daily",
      title: "Daily — Squad TI",
      scheduledAt: `${daysFromNow(0)}T09:00:00`,
      durationMinutes: 15,
      facilitatorId: "p-ricardo",
      attendeeIds: ["p-ricardo", "p-mariana", "p-andre", "p-leonardo"],
    },
    {
      id: "mtg-rh-daily",
      teamId: "team-rh",
      sprintId: "spr-rh-08",
      type: "daily",
      title: "Daily — Squad RH",
      scheduledAt: `${daysFromNow(0)}T09:30:00`,
      durationMinutes: 15,
      facilitatorId: "p-juliana",
      attendeeIds: ["p-juliana", "p-camila", "p-patricia"],
    },
    {
      id: "mtg-ti-planning",
      teamId: "team-ti",
      sprintId: "spr-ti-14",
      type: "planning",
      title: "Sprint Planning — Sprint 15",
      scheduledAt: `${daysFromNow(7)}T14:00:00`,
      durationMinutes: 120,
      facilitatorId: "p-leonardo",
      attendeeIds: ["p-ricardo", "p-mariana", "p-andre", "p-leonardo"],
    },
    {
      id: "mtg-rh-review",
      teamId: "team-rh",
      sprintId: "spr-rh-08",
      type: "review",
      title: "Sprint Review — Portal RH",
      scheduledAt: `${daysFromNow(9)}T10:00:00`,
      durationMinutes: 60,
      facilitatorId: "p-patricia",
      attendeeIds: ["p-juliana", "p-camila", "p-patricia"],
    },
    {
      id: "mtg-ops-retro",
      teamId: "team-ops",
      sprintId: "spr-ops-05",
      type: "retro",
      title: "Retrospectiva — Analytics",
      scheduledAt: `${daysFromNow(11)}T15:00:00`,
      durationMinutes: 90,
      facilitatorId: "p-felipe",
      attendeeIds: ["p-felipe", "p-camila"],
    },
    {
      id: "mtg-ti-refinement",
      teamId: "team-ti",
      type: "refinement",
      title: "Refinamento de backlog",
      scheduledAt: `${daysFromNow(2)}T11:00:00`,
      durationMinutes: 60,
      facilitatorId: "p-ricardo",
      attendeeIds: ["p-ricardo", "p-mariana", "p-andre"],
    },
  ],
  agendaItems: [
    { id: "ag-01", meetingId: "mtg-ti-planning", title: "Revisão da velocidade do sprint 14", durationMinutes: 15, ownerId: "p-leonardo", sequence: 1 },
    { id: "ag-02", meetingId: "mtg-ti-planning", title: "Priorização do backlog", durationMinutes: 45, ownerId: "p-ricardo", decision: "Foco em SSO e chat", sequence: 2 },
    { id: "ag-03", meetingId: "mtg-ti-planning", title: "Estimativa de histórias", durationMinutes: 45, ownerId: "p-mariana", sequence: 3 },
    { id: "ag-04", meetingId: "mtg-rh-review", title: "Demo holerite digital", durationMinutes: 20, ownerId: "p-juliana", sequence: 1 },
    { id: "ag-05", meetingId: "mtg-rh-review", title: "Feedback dos stakeholders", durationMinutes: 25, ownerId: "p-patricia", sequence: 2 },
    { id: "ag-06", meetingId: "mtg-ops-retro", title: "O que funcionou bem?", durationMinutes: 30, ownerId: "p-felipe", sequence: 1 },
    { id: "ag-07", meetingId: "mtg-ops-retro", title: "O que melhorar?", durationMinutes: 30, ownerId: "p-camila", sequence: 2 },
    { id: "ag-08", meetingId: "mtg-ops-retro", title: "Plano de ação", durationMinutes: 30, ownerId: "p-felipe", decision: "Automatizar validação de dados", sequence: 3 },
  ],
  retroNotes: [
    { id: "rn-01", sprintId: "spr-ti-14", teamId: "team-ti", category: "continue", content: "Pair programming nas integrações críticas", authorId: "p-mariana", votes: 5, createdAt: daysAgo(14) },
    { id: "rn-02", sprintId: "spr-ti-14", teamId: "team-ti", category: "start", content: "Checklist de deploy antes de cada release", authorId: "p-ricardo", votes: 4, createdAt: daysAgo(14) },
    { id: "rn-03", sprintId: "spr-ti-14", teamId: "team-ti", category: "stop", content: "Reuniões sem pauta definida", authorId: "p-andre", votes: 6, createdAt: daysAgo(14) },
    { id: "rn-04", sprintId: "spr-rh-08", teamId: "team-rh", category: "action", content: "Documentar fluxos de aprovação RH", authorId: "p-juliana", votes: 3, createdAt: daysAgo(7) },
    { id: "rn-05", sprintId: "spr-ops-05", teamId: "team-ops", category: "continue", content: "Validação cruzada de métricas com operação", authorId: "p-felipe", votes: 4, createdAt: daysAgo(3) },
  ],
  actions: [
    { id: "act-01", sprintId: "spr-ti-14", teamId: "team-ti", title: "Criar checklist de deploy", assigneeId: "p-ricardo", dueDate: daysFromNow(5), status: "em_andamento", retroNoteId: "rn-02" },
    { id: "act-02", sprintId: "spr-ti-14", teamId: "team-ti", title: "Reduzir dailys para 10 minutos", assigneeId: "p-leonardo", dueDate: daysFromNow(3), status: "pendente", retroNoteId: "rn-03" },
    { id: "act-03", sprintId: "spr-rh-08", teamId: "team-rh", title: "Publicar wiki de fluxos RH", assigneeId: "p-juliana", dueDate: daysFromNow(7), status: "pendente", retroNoteId: "rn-04" },
    { id: "act-04", sprintId: "spr-ops-05", teamId: "team-ops", title: "Script de validação de dados", assigneeId: "p-felipe", dueDate: daysFromNow(10), status: "pendente" },
  ],
  burndown: {
    "spr-ti-14": [
      { date: daysAgo(7), ideal: 34, actual: 34 },
      { date: daysAgo(6), ideal: 30, actual: 32 },
      { date: daysAgo(5), ideal: 26, actual: 30 },
      { date: daysAgo(4), ideal: 22, actual: 28 },
      { date: daysAgo(3), ideal: 18, actual: 24 },
      { date: daysAgo(2), ideal: 14, actual: 22 },
      { date: daysAgo(1), ideal: 10, actual: 20 },
      { date: daysFromNow(0), ideal: 6, actual: 16 },
    ],
    "spr-rh-08": [
      { date: daysAgo(5), ideal: 28, actual: 28 },
      { date: daysAgo(4), ideal: 24, actual: 26 },
      { date: daysAgo(3), ideal: 20, actual: 24 },
      { date: daysAgo(2), ideal: 16, actual: 20 },
      { date: daysAgo(1), ideal: 12, actual: 18 },
      { date: daysFromNow(0), ideal: 8, actual: 16 },
    ],
    "spr-ops-05": [
      { date: daysAgo(3), ideal: 22, actual: 22 },
      { date: daysAgo(2), ideal: 18, actual: 20 },
      { date: daysAgo(1), ideal: 14, actual: 18 },
      { date: daysFromNow(0), ideal: 10, actual: 14 },
    ],
  },
};
