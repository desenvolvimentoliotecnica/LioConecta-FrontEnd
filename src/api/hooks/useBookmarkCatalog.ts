import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import type { BookmarkCatalogItemDto } from "../types";

export const BOOKMARK_CATALOG_QUERY_KEY = ["bookmarks", "catalog"] as const;

export function useBookmarkCatalog() {
  return useQuery({
    queryKey: BOOKMARK_CATALOG_QUERY_KEY,
    queryFn: () => api.get<BookmarkCatalogItemDto[]>("/bookmarks/catalog"),
    retry: config.useMock ? 0 : 1,
  });
}
