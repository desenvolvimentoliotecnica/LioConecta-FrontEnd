export type ActivityTask = {
  id: string;
  text: string;
  done: boolean;
};

export type Activity = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  tasks: ActivityTask[];
  percentComplete: number;
  createdAt: string;
  updatedAt: string;
};

export type ActivityFilter = "all" | "today" | "week" | "open";

export type DiaryGroup = {
  dateKey: string;
  label: string;
  activities: Activity[];
};

const STORAGE_KEY = "lioconecta-activities";

export const ACTIVITY_FILTERS: { id: ActivityFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "today", label: "Hoje" },
  { id: "week", label: "Esta semana" },
  { id: "open", label: "Em andamento" },
];

export const SEED_ACTIVITIES: Activity[] = [
  {
    id: "act-1",
    title: "Revisão do organograma de TI",
    description:
      "Atualizar cargos e vínculos no módulo Pessoas após reorganização do time de infraestrutura.",
    startDate: "2026-07-04T09:00",
    endDate: "2026-07-04T11:30",
    tasks: [
      { id: "t1", text: "Conferir dados com RH", done: true },
      { id: "t2", text: "Validar hierarquia no organograma", done: true },
      { id: "t3", text: "Publicar versão final", done: false },
    ],
    percentComplete: 67,
    createdAt: "2026-07-04T08:45",
    updatedAt: "2026-07-04T10:15",
  },
  {
    id: "act-2",
    title: "Preparação da reunião de alinhamento",
    description: "Montar pauta, slides e checklist de follow-ups para reunião semanal da diretoria.",
    startDate: "2026-07-04T14:00",
    endDate: "2026-07-04T16:00",
    tasks: [
      { id: "t4", text: "Definir pauta com stakeholders", done: false },
      { id: "t5", text: "Enviar convite no calendário", done: false },
    ],
    percentComplete: 20,
    createdAt: "2026-07-04T13:10",
    updatedAt: "2026-07-04T13:10",
  },
  {
    id: "act-3",
    title: "Documentação de políticas internas",
    description: "Revisar versão draft das políticas de segurança da informação no hub Documentos.",
    startDate: "2026-07-03T10:00",
    endDate: "2026-07-03T12:00",
    tasks: [
      { id: "t6", text: "Comparar com versão anterior", done: true },
      { id: "t7", text: "Registrar comentários da área jurídica", done: true },
      { id: "t8", text: "Submeter para aprovação", done: true },
    ],
    percentComplete: 100,
    createdAt: "2026-07-03T09:30",
    updatedAt: "2026-07-03T11:50",
  },
  {
    id: "act-4",
    title: "Onboarding — novos colaboradores",
    description: "Acompanhar integração de dois novos membros do time comercial na semana passada.",
    startDate: "2026-07-01T08:30",
    endDate: "2026-07-01T17:30",
    tasks: [
      { id: "t9", text: "Apresentação institucional", done: true },
      { id: "t10", text: "Tour pelos grupos internos", done: true },
      { id: "t11", text: "Checklist de acessos", done: false },
    ],
    percentComplete: 75,
    createdAt: "2026-07-01T08:00",
    updatedAt: "2026-07-01T16:40",
  },
];

export function newId(prefix = "id"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function loadActivities(): Activity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_ACTIVITIES;
    const parsed = JSON.parse(raw) as Activity[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_ACTIVITIES;
  } catch {
    return SEED_ACTIVITIES;
  }
}

export function saveActivities(activities: Activity[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}

export function computePercentFromTasks(tasks: ActivityTask[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((task) => task.done).length;
  return Math.round((done / tasks.length) * 100);
}

export function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function parseDateKey(key: string): { year: number; month: number; day: number } {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month: month - 1, day };
}

export function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function formatDiaryDateLabel(dateKey: string, todayKey = "2026-07-04"): string {
  const parsed = parseDateKey(dateKey);
  const date = new Date(parsed.year, parsed.month, parsed.day);
  const today = parseDateKey(todayKey);
  const todayDate = new Date(today.year, today.month, today.day);
  const diffDays = Math.round((todayDate.getTime() - date.getTime()) / 86_400_000);

  const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
  const full = date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (diffDays === 0) return `Hoje — ${full}`;
  if (diffDays === 1) return `Ontem — ${full}`;
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${full}`;
}

export function isSameWeek(dateKey: string, todayKey = "2026-07-04"): boolean {
  const date = new Date(parseDateKey(dateKey).year, parseDateKey(dateKey).month, parseDateKey(dateKey).day);
  const today = new Date(parseDateKey(todayKey).year, parseDateKey(todayKey).month, parseDateKey(todayKey).day);
  const day = today.getDay() || 7;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - day + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return date >= weekStart && date <= weekEnd;
}

export function filterActivities(
  activities: Activity[],
  filter: ActivityFilter,
  query: string,
  todayKey = "2026-07-04",
): Activity[] {
  const normalized = query.trim().toLowerCase();

  return activities.filter((activity) => {
    const dateKey = toDateKey(activity.startDate);

    if (filter === "today" && dateKey !== todayKey) return false;
    if (filter === "week" && !isSameWeek(dateKey, todayKey)) return false;
    if (filter === "open" && activity.percentComplete >= 100) return false;

    if (!normalized) return true;

    const haystack = [
      activity.title,
      activity.description,
      ...activity.tasks.map((task) => task.text),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function groupActivitiesByDate(activities: Activity[], todayKey = "2026-07-04"): DiaryGroup[] {
  const sorted = [...activities].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );

  const map = new Map<string, Activity[]>();
  sorted.forEach((activity) => {
    const key = toDateKey(activity.startDate);
    const list = map.get(key) ?? [];
    list.push(activity);
    map.set(key, list);
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, groupActivities]) => ({
      dateKey,
      label: formatDiaryDateLabel(dateKey, todayKey),
      activities: groupActivities.sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      ),
    }));
}

export function createActivityDraft(now = new Date()): Activity {
  const start = new Date(now);
  start.setMinutes(0, 0, 0);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  const toLocalInput = (date: Date) => {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const timestamp = now.toISOString();

  return {
    id: newId("act"),
    title: "",
    description: "",
    startDate: toLocalInput(start),
    endDate: toLocalInput(end),
    tasks: [],
    percentComplete: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function activitySummary(activities: Activity[]) {
  const total = activities.length;
  const open = activities.filter((a) => a.percentComplete < 100).length;
  const avg =
    total === 0
      ? 0
      : Math.round(activities.reduce((sum, a) => sum + a.percentComplete, 0) / total);
  const tasksDone = activities.reduce(
    (sum, a) => sum + a.tasks.filter((t) => t.done).length,
    0,
  );
  const tasksTotal = activities.reduce((sum, a) => sum + a.tasks.length, 0);

  return { total, open, avg, tasksDone, tasksTotal };
}
