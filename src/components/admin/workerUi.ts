/** Shared status/format helpers for Workers admin UI. */

export function normalizeStatus(status?: string | null): string {
  return (status ?? "").trim().toLowerCase();
}

export function isWorkerRunningStatus(status?: string | null): boolean {
  const s = normalizeStatus(status);
  return s === "running" || s === "inprogress" || s === "in_progress";
}

export function isSuccessStatus(status?: string | null): boolean {
  const s = normalizeStatus(status);
  return s === "succeeded" || s === "success";
}

export function isFailedStatus(status?: string | null): boolean {
  const s = normalizeStatus(status);
  return s === "failed" || s === "error" || s === "partialfailure" || s === "partial_failure";
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

export function formatDuration(startedAtUtc?: string | null, finishedAtUtc?: string | null): string {
  if (!startedAtUtc) return "—";
  const start = new Date(startedAtUtc).getTime();
  if (Number.isNaN(start)) return "—";
  const end = finishedAtUtc ? new Date(finishedAtUtc).getTime() : Date.now();
  if (Number.isNaN(end) || end < start) return "—";

  const totalSec = Math.floor((end - start) / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  if (minutes < 60) return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  return remMin > 0 ? `${hours}h ${remMin}m` : `${hours}h`;
}

export function statusLabel(status?: string | null): string {
  const s = normalizeStatus(status);
  if (s === "running") return "Em execução";
  if (s === "succeeded" || s === "success") return "Sucesso";
  if (s === "failed" || s === "error") return "Falhou";
  if (s === "partialfailure" || s === "partial_failure") return "Parcial";
  return status || "—";
}

export function statusTone(status?: string | null): string {
  if (isSuccessStatus(status)) return "workers-status--success";
  if (isWorkerRunningStatus(status)) return "workers-status--running";
  if (normalizeStatus(status) === "partialfailure" || normalizeStatus(status) === "partial_failure") {
    return "workers-status--warning";
  }
  if (isFailedStatus(status)) return "workers-status--danger";
  return "workers-status--neutral";
}

export function triggerLabel(trigger?: string | null): string {
  const t = (trigger ?? "").trim().toLowerCase();
  if (t === "scheduled") return "Agendado";
  if (t === "manual") return "Manual";
  return trigger || "—";
}

export function triggerTone(trigger?: string | null): string {
  const t = (trigger ?? "").trim().toLowerCase();
  if (t === "manual") return "workers-status--running";
  if (t === "scheduled") return "workers-status--neutral";
  return "workers-status--neutral";
}
