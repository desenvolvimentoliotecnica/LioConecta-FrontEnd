import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  CreateWikiArticleRequest,
  UpdateWikiArticleRequest,
  WikiArticleDto,
  WikiArticleListItemDto,
  WikiArticleStatus,
  WikiCategoryDto,
} from "../types";
import { WIKI_ARTICLE_STATUS_DRAFT } from "../types";

export const WIKI_QUERY_KEY = ["wiki"] as const;

export type WikiArticlesParams = {
  q?: string;
  category?: string;
  status?: WikiArticleStatus;
  manage?: boolean;
};

function buildArticlesQuery(params: WikiArticlesParams = {}): string {
  const search = new URLSearchParams();
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.category?.trim()) search.set("category", params.category.trim());
  if (params.status !== undefined) search.set("status", String(params.status));
  if (params.manage) search.set("manage", "true");
  const qs = search.toString();
  return qs ? `/wiki/articles?${qs}` : "/wiki/articles";
}

export function useWikiArticles(params: WikiArticlesParams = {}) {
  return useQuery({
    queryKey: [...WIKI_QUERY_KEY, "articles", params],
    queryFn: async (): Promise<WikiArticleListItemDto[]> => {
      if (config.useMock) {
        return [];
      }
      return api.get<WikiArticleListItemDto[]>(buildArticlesQuery(params));
    },
    retry: config.useMock ? 0 : 1,
  });
}

export function useWikiCategories(manage = false) {
  return useQuery({
    queryKey: [...WIKI_QUERY_KEY, "categories", manage],
    queryFn: async (): Promise<WikiCategoryDto[]> => {
      if (config.useMock) {
        return [];
      }
      const qs = manage ? "?manage=true" : "";
      return api.get<WikiCategoryDto[]>(`/wiki/categories${qs}`);
    },
    retry: config.useMock ? 0 : 1,
  });
}

export function useWikiArticle(slug: string) {
  return useQuery({
    queryKey: [...WIKI_QUERY_KEY, "article", slug],
    queryFn: async (): Promise<WikiArticleDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      return api.get<WikiArticleDto>(`/wiki/articles/${encodeURIComponent(slug)}`);
    },
    enabled: Boolean(slug),
    retry: config.useMock ? 0 : 1,
  });
}

export function useCreateWikiArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateWikiArticleRequest): Promise<WikiArticleDto> => {
      if (config.useMock) {
        const now = new Date().toISOString();
        const id = crypto.randomUUID();
        const slug =
          body.slug?.trim() ||
          body.title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") ||
          id.slice(0, 8);
        return {
          id,
          slug,
          title: body.title,
          summary: body.summary ?? "",
          category: body.category,
          bodyHtml: body.bodyHtml,
          status: body.status ?? WIKI_ARTICLE_STATUS_DRAFT,
          createdAt: now,
          updatedAt: now,
          publishedAt: null,
          archivedAt: null,
          authorId: "mock",
          authorName: "Maria Silva",
          url: `/documentos/wiki/${slug}`,
        };
      }
      return api.post<WikiArticleDto>("/wiki/articles", body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WIKI_QUERY_KEY });
    },
  });
}

export function useUpdateWikiArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: UpdateWikiArticleRequest;
    }): Promise<WikiArticleDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      return api.patch<WikiArticleDto>(`/wiki/articles/${id}`, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WIKI_QUERY_KEY });
    },
  });
}

export function usePublishWikiArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<WikiArticleDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      return api.post<WikiArticleDto>(`/wiki/articles/${id}/publish`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WIKI_QUERY_KEY });
    },
  });
}

export function useArchiveWikiArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<WikiArticleDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      return api.post<WikiArticleDto>(`/wiki/articles/${id}/archive`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WIKI_QUERY_KEY });
    },
  });
}
