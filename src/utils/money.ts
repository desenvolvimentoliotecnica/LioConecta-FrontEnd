const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatMoney(value: number, showValues: boolean): string {
  if (!showValues) {
    return "••••••";
  }

  return moneyFormatter.format(value);
}

export function bookmarkIdForService(serviceId: string): string {
  return `bm-contracheque-${serviceId}`;
}

export function bookmarkIdForBenefit(benefitId: string): string {
  return `bm-beneficios-${benefitId}`;
}

export function bookmarkIdForLeave(serviceId: string): string {
  return `bm-ferias-${serviceId}`;
}

export function bookmarkIdForHelpDesk(serviceId: string): string {
  return `bm-help-desk-${serviceId}`;
}

export function formatSensitiveCount(value: number | string, showValues: boolean): string {
  if (!showValues) {
    return "•••";
  }
  return String(value);
}

export function formatHours(value: number, showValues: boolean): string {
  if (!showValues) {
    return "••••";
  }
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}h`;
}
