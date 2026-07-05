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
