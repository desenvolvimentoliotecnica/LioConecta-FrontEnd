import type { PlannerTaskDto } from "../api/types";

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
  bucketId?: string;
  bucketName?: string;
  assignees?: { id: string; name: string; email: string }[];
  canEdit?: boolean;
  plannerUrl?: string;
};

export type ActivityFilter = "mine" | "all" | "today" | "week" | "open";

export type DiaryGroup = {
  dateKey: string;
  label: string;
  activities: Activity[];
};

export const ACTIVITY_FILTERS: { id: ActivityFilter; label: string }[] = [
  { id: "mine", label: "Minhas atividades" },
  { id: "all", label: "Todas" },
  { id: "today", label: "Hoje" },
  { id: "week", label: "Esta semana" },
  { id: "open", label: "Em andamento" },
];

export function currentTodayKey(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Interpreta valor de `<input type="datetime-local">` como horário local do navegador. */
export function parseDatetimeLocal(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value.trim());
  if (!match) return null;

  const [, year, month, day, hour, minute] = match;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    0,
    0,
  );
}

/** Converte datetime-local → ISO UTC para a API. */
export function datetimeLocalToApi(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const parsed = parseDatetimeLocal(value);
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : null;
}

/** Converte ISO da API → datetime-local no fuso do navegador. */
export function apiDatetimeToLocalInput(value: string | null | undefined): string {
  if (!value?.trim()) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);

  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseActivityDate(value: string): Date | null {
  const local = parseDatetimeLocal(value);
  if (local) return local;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function plannerTaskToActivity(task: PlannerTaskDto): Activity {
  const start = task.startDate ?? task.dueDate ?? task.createdAt;
  const end = task.dueDate ?? task.startDate ?? task.createdAt;

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    startDate: apiDatetimeToLocalInput(start),
    endDate: apiDatetimeToLocalInput(end),
    tasks: task.checklist.map((item) => ({
      id: item.id,
      text: item.text,
      done: item.done,
    })),
    percentComplete: task.percentComplete,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    bucketId: task.bucketId,
    bucketName: task.bucketName,
    assignees: task.assignees,
    canEdit: task.canEdit,
    plannerUrl: task.plannerUrl,
  };
}

export function activityToPlannerRequest(activity: Activity) {
  return {
    title: activity.title,
    description: activity.description,
    startDate: datetimeLocalToApi(activity.startDate),
    dueDate: datetimeLocalToApi(activity.endDate),
    percentComplete: activity.percentComplete,
    bucketId: activity.bucketId ?? null,
    checklist: activity.tasks.map((task) => ({
      id: task.id,
      text: task.text,
      done: task.done,
    })),
  };
}

export function newId(prefix = "id"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function computePercentFromTasks(tasks: ActivityTask[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((task) => task.done).length;
  return Math.round((done / tasks.length) * 100);
}

export function toDateKey(iso: string): string {
  const date = parseActivityDate(iso);
  if (!date) return iso.slice(0, 10);

  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(key: string): { year: number; month: number; day: number } {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month: month - 1, day };
}

export function formatTime(iso: string): string {
  const date = parseActivityDate(iso);
  if (!date) return iso.slice(11, 16);
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function formatDiaryDateLabel(dateKey: string, todayKey = currentTodayKey()): string {
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

export function isSameWeek(dateKey: string, todayKey = currentTodayKey()): boolean {
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
  todayKey = currentTodayKey(),
): Activity[] {
  const normalized = query.trim().toLowerCase();

  return activities.filter((activity) => {
    const dateKey = toDateKey(activity.startDate);

    if (filter === "mine" && !activity.canEdit) return false;
    if (filter === "today" && dateKey !== todayKey) return false;
    if (filter === "week" && !isSameWeek(dateKey, todayKey)) return false;
    if (filter === "open" && activity.percentComplete >= 100) return false;

    if (!normalized) return true;

    const haystack = [
      activity.title,
      activity.description,
      activity.bucketName ?? "",
      ...(activity.assignees?.map((assignee) => assignee.name) ?? []),
      ...activity.tasks.map((task) => task.text),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function groupActivitiesByDate(activities: Activity[], todayKey = currentTodayKey()): DiaryGroup[] {
  const sorted = [...activities].sort(
    (a, b) =>
      (parseActivityDate(a.startDate)?.getTime() ?? 0) -
      (parseActivityDate(b.startDate)?.getTime() ?? 0),
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
        (a, b) =>
          (parseActivityDate(a.startDate)?.getTime() ?? 0) -
          (parseActivityDate(b.startDate)?.getTime() ?? 0),
      ),
    }));
}

export function createActivityDraft(now = new Date(), defaultBucketId?: string): Activity {
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
    bucketId: defaultBucketId,
    canEdit: true,
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
