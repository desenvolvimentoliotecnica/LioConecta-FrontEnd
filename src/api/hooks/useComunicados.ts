import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  ComunicadoDto,
  ComunicadoKind,
  ComunicadoListItemDto,
  CreateComunicadoRequest,
  PagedResult,
} from "../types";

export const COMUNICADOS_QUERY_KEY = ["comunicados"] as const;

const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isComunicadoGuid(id: string): boolean {
  return GUID_PATTERN.test(id);
}

export function useComunicadosList(kind: ComunicadoKind, limit = 50) {
  return useQuery({
    queryKey: [...COMUNICADOS_QUERY_KEY, "list", kind, limit],
    queryFn: async (): Promise<PagedResult<ComunicadoListItemDto>> => {
      if (config.useMock) {
        return { items: [], hasMore: false };
      }
      return api.get<PagedResult<ComunicadoListItemDto>>(`/comunicados?kind=${kind}&limit=${limit}`);
    },
    retry: config.useMock ? 0 : 1,
  });
}

async function fetchAllArchivedComunicados(): Promise<ComunicadoListItemDto[]> {
  const all: ComunicadoListItemDto[] = [];
  let cursor: string | null | undefined;
  const limit = 100;

  do {
    const params = new URLSearchParams({ archived: "true", limit: String(limit) });
    if (cursor) {
      params.set("cursor", cursor);
    }
    const page = await api.get<PagedResult<ComunicadoListItemDto>>(`/comunicados?${params}`);
    all.push(...page.items);
    cursor = page.hasMore ? (page.nextCursor ?? undefined) : undefined;
  } while (cursor && all.length < 500);

  return all;
}

export function useComunicadosArchivedList() {
  return useQuery({
    queryKey: [...COMUNICADOS_QUERY_KEY, "list", "archived"],
    queryFn: async (): Promise<ComunicadoListItemDto[]> => {
      if (config.useMock) {
        return [];
      }
      return fetchAllArchivedComunicados();
    },
    retry: config.useMock ? 0 : 1,
  });
}

export function useComunicado(id: string) {
  const isGuid = isComunicadoGuid(id);

  return useQuery({
    queryKey: [...COMUNICADOS_QUERY_KEY, isGuid ? "id" : "slug", id],
    queryFn: async (): Promise<ComunicadoDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      const path = isGuid ? `/comunicados/${id}` : `/comunicados/slug/${encodeURIComponent(id)}`;
      return api.get<ComunicadoDto>(path);
    },
    enabled: Boolean(id),
    retry: config.useMock ? 0 : 1,
  });
}

export function useCreateComunicado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateComunicadoRequest): Promise<ComunicadoDto> => {
      if (config.useMock) {
        return {
          id: crypto.randomUUID(),
          slug: null,
          kind: body.kind,
          title: body.title,
          excerpt: body.excerpt,
          content: body.content ?? {},
          author: {
            id: "mock",
            slug: "maria-silva",
            name: "Maria Silva",
            photoUrl: "/avatar-maria-silva.png",
            isActive: true,
          },
          heroImageUrl: body.heroImageUrl,
          isMandatory: body.isMandatory,
          publishedAt: body.publishedAt ?? new Date().toISOString(),
          isReadByViewer: false,
        };
      }
      return api.post<ComunicadoDto>("/comunicados", body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: COMUNICADOS_QUERY_KEY });
    },
  });
}
