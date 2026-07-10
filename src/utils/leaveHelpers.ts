export function countInclusiveDays(startIso: string, endIso: string): number {
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  if (!start || !end) return 0;
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / 86_400_000) + 1;
}

export function validateVacationForm(input: {
  startDate: string;
  endDate: string;
  availableDays: number;
  acquiringDays?: number;
  nextLiberationAt?: string | null;
  days?: number;
}): string | null {
  if (!input.startDate || !input.endDate) {
    return "Informe data início e fim.";
  }

  const start = parseIsoDate(input.startDate);
  const end = parseIsoDate(input.endDate);
  if (!start || !end) {
    return "Datas inválidas.";
  }

  if (end < start) {
    return "A data fim deve ser igual ou posterior à data início.";
  }

  if (input.availableDays <= 0) {
    if ((input.acquiringDays ?? 0) > 0) {
      const liberacao = input.nextLiberationAt
        ? new Date(input.nextLiberationAt).toLocaleDateString("pt-BR")
        : null;
      return liberacao
        ? `Você ainda não possui dias liberados para gozo. Há ${input.acquiringDays} dia(s) em aquisição (liberação a partir de ${liberacao}).`
        : `Você ainda não possui dias liberados para gozo. Há ${input.acquiringDays} dia(s) em aquisição.`;
    }
    return "Você não possui saldo de férias liberado para solicitação.";
  }

  const days = input.days ?? countInclusiveDays(input.startDate, input.endDate);
  if (days > input.availableDays) {
    return `Saldo insuficiente: ${days} dia(s) solicitado(s), ${input.availableDays} liberado(s) para gozo.`;
  }

  return null;
}

function parseIsoDate(value: string): Date | null {
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export const LEAVE_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  completed: "Concluído",
  rejected: "Rejeitado",
};

export function leaveStatusLabel(status: string): string {
  return LEAVE_STATUS_LABELS[status] ?? status;
}

/** Linha do tempo: evento mais novo → mais antigo. */
export function sortLeaveTimelineNewestFirst<T extends { occurredAt: string }>(events: T[]): T[] {
  return [...events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}

export type LeaveRequestKind = "ferias" | "licenca" | "afastamento" | "consulta" | "banco" | "outro";

/** Infere o tipo da solicitação a partir do título (lista de gestão não traz category). */
export function leaveRequestKindFromTitle(title: string): LeaveRequestKind {
  const lower = title.toLowerCase();
  if (lower.includes("férias") || lower.includes("ferias")) return "ferias";
  if (lower.includes("licença") || lower.includes("licenca") || lower.includes("maternidade") || lower.includes("paternidade")) {
    return "licenca";
  }
  if (
    lower.includes("atestado") ||
    lower.includes("afastamento") ||
    lower.includes("médico") ||
    lower.includes("medico")
  ) {
    return "afastamento";
  }
  if (lower.includes("banco") || lower.includes("hora")) return "banco";
  if (lower.includes("consulta") || lower.includes("histórico") || lower.includes("historico") || lower.includes("saldo")) {
    return "consulta";
  }
  return "outro";
}

const LEAVE_KIND_ICONS: Record<LeaveRequestKind, string> = {
  ferias: "fa-umbrella-beach",
  licenca: "fa-baby",
  afastamento: "fa-briefcase-medical",
  consulta: "fa-clock-rotate-left",
  banco: "fa-hourglass-half",
  outro: "fa-calendar-days",
};

export function leaveRequestIconClass(title: string): string {
  return LEAVE_KIND_ICONS[leaveRequestKindFromTitle(title)];
}
