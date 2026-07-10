import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import { getStoredToken } from "./useAuth";
import type {
  DbColumnDto,
  DbConnectionDto,
  DbDerLayoutDto,
  DbQueryHistoryEntryDto,
  DbRowsPageDto,
  DbSavedQueryDto,
  DbSchemaDto,
  DbSchemaGraphDto,
  DbTableDto,
  ExecuteQueryRequest,
  ExecuteQueryResponse,
  PagedDbQueryHistoryDto,
  UpsertSavedQueryRequest,
} from "../types/dbExplorer";

const BASE = ["admin", "db-explorer"] as const;

function qs(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}

export function useDbConnections() {
  return useQuery({
    queryKey: [...BASE, "connections"],
    queryFn: () => api.get<DbConnectionDto[]>("/admin/db-explorer/connections"),
    enabled: !config.useMock,
  });
}

export function useDbSchemas(connectionId: string) {
  return useQuery({
    queryKey: [...BASE, "schemas", connectionId],
    queryFn: () => api.get<DbSchemaDto[]>(`/admin/db-explorer/${connectionId}/schemas`),
    enabled: !config.useMock && Boolean(connectionId),
  });
}

export function useDbTables(connectionId: string, schema: string) {
  return useQuery({
    queryKey: [...BASE, "tables", connectionId, schema],
    queryFn: () => api.get<DbTableDto[]>(`/admin/db-explorer/${connectionId}/tables${qs({ schema })}`),
    enabled: !config.useMock && Boolean(connectionId && schema),
  });
}

export function useDbColumns(connectionId: string, schema: string, table: string) {
  return useQuery({
    queryKey: [...BASE, "columns", connectionId, schema, table],
    queryFn: () =>
      api.get<DbColumnDto[]>(`/admin/db-explorer/${connectionId}/tables/${schema}/${table}/columns`),
    enabled: !config.useMock && Boolean(connectionId && schema && table),
  });
}

export function useDbRows(
  connectionId: string,
  schema: string,
  table: string,
  page: number,
  pageSize: number,
  search?: string,
) {
  return useQuery({
    queryKey: [...BASE, "rows", connectionId, schema, table, page, pageSize, search],
    queryFn: () =>
      api.get<DbRowsPageDto>(
        `/admin/db-explorer/${connectionId}/tables/${schema}/${table}/rows${qs({ page, pageSize, search })}`,
      ),
    enabled: !config.useMock && Boolean(connectionId && schema && table),
  });
}

export function useExecuteDbQuery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      connectionId,
      request,
    }: {
      connectionId: string;
      request: ExecuteQueryRequest;
    }) => api.post<ExecuteQueryResponse>(`/admin/db-explorer/${connectionId}/query`, request),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...BASE, "history"] });
    },
  });
}

export function useDbQueryHistory(page: number, pageSize = 25, enabled = true) {
  return useQuery({
    queryKey: [...BASE, "history", page, pageSize],
    queryFn: () => api.get<PagedDbQueryHistoryDto>(`/admin/db-explorer/query-history${qs({ page, pageSize })}`),
    enabled: !config.useMock && enabled,
  });
}

export function useDbSavedQueries(enabled = true) {
  return useQuery({
    queryKey: [...BASE, "saved"],
    queryFn: () => api.get<DbSavedQueryDto[]>("/admin/db-explorer/saved-queries"),
    enabled: !config.useMock && enabled,
  });
}

export function useSaveDbQuery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (request: UpsertSavedQueryRequest) =>
      api.post<DbSavedQueryDto>("/admin/db-explorer/saved-queries", request),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...BASE, "saved"] }),
  });
}

export function useUpdateDbSavedQuery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpsertSavedQueryRequest }) =>
      api.put<DbSavedQueryDto>(`/admin/db-explorer/saved-queries/${id}`, request),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...BASE, "saved"] }),
  });
}

export function useDeleteDbSavedQuery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/db-explorer/saved-queries/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...BASE, "saved"] }),
  });
}

export function usePromoteHistoryToSaved() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      historyId,
      name,
      description,
    }: {
      historyId: string;
      name: string;
      description?: string;
    }) =>
      api.post<DbSavedQueryDto>(`/admin/db-explorer/saved-queries/from-history/${historyId}`, {
        name,
        description,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...BASE, "saved"] });
    },
  });
}

export function useDbSchemaGraph(connectionId: string, schemas?: string[]) {
  return useQuery({
    queryKey: [...BASE, "graph", connectionId, schemas?.join(",")],
    queryFn: () =>
      api.get<DbSchemaGraphDto>(
        `/admin/db-explorer/${connectionId}/schema-graph${qs({ schemas: schemas?.join(",") })}`,
      ),
    enabled: !config.useMock && Boolean(connectionId),
  });
}

export function useDbDerLayout(connectionId: string) {
  return useQuery({
    queryKey: [...BASE, "der-layout", connectionId],
    queryFn: async () => {
      try {
        return await api.get<DbDerLayoutDto>(`/admin/db-explorer/der-layouts/${connectionId}`);
      } catch (err) {
        if (err instanceof Error && /404|não encontrad|not found/i.test(err.message)) {
          return null;
        }
        return null;
      }
    },
    enabled: !config.useMock && Boolean(connectionId),
    retry: false,
  });
}

export function useSaveDbDerLayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ connectionId, layoutJson }: { connectionId: string; layoutJson: string }) =>
      api.put<DbDerLayoutDto>(`/admin/db-explorer/der-layouts/${connectionId}`, { layoutJson }),
    onSuccess: (_data, vars) =>
      void qc.invalidateQueries({ queryKey: [...BASE, "der-layout", vars.connectionId] }),
  });
}

export function useDeleteDbDerLayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (connectionId: string) => api.delete(`/admin/db-explorer/der-layouts/${connectionId}`),
    onSuccess: (_data, connectionId) =>
      void qc.invalidateQueries({ queryKey: [...BASE, "der-layout", connectionId] }),
  });
}

export async function exportDbQueryCsv(connectionId: string, request: ExecuteQueryRequest): Promise<Blob> {
  if (config.useMock) throw new Error("Mock mode");
  const token = getStoredToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${config.apiBaseUrl}/admin/db-explorer/${connectionId}/query/export`, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error("Falha ao exportar CSV");
  return response.blob();
}

export type { DbQueryHistoryEntryDto };
