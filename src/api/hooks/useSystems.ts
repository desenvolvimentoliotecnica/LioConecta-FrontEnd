import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  PortalSystemDto,
  SystemsBootstrapDto,
  UploadSystemIconResponseDto,
  UpsertPortalSystemRequest,
} from "../types";

export const SYSTEMS_BOOTSTRAP_QUERY_KEY = ["systems", "bootstrap"] as const;
export const SYSTEMS_LIST_QUERY_KEY = ["systems", "list"] as const;

export type SystemsListParams = {
  q?: string;
  category?: string;
  includeInactive?: boolean;
};

function listQueryKey(params: SystemsListParams) {
  return [
    ...SYSTEMS_LIST_QUERY_KEY,
    params.q ?? "",
    params.category ?? "",
    params.includeInactive ?? false,
  ] as const;
}

export function useSystemsBootstrap() {
  return useQuery({
    queryKey: SYSTEMS_BOOTSTRAP_QUERY_KEY,
    queryFn: () => api.get<SystemsBootstrapDto>("/systems/bootstrap"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useSystems(params: SystemsListParams) {
  const search = new URLSearchParams();
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.category?.trim()) search.set("category", params.category.trim());
  if (params.includeInactive) search.set("includeInactive", "true");

  const qs = search.toString();

  return useQuery({
    queryKey: listQueryKey(params),
    queryFn: () => api.get<PortalSystemDto[]>(`/systems${qs ? `?${qs}` : ""}`),
    retry: config.useMock ? 0 : 1,
  });
}

function invalidateSystems(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: SYSTEMS_BOOTSTRAP_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: SYSTEMS_LIST_QUERY_KEY });
}

export function useCreateSystem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertPortalSystemRequest) => api.post<PortalSystemDto>("/systems", body),
    onSuccess: () => invalidateSystems(queryClient),
  });
}

export function useUpdateSystem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpsertPortalSystemRequest }) =>
      api.put<PortalSystemDto>(`/systems/${id}`, body),
    onSuccess: () => invalidateSystems(queryClient),
  });
}

export function useDeleteSystem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/systems/${id}`),
    onSuccess: () => invalidateSystems(queryClient),
  });
}

export function useRecordSystemClick() {
  return useMutation({
    mutationFn: (id: string) => api.post<void>(`/systems/${id}/click`),
    retry: 0,
  });
}

export function useUploadSystemIcon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.upload<UploadSystemIconResponseDto>(`/systems/${id}/icon`, formData);
    },
    onSuccess: () => invalidateSystems(queryClient),
  });
}
