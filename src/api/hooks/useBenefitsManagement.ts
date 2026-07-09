import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  AssignBenefitFromCatalogRequest,
  BenefitCatalogItemDto,
  BenefitEmployeeDetailDto,
  BenefitManagementListItemDto,
  BenefitsBootstrapDto,
  BulkAssignBenefitsRequest,
  BulkBenefitPreviewDto,
  BulkBenefitOperationResultDto,
  BulkSetActiveBenefitsRequest,
  BulkBenefitTargetRequest,
  UpsertBenefitCatalogRequest,
  UpsertEmployeeBenefitRequest,
} from "../types";
import { BENEFITS_QUERY_KEY } from "./useBenefits";

export const BENEFITS_MANAGEMENT_QUERY_KEY = ["benefits", "management"] as const;

export function useBenefitsBootstrap() {
  return useQuery({
    queryKey: [...BENEFITS_MANAGEMENT_QUERY_KEY, "bootstrap"],
    queryFn: () => api.get<BenefitsBootstrapDto>("/rh/benefits/bootstrap"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useBenefitCatalogList(params: {
  q?: string;
  category?: string;
  includeInactive?: boolean;
}) {
  return useQuery({
    queryKey: [...BENEFITS_MANAGEMENT_QUERY_KEY, "catalog", params],
    queryFn: () => {
      const search = new URLSearchParams();
      if (params.q?.trim()) search.set("q", params.q.trim());
      if (params.category && params.category !== "all") search.set("category", params.category);
      if (params.includeInactive) search.set("includeInactive", "true");
      const qs = search.toString();
      return api.get<BenefitCatalogItemDto[]>(`/rh/benefits/catalog${qs ? `?${qs}` : ""}`);
    },
    retry: config.useMock ? 0 : 1,
  });
}

export function useBenefitManagementList(params: {
  personId?: string;
  departmentId?: string;
  catalogKey?: string;
  q?: string;
  category?: string;
  includeInactive?: boolean;
}) {
  return useQuery({
    queryKey: [...BENEFITS_MANAGEMENT_QUERY_KEY, "list", params],
    queryFn: () => {
      const search = new URLSearchParams();
      if (params.personId) search.set("personId", params.personId);
      if (params.departmentId && params.departmentId !== "all") search.set("departmentId", params.departmentId);
      if (params.catalogKey) search.set("catalogKey", params.catalogKey);
      if (params.q?.trim()) search.set("q", params.q.trim());
      if (params.category && params.category !== "all") search.set("category", params.category);
      if (params.includeInactive) search.set("includeInactive", "true");
      const qs = search.toString();
      return api.get<BenefitManagementListItemDto[]>(`/rh/benefits/management${qs ? `?${qs}` : ""}`);
    },
    retry: config.useMock ? 0 : 1,
  });
}

export function useBenefitManagementDetail(id?: string | null) {
  return useQuery({
    queryKey: [...BENEFITS_MANAGEMENT_QUERY_KEY, "detail", id],
    queryFn: () => api.get<BenefitEmployeeDetailDto>(`/rh/benefits/management/${id}`),
    enabled: Boolean(id),
    retry: config.useMock ? 0 : 1,
  });
}

export function useBenefitBulkPreview(params: {
  operation: string;
  catalogKey?: string;
  onDuplicate?: string;
  target: BulkBenefitTargetRequest;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: [...BENEFITS_MANAGEMENT_QUERY_KEY, "preview", params],
    queryFn: () => {
      const search = new URLSearchParams();
      search.set("operation", params.operation);
      if (params.catalogKey) search.set("catalogKey", params.catalogKey);
      if (params.onDuplicate) search.set("onDuplicate", params.onDuplicate);
      for (const id of params.target.personIds ?? []) search.append("personIds", id);
      for (const id of params.target.departmentIds ?? []) search.append("departmentIds", id);
      for (const id of params.target.excludePersonIds ?? []) search.append("excludePersonIds", id);
      return api.get<BulkBenefitPreviewDto>(`/rh/benefits/management/bulk-preview?${search.toString()}`);
    },
    enabled: params.enabled ?? true,
    retry: config.useMock ? 0 : 1,
  });
}

function invalidateManagement(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: BENEFITS_MANAGEMENT_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: BENEFITS_QUERY_KEY });
}

export function useCreateBenefitCatalogItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertBenefitCatalogRequest) =>
      api.post<BenefitCatalogItemDto>("/rh/benefits/catalog", body),
    onSuccess: () => invalidateManagement(queryClient),
  });
}

export function useUpdateBenefitCatalogItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpsertBenefitCatalogRequest }) =>
      api.put<BenefitCatalogItemDto>(`/rh/benefits/catalog/${id}`, body),
    onSuccess: () => invalidateManagement(queryClient),
  });
}

export function useDeleteBenefitCatalogItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/rh/benefits/catalog/${id}`),
    onSuccess: () => invalidateManagement(queryClient),
  });
}

export function useCreateEmployeeBenefit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertEmployeeBenefitRequest) =>
      api.post<BenefitEmployeeDetailDto>("/rh/benefits/management", body),
    onSuccess: () => invalidateManagement(queryClient),
  });
}

export function useUpdateEmployeeBenefit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpsertEmployeeBenefitRequest }) =>
      api.put<BenefitEmployeeDetailDto>(`/rh/benefits/management/${id}`, body),
    onSuccess: () => invalidateManagement(queryClient),
  });
}

export function useDeleteEmployeeBenefit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/rh/benefits/management/${id}`),
    onSuccess: () => invalidateManagement(queryClient),
  });
}

export function useAssignBenefitFromCatalog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AssignBenefitFromCatalogRequest) =>
      api.post<BenefitEmployeeDetailDto>("/rh/benefits/management/from-catalog", body),
    onSuccess: () => invalidateManagement(queryClient),
  });
}

export function useBulkAssignBenefits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BulkAssignBenefitsRequest) =>
      api.post<BulkBenefitOperationResultDto>("/rh/benefits/management/bulk-from-catalog", body),
    onSuccess: () => invalidateManagement(queryClient),
  });
}

export function useBulkSetActiveBenefits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BulkSetActiveBenefitsRequest) =>
      api.post<BulkBenefitOperationResultDto>("/rh/benefits/management/bulk-set-active", body),
    onSuccess: () => invalidateManagement(queryClient),
  });
}
