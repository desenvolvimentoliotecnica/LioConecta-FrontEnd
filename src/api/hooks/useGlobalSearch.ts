import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import type { GlobalSearchContentType, GlobalSearchResultDto } from "../types";

export const GLOBAL_SEARCH_QUERY_KEY = ["global-search"] as const;

const API_TYPES = new Set<GlobalSearchContentType>([
  "people",
  "documents",
  "comunicados",
  "groups",
  "systems",
  "feed",
  "unilio",
  "ramais",
  "knowledge",
  "calendar",
  "bookmarks",
]);

export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function buildSearchQuery(
  q: string,
  limit: number,
  types?: readonly GlobalSearchContentType[],
): string {
  const params = new URLSearchParams();
  params.set("q", q);
  params.set("limit", String(limit));
  if (types && types.length > 0) {
    const apiTypes = types.filter((t) => t !== "pages" && API_TYPES.has(t));
    if (apiTypes.length > 0) {
      params.set("types", apiTypes.join(","));
    }
  }
  return params.toString();
}

export function useGlobalSearch(
  q: string,
  options?: {
    limit?: number;
    types?: readonly GlobalSearchContentType[];
    enabled?: boolean;
  },
) {
  const term = q.trim();
  const limit = options?.limit ?? 8;
  const enabled = (options?.enabled ?? true) && term.length >= 2;
  const typesKey = options?.types?.slice().sort().join(",") ?? "";

  return useQuery({
    queryKey: [...GLOBAL_SEARCH_QUERY_KEY, term, limit, typesKey] as const,
    queryFn: () =>
      api.get<GlobalSearchResultDto>(
        `/search?${buildSearchQuery(term, limit, options?.types)}`,
      ),
    enabled,
    retry: 0,
    placeholderData: (previous) => previous,
  });
}
