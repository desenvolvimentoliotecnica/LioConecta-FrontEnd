import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  GovernedOrgChartDto,
  ImportFromGraphRequest,
  ImportFromGraphResultDto,
  ImportDepartmentsFromDirectoryRequest,
  ImportDepartmentsFromDirectoryResultDto,
  OrgDepartmentMappingDto,
  UpsertOrgDepartmentMappingRequest,
  OrgChartGovernanceSummaryDto,
  OrgChartPolicyDto,
  OrgDepartmentDto,
  OrgPositionDto,
  UpsertOrgDepartmentRequest,
  UpsertOrgPositionRequest,
  CreateOrgPositionRequest,
} from "../types";
import { ORG_CHART_SETTINGS_QUERY_KEY } from "./useOrgChartSettings";

export const ORG_CHART_POLICY_QUERY_KEY = ["org-chart", "policy"] as const;
export const ORG_CHART_SUMMARY_QUERY_KEY = ["admin", "org-chart", "summary"] as const;
export const ORG_CHART_POSITIONS_QUERY_KEY = ["org-chart", "positions"] as const;
export const ORG_CHART_DEPARTMENTS_QUERY_KEY = ["org-chart", "departments"] as const;
export const ORG_CHART_DEPARTMENT_MAPPINGS_QUERY_KEY = ["admin", "org-chart", "department-mappings"] as const;
export const ORG_CHART_CHART_QUERY_KEY = ["org-chart", "chart"] as const;

export function useOrgChartPolicy() {
  return useQuery({
    queryKey: ORG_CHART_POLICY_QUERY_KEY,
    queryFn: () => api.get<OrgChartPolicyDto>("/org-chart/policy"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useGovernedOrgChart() {
  return useQuery({
    queryKey: ORG_CHART_CHART_QUERY_KEY,
    queryFn: () => api.get<GovernedOrgChartDto>("/org-chart"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useOrgChartGovernanceSummary() {
  return useQuery({
    queryKey: ORG_CHART_SUMMARY_QUERY_KEY,
    queryFn: () => api.get<OrgChartGovernanceSummaryDto>("/admin/org-chart/summary"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useOrgChartPositions() {
  return useQuery({
    queryKey: ORG_CHART_POSITIONS_QUERY_KEY,
    queryFn: () => api.get<OrgPositionDto[]>("/org-chart/positions"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useOrgChartDepartments() {
  return useQuery({
    queryKey: ORG_CHART_DEPARTMENTS_QUERY_KEY,
    queryFn: () => api.get<OrgDepartmentDto[]>("/org-chart/departments"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useImportOrgChartFromGraph() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ImportFromGraphRequest) =>
      api.post<ImportFromGraphResultDto>("/admin/org-chart/import-from-graph", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_SUMMARY_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_POSITIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_DEPARTMENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_CHART_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_POLICY_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_SETTINGS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_DEPARTMENT_MAPPINGS_QUERY_KEY });
    },
  });
}

export function useCreateOrgDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertOrgDepartmentRequest) =>
      api.post<OrgDepartmentDto>("/org-chart/departments", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_DEPARTMENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_SUMMARY_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_DEPARTMENT_MAPPINGS_QUERY_KEY });
    },
  });
}

export function useUpdateOrgDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpsertOrgDepartmentRequest }) =>
      api.patch<OrgDepartmentDto>(`/org-chart/departments/${id}`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_DEPARTMENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_SUMMARY_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_DEPARTMENT_MAPPINGS_QUERY_KEY });
    },
  });
}

export function useDeleteOrgDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/org-chart/departments/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_DEPARTMENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_SUMMARY_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_DEPARTMENT_MAPPINGS_QUERY_KEY });
    },
  });
}

export function useOrgChartDepartmentMappings() {
  return useQuery({
    queryKey: ORG_CHART_DEPARTMENT_MAPPINGS_QUERY_KEY,
    queryFn: () => api.get<OrgDepartmentMappingDto[]>("/admin/org-chart/department-mappings"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useUpdateOrgDepartmentMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpsertOrgDepartmentMappingRequest }) =>
      api.patch<OrgDepartmentMappingDto>(`/admin/org-chart/department-mappings/${id}`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_DEPARTMENT_MAPPINGS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_DEPARTMENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_POSITIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_CHART_QUERY_KEY });
    },
  });
}

export function useImportDepartmentsFromDirectory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ImportDepartmentsFromDirectoryRequest) =>
      api.post<ImportDepartmentsFromDirectoryResultDto>(
        "/admin/org-chart/import-departments-from-directory",
        body
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_DEPARTMENT_MAPPINGS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_DEPARTMENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_SUMMARY_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_POSITIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_CHART_QUERY_KEY });
    },
  });
}

export function useCreateOrgPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOrgPositionRequest) =>
      api.post<OrgPositionDto>("/org-chart/positions", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_POSITIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_CHART_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_SUMMARY_QUERY_KEY });
    },
  });
}

export function useUpdateOrgPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpsertOrgPositionRequest }) =>
      api.patch<OrgPositionDto>(`/org-chart/positions/${id}`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_POSITIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_CHART_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_SUMMARY_QUERY_KEY });
    },
  });
}

export function useDeleteOrgPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/org-chart/positions/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_POSITIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_CHART_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_SUMMARY_QUERY_KEY });
    },
  });
}
