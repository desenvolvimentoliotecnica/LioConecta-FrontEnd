import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  BulkUpdateSubjectAssignmentsRequest,
  CreateTestUserRequest,
  PermissionCatalogItemDto,
  RbacSubjectSearchResultDto,
  ResetTestUserPasswordRequest,
  RoleDetailDto,
  RoleDto,
  SubjectRoleAssignmentDto,
  TestUserDto,
  UpdateRolePermissionsRequest,
  UpdateSubjectAssignmentsRequest,
  UpdateTestUserRequest,
  UpsertRoleRequest,
} from "../types";

export const RBAC_ADMIN_QUERY_KEY = ["admin", "rbac"] as const;

function buildQueryString(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value?.trim()) search.set(key, value.trim());
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function useRbacPermissions() {
  return useQuery({
    queryKey: [...RBAC_ADMIN_QUERY_KEY, "permissions"],
    queryFn: () => api.get<PermissionCatalogItemDto[]>("/admin/rbac/permissions"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useRbacRoles() {
  return useQuery({
    queryKey: [...RBAC_ADMIN_QUERY_KEY, "roles"],
    queryFn: () => api.get<RoleDto[]>("/admin/rbac/roles"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useRbacRoleDetail(id?: string | null) {
  return useQuery({
    queryKey: [...RBAC_ADMIN_QUERY_KEY, "roles", id],
    queryFn: () => api.get<RoleDetailDto>(`/admin/rbac/roles/${id}`),
    enabled: Boolean(id),
    retry: config.useMock ? 0 : 1,
  });
}

export function useCreateRbacRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertRoleRequest) => api.post<RoleDetailDto>("/admin/rbac/roles", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RBAC_ADMIN_QUERY_KEY });
    },
  });
}

export function useUpdateRbacRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpsertRoleRequest }) =>
      api.put<RoleDetailDto>(`/admin/rbac/roles/${id}`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RBAC_ADMIN_QUERY_KEY });
    },
  });
}

export function useDeleteRbacRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/rbac/roles/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RBAC_ADMIN_QUERY_KEY });
    },
  });
}

export function useUpdateRbacRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateRolePermissionsRequest }) =>
      api.put<RoleDetailDto>(`/admin/rbac/roles/${id}/permissions`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RBAC_ADMIN_QUERY_KEY });
    },
  });
}

export function useRbacAssignments(params: { subjectType?: string; query?: string } = {}) {
  return useQuery({
    queryKey: [...RBAC_ADMIN_QUERY_KEY, "assignments", params],
    queryFn: () =>
      api.get<SubjectRoleAssignmentDto[]>(
        `/admin/rbac/assignments${buildQueryString(params)}`,
      ),
    retry: config.useMock ? 0 : 1,
  });
}

export function useUpdateRbacAssignments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateSubjectAssignmentsRequest) =>
      api.put<void>("/admin/rbac/assignments", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RBAC_ADMIN_QUERY_KEY });
    },
  });
}

export function useBulkUpdateRbacAssignments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BulkUpdateSubjectAssignmentsRequest) =>
      api.put<void>("/admin/rbac/assignments/bulk", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RBAC_ADMIN_QUERY_KEY });
    },
  });
}

export function useRbacSubjectSearch(subjectType: string, query: string, enabled = true) {
  const term = query.trim();
  return useQuery({
    queryKey: [...RBAC_ADMIN_QUERY_KEY, "subjects", subjectType, term] as const,
    queryFn: () =>
      api.get<RbacSubjectSearchResultDto[]>(
        `/admin/rbac/subjects/search?subjectType=${encodeURIComponent(subjectType)}&q=${encodeURIComponent(term)}&limit=8`,
      ),
    enabled: enabled && term.length >= 2 && Boolean(subjectType),
    retry: 0,
  });
}

export function useRbacTestUsers() {
  return useQuery({
    queryKey: [...RBAC_ADMIN_QUERY_KEY, "test-users"],
    queryFn: () => api.get<TestUserDto[]>("/admin/rbac/test-users"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useCreateRbacTestUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTestUserRequest) =>
      api.post<TestUserDto>("/admin/rbac/test-users", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RBAC_ADMIN_QUERY_KEY });
    },
  });
}

export function useUpdateRbacTestUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateTestUserRequest }) =>
      api.put<TestUserDto>(`/admin/rbac/test-users/${id}`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RBAC_ADMIN_QUERY_KEY });
    },
  });
}

export function useDeleteRbacTestUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/rbac/test-users/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RBAC_ADMIN_QUERY_KEY });
    },
  });
}

export function useResetRbacTestUserPassword() {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ResetTestUserPasswordRequest }) =>
      api.post<void>(`/admin/rbac/test-users/${id}/reset-password`, body),
  });
}
