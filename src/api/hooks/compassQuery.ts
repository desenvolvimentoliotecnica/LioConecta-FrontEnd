import type { CompassAggregateGroupBy } from "../types";
import type { CompassFilters } from "../../config/compass/types";

export function compassFiltersToParams(
  filters: CompassFilters,
  extra?: Record<string, string | number | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.diretoria) params.set("diretoria", filters.diretoria);
  if (filters.unidade) params.set("unidade", filters.unidade);
  if (filters.familia) params.set("familia", filters.familia);
  if (filters.tipo) params.set("tipo", filters.tipo);
  if (filters.search?.trim()) params.set("search", filters.search.trim());

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value !== undefined && value !== "") params.set(key, String(value));
    }
  }

  return params;
}

export function compassFiltersQueryKey(filters: CompassFilters, suffix: string[] = []): unknown[] {
  return [
    "compass",
    ...suffix,
    filters.diretoria ?? "",
    filters.unidade ?? "",
    filters.familia ?? "",
    filters.tipo ?? "",
    filters.search ?? "",
  ];
}

export type CompassQueryResult<T> = {
  data: T;
  isLoading: boolean;
  isError: boolean;
  isFallback: boolean;
};

export function aggregateGroupByLabel(groupBy: CompassAggregateGroupBy): string {
  const labels: Record<CompassAggregateGroupBy, string> = {
    diretoria: "Diretoria",
    familia: "Família",
    tipo: "Tipo",
    unidade: "Unidade",
    matriz: "Matriz",
  };
  return labels[groupBy];
}
