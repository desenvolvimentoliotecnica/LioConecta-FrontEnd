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

export type DiaryActivitySlice = {
  activity: Activity;
  /** Instantes da fatia neste dia (ISO). */
  sliceStart: string;
  sliceEnd: string;
};

export type DiaryGroup = {
  dateKey: string;
  label: string;
  activities: DiaryActivitySlice[];
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
  const trimmed = value.trim();
  // Não tratar ISO com fuso (Z / ±HH:MM) como datetime-local — senão UTC vira wall-clock local (+3h no BRT).
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(trimmed)) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(trimmed);
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
  const trimmed = value.trim();
  if (!trimmed) return null;

  // ISO da API (com Z/offset) — sempre via Date nativo (não confundir com datetime-local).
  if (/[zZ]|[+-]\d{2}:\d{2}/.test(trimmed)) {
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const local = parseDatetimeLocal(trimmed);
  if (local) return local;

  const parsed = new Date(trimmed);
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
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

export function formatTimeRange(start: string, end: string): string {
  const startLabel = formatTime(start);
  const endLabel = formatTime(end);
  return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
}

/** Mínimo de duração contabilizada (mesma regra do DIRETRIZ / tasks.json). */
export const MIN_ACTIVITY_DURATION_MINUTES = 30;

/** Início da janela útil no dia (08:00). Antes disso não conta (madrugada). */
export const WORK_DAY_START_HOUR = 8;

/** Fim da janela útil no dia (22:00). Das 22:00 às 08:00 do dia seguinte não conta. */
export const WORK_DAY_END_HOUR = 22;

/** Duração entre início e conclusão (ex.: "1h 36min", "45min", "30min"). */
export function formatActivityDuration(start: string, end: string): string | null {
  const minutes = activityDurationMinutes(start, end);
  if (minutes == null) return null;
  return formatMinutesAsDuration(minutes);
}

/** Minutos brutos entre dois instantes (sem mínimo). */
export function activityDurationMinutesRaw(start: string, end: string): number | null {
  const startDate = parseActivityDate(start);
  const endDate = parseActivityDate(end);
  if (!startDate || !endDate) return null;

  const diffMs = endDate.getTime() - startDate.getTime();
  if (diffMs < 0) return null;
  return Math.round(diffMs / 60_000);
}

/** Duração com piso de 30 min (commits/intervalos curtos contam como 30). */
export function activityDurationMinutes(
  start: string,
  end: string,
  options?: { applyMinimum?: boolean },
): number | null {
  const raw = activityDurationMinutesRaw(start, end);
  if (raw == null) return null;
  if (options?.applyMinimum === false) return raw;
  return Math.max(raw, MIN_ACTIVITY_DURATION_MINUTES);
}

export function formatMinutesAsDuration(totalMinutes: number): string {
  if (totalMinutes < 1) return "< 1min";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

/** Preferir start/due do Planner (backfill de commits); fallback criação→atualização. */
export function activityTimelineBounds(activity: Activity): { start: string; end: string } {
  const start = activity.startDate || activity.createdAt;
  const end = activity.endDate || activity.updatedAt || activity.createdAt;
  return { start, end };
}

type TimeIntervalMs = { startMs: number; endMs: number };

function dateKeyFromLocalDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function localDayBoundsMs(dateKey: string): { dayStartMs: number; dayEndMs: number } {
  const { year, month, day } = parseDateKey(dateKey);
  const dayStartMs = new Date(year, month, day, 0, 0, 0, 0).getTime();
  const dayEndMs = new Date(year, month, day + 1, 0, 0, 0, 0).getTime();
  return { dayStartMs, dayEndMs };
}

/** Recorta um intervalo ao dia civil local; null se não houver sobreposição. */
export function clipIntervalToDateKey(
  interval: TimeIntervalMs,
  dateKey: string,
): TimeIntervalMs | null {
  const { dayStartMs, dayEndMs } = localDayBoundsMs(dateKey);
  const startMs = Math.max(interval.startMs, dayStartMs);
  const endMs = Math.min(interval.endMs, dayEndMs);
  if (endMs <= startMs) return null;
  return { startMs, endMs };
}

/**
 * Recorta à janela útil do dia (08:00–22:00).
 * Exclui madrugada (00:00–08:00) e noite (22:00–24:00) — o “sono” 22h→08h.
 */
export function clipIntervalToWorkDay(
  interval: TimeIntervalMs,
  dateKey: string,
): TimeIntervalMs | null {
  const { year, month, day } = parseDateKey(dateKey);
  const windowStartMs = new Date(year, month, day, WORK_DAY_START_HOUR, 0, 0, 0).getTime();
  const windowEndMs = new Date(year, month, day, WORK_DAY_END_HOUR, 0, 0, 0).getTime();
  const startMs = Math.max(interval.startMs, windowStartMs);
  const endMs = Math.min(interval.endMs, windowEndMs);
  if (endMs <= startMs) return null;
  return { startMs, endMs };
}

/** Expande o intervalo bruto em fatias úteis por dia (08:00–22:00, sáb/dom inclusive). */
export function expandToWorkDayIntervals(interval: TimeIntervalMs): TimeIntervalMs[] {
  return dateKeysSpannedByInterval(interval).flatMap((dateKey) => {
    const clipped = clipIntervalToWorkDay(interval, dateKey);
    return clipped ? [clipped] : [];
  });
}

/**
 * Dias civis cobertos pelo intervalo [start, end) — inclui sábado e domingo.
 * Não há salto de fim de semana: cada dia civil conta.
 */
export function dateKeysSpannedByInterval(interval: TimeIntervalMs): string[] {
  const keys: string[] = [];
  const cursor = new Date(interval.startMs);
  cursor.setHours(0, 0, 0, 0);

  while (cursor.getTime() < interval.endMs) {
    keys.push(dateKeyFromLocalDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return keys;
}

/**
 * Intervalo de trabalho de uma atividade concluída, com piso de 30 min
 * (recua o início quando o span bruto for menor).
 */
export function activityWorkInterval(
  activity: Activity,
  options?: { applyMinimum?: boolean },
): TimeIntervalMs | null {
  if (activity.percentComplete < 100) return null;
  const { start, end } = activityTimelineBounds(activity);
  const startDate = parseActivityDate(start);
  const endDate = parseActivityDate(end);
  if (!startDate || !endDate) return null;

  let startMs = startDate.getTime();
  let endMs = endDate.getTime();
  if (endMs < startMs) return null;

  const applyMinimum = options?.applyMinimum !== false;
  const rawMinutes = Math.round((endMs - startMs) / 60_000);
  if (applyMinimum && rawMinutes < MIN_ACTIVITY_DURATION_MINUTES) {
    startMs = endMs - MIN_ACTIVITY_DURATION_MINUTES * 60_000;
  }

  return { startMs, endMs };
}

/**
 * Fatias da atividade por dia civil (inclui sábado e domingo).
 * Só conta 08:00–22:00; o intervalo 22:00→08:00 não gera tempo nem card vazio.
 */
export function activityDiarySlices(activity: Activity): DiaryActivitySlice[] {
  const completedInterval = activityWorkInterval(activity);

  if (completedInterval) {
    return expandToWorkDayIntervals(completedInterval).map((clipped) => ({
      activity,
      sliceStart: new Date(clipped.startMs).toISOString(),
      sliceEnd: new Date(clipped.endMs).toISOString(),
    }));
  }

  // Em andamento / sem intervalo útil: um único dia (criação), sem janela forçada.
  const { start, end } = activityTimelineBounds(activity);
  const startDate = parseActivityDate(start);
  const endDate = parseActivityDate(end);
  const startMs = startDate?.getTime() ?? Date.now();
  const endMs = Math.max(endDate?.getTime() ?? startMs, startMs);

  return [
    {
      activity,
      sliceStart: new Date(startMs).toISOString(),
      sliceEnd: new Date(endMs).toISOString(),
    },
  ];
}

/** União de intervalos sobrepostos → minutos de parede (tempo efetivo). */
export function mergeIntervalsMinutes(intervals: TimeIntervalMs[]): number {
  if (intervals.length === 0) return 0;

  const sorted = [...intervals].sort((a, b) => a.startMs - b.startMs);
  const merged: TimeIntervalMs[] = [{ ...sorted[0] }];

  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    if (current.startMs <= last.endMs) {
      last.endMs = Math.max(last.endMs, current.endMs);
    } else {
      merged.push({ ...current });
    }
  }

  return merged.reduce(
    (sum, interval) => sum + Math.round((interval.endMs - interval.startMs) / 60_000),
    0,
  );
}

/**
 * Tempo efetivo do dia: une tarefas simultâneas na janela 08:00–22:00.
 * Com `dateKey`, usa só a fatia útil daquele dia.
 */
export function sumCompletedDurationMinutes(
  activities: Activity[],
  dateKey?: string,
): number | null {
  const intervals: TimeIntervalMs[] = [];

  for (const activity of activities) {
    const full = activityWorkInterval(activity);
    if (!full) continue;
    if (dateKey) {
      const clipped = clipIntervalToWorkDay(full, dateKey);
      if (clipped) intervals.push(clipped);
    } else {
      intervals.push(...expandToWorkDayIntervals(full));
    }
  }

  if (intervals.length === 0) return null;

  const merged = mergeIntervalsMinutes(intervals);
  if (merged < 1) return null;
  return merged;
}

/** Rótulo do total do dia (tempo efetivo naquele dia civil). */
export function sumCompletedDurationLabel(
  activities: Activity[],
  dateKey?: string,
): string | null {
  const minutes = sumCompletedDurationMinutes(activities, dateKey);
  if (minutes == null) return null;
  return formatMinutesAsDuration(minutes);
}

export function formatTimeRangeWithDuration(
  start: string,
  end: string,
  options?: { applyMinimum?: boolean },
): {
  range: string;
  duration: string | null;
} {
  const applyMinimum = options?.applyMinimum !== false;
  const raw = activityDurationMinutesRaw(start, end);
  const durationMinutes = activityDurationMinutes(start, end, { applyMinimum });
  const duration = durationMinutes == null ? null : formatMinutesAsDuration(durationMinutes);

  // Intervalo curto (< 30 min): exibir fim − 30min → fim para bater com a duração assumida.
  if (applyMinimum && raw != null && raw < MIN_ACTIVITY_DURATION_MINUTES) {
    const endDate = parseActivityDate(end);
    if (endDate) {
      const adjustedStart = new Date(
        endDate.getTime() - MIN_ACTIVITY_DURATION_MINUTES * 60_000,
      ).toISOString();
      return {
        range: formatTimeRange(adjustedStart, end),
        duration,
      };
    }
  }

  const range = formatTimeRange(start, end);
  if (!duration) return { range, duration: null };
  return { range, duration };
}

/** Data civil usada no diário/filtros — criação real, não start/due sintético do Planner. */
export function activityDiaryDate(activity: Activity): string {
  return activity.createdAt || activity.startDate;
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
    const sliceKeys = activityDiarySlices(activity).map((slice) =>
      toDateKey(slice.sliceStart),
    );
    // Fallback se fatia vazia
    const dateKeys = sliceKeys.length > 0 ? sliceKeys : [toDateKey(activityDiaryDate(activity))];

    if (filter === "mine" && !activity.canEdit) return false;
    if (filter === "today" && !dateKeys.includes(todayKey)) return false;
    if (filter === "week" && !dateKeys.some((key) => isSameWeek(key, todayKey))) return false;
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
  const map = new Map<string, DiaryActivitySlice[]>();

  for (const activity of activities) {
    for (const slice of activityDiarySlices(activity)) {
      const key = toDateKey(slice.sliceStart);
      const list = map.get(key) ?? [];
      list.push(slice);
      map.set(key, list);
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, slices]) => ({
      dateKey,
      label: formatDiaryDateLabel(dateKey, todayKey),
      activities: slices.sort(
        (a, b) =>
          (parseActivityDate(a.sliceStart)?.getTime() ?? 0) -
          (parseActivityDate(b.sliceStart)?.getTime() ?? 0),
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
