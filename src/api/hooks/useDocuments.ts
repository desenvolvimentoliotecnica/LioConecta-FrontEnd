import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import type { DocumentDto } from "../types";

export const DOCUMENTS_QUERY_KEY = ["documents"] as const;

export function useDocuments(category?: string) {
  return useQuery({
    queryKey: [...DOCUMENTS_QUERY_KEY, category ?? "all"] as const,
    queryFn: () => {
      const query = category ? `?category=${encodeURIComponent(category)}` : "";
      return api.get<DocumentDto[]>(`/documents${query}`);
    },
    retry: config.useMock ? 0 : 1,
  });
}
