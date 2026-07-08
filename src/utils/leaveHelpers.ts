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
    return "Você não possui saldo de férias disponível.";
  }

  const days = input.days ?? countInclusiveDays(input.startDate, input.endDate);
  if (days > input.availableDays) {
    return `Saldo insuficiente: ${days} dia(s) solicitado(s), ${input.availableDays} disponível(is).`;
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
