import type { PayslipListItemDto } from "../api/types";

const FOLHA = "FOLHA";

function isFolha(item: PayslipListItemDto) {
  return !item.paymentType || item.paymentType === FOLHA;
}

/** Competências FOLHA distintas (mais recente primeiro). */
export function pickDistinctFolhaMonths(history: PayslipListItemDto[]) {
  const seen = new Set<string>();
  const result: PayslipListItemDto[] = [];

  for (const item of history) {
    if (!isFolha(item)) {
      continue;
    }

    const key = `${item.year}-${item.month}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
}

export function pickComparativoPeriods(history: PayslipListItemDto[]) {
  const distinct = pickDistinctFolhaMonths(history);
  return {
    to: distinct[0] ?? null,
    from: distinct[1] ?? null,
  };
}

/** Ano do informe: ano anterior, exceto se admissão foi no ano corrente. */
export function resolveInformeYear(hiredYear?: number | null) {
  const currentYear = new Date().getFullYear();
  if (hiredYear && hiredYear >= currentYear) {
    return currentYear;
  }

  return currentYear - 1;
}

export function formatPaymentTypeLabel(paymentType?: string) {
  if (!paymentType || paymentType === FOLHA) {
    return "Folha mensal";
  }

  if (paymentType === "ADIANTAMENTO") {
    return "Adiantamento";
  }

  return paymentType;
}
