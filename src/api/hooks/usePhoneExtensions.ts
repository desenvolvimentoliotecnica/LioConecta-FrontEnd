import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  PhoneExtensionDto,
  PhoneExtensionsBootstrapDto,
  PersonSummaryDto,
  UpsertPhoneExtensionRequest,
} from "../types";

export const RAMAIS_BOOTSTRAP_QUERY_KEY = ["ramais", "bootstrap"] as const;
export const RAMAIS_LIST_QUERY_KEY = ["ramais", "list"] as const;
export const PEOPLE_SEARCH_QUERY_KEY = ["people", "search"] as const;

export type PhoneExtensionsListParams = {
  q?: string;
  department?: string;
  personLinked?: boolean;
  includeInactive?: boolean;
};

function listQueryKey(params: PhoneExtensionsListParams) {
  return [
    ...RAMAIS_LIST_QUERY_KEY,
    params.q ?? "",
    params.department ?? "",
    params.personLinked ?? "",
    params.includeInactive ?? false,
  ] as const;
}

export function usePhoneExtensionsBootstrap() {
  return useQuery({
    queryKey: RAMAIS_BOOTSTRAP_QUERY_KEY,
    queryFn: () => api.get<PhoneExtensionsBootstrapDto>("/ramais/bootstrap"),
    retry: config.useMock ? 0 : 1,
  });
}

export function usePhoneExtensions(params: PhoneExtensionsListParams) {
  const search = new URLSearchParams();
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.department?.trim()) search.set("department", params.department.trim());
  if (params.personLinked !== undefined) search.set("personLinked", String(params.personLinked));
  if (params.includeInactive) search.set("includeInactive", "true");

  const qs = search.toString();

  return useQuery({
    queryKey: listQueryKey(params),
    queryFn: () => api.get<PhoneExtensionDto[]>(`/ramais${qs ? `?${qs}` : ""}`),
    retry: config.useMock ? 0 : 1,
  });
}

export function usePeopleSearch(q: string, enabled = true) {
  const term = q.trim();
  return useQuery({
    queryKey: [...PEOPLE_SEARCH_QUERY_KEY, term] as const,
    queryFn: () =>
      api.get<PersonSummaryDto[]>(`/people?limit=8&q=${encodeURIComponent(term)}`),
    enabled: enabled && term.length >= 2,
    retry: 0,
  });
}

function invalidateRamais(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: RAMAIS_BOOTSTRAP_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: RAMAIS_LIST_QUERY_KEY });
}

export function useCreatePhoneExtension() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertPhoneExtensionRequest) =>
      api.post<PhoneExtensionDto>("/ramais", body),
    onSuccess: () => invalidateRamais(queryClient),
  });
}

export function useUpdatePhoneExtension() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpsertPhoneExtensionRequest }) =>
      api.put<PhoneExtensionDto>(`/ramais/${id}`, body),
    onSuccess: () => invalidateRamais(queryClient),
  });
}

export function useDeletePhoneExtension() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/ramais/${id}`),
    onSuccess: () => invalidateRamais(queryClient),
  });
}
