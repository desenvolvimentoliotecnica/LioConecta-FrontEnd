import type { UniLioFilters } from "../../config/unilio/types";

export function unilioFiltersToParams(
  filters: UniLioFilters,
  extra?: Record<string, string | number | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.area) params.set("area", filters.area);
  if (filters.department) params.set("department", filters.department);
  if (filters.contentType) params.set("contentType", filters.contentType);
  if (filters.status) params.set("status", filters.status);
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.period) params.set("period", filters.period);
  if (filters.page != null) params.set("page", String(filters.page));
  if (filters.pageSize != null) params.set("pageSize", String(filters.pageSize));

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value !== undefined && value !== "") params.set(key, String(value));
    }
  }

  return params;
}

export function unilioFiltersQueryKey(filters: UniLioFilters, suffix: string[] = []): unknown[] {
  return [
    "unilio",
    ...suffix,
    filters.area ?? "",
    filters.department ?? "",
    filters.contentType ?? "",
    filters.status ?? "",
    filters.search ?? "",
    filters.period ?? "",
    filters.page ?? 1,
    filters.pageSize ?? 20,
  ];
}

export type UniLioQueryResult<T> = {
  data: T;
  isLoading: boolean;
  isError: boolean;
  isFallback: boolean;
};
