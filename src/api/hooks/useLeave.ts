import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config, ApiError } from "../client";
import type {
  CreateLeaveRequestDto,
  LeaveBalanceDto,
  LeaveBancoHorasDto,
  LeaveHistoryItemDto,
  LeaveRequestDetailDto,
  LeaveRequestItemDto,
  LeaveRequestResultDto,
  LeaveServiceDto,
  LeaveSummaryDto,
  LeaveTeamCalendarDto,
} from "../types";

export const LEAVE_QUERY_KEY = ["leave"] as const;

export function useLeaveSummary() {
  return useQuery({
    queryKey: [...LEAVE_QUERY_KEY, "summary"],
    queryFn: () => api.get<LeaveSummaryDto>("/rh/leave/summary"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useLeaveServices() {
  return useQuery({
    queryKey: [...LEAVE_QUERY_KEY, "services"],
    queryFn: () => api.get<LeaveServiceDto[]>("/rh/leave/services"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useLeaveBalance(enabled: boolean) {
  return useQuery({
    queryKey: [...LEAVE_QUERY_KEY, "balance"],
    queryFn: () => api.get<LeaveBalanceDto>("/rh/leave/balance"),
    enabled,
    retry: config.useMock ? 0 : 1,
  });
}

export function useLeaveHistory(limit = 24, enabled = false) {
  return useQuery({
    queryKey: [...LEAVE_QUERY_KEY, "history", limit],
    queryFn: () => api.get<LeaveHistoryItemDto[]>(`/rh/leave/history?limit=${limit}`),
    enabled,
    retry: config.useMock ? 0 : 1,
  });
}

export function useLeaveRequests(limit = 24, enabled = true) {
  return useQuery({
    queryKey: [...LEAVE_QUERY_KEY, "requests", limit],
    queryFn: () => api.get<LeaveRequestItemDto[]>(`/rh/leave/requests?limit=${limit}`),
    enabled,
    retry: config.useMock ? 0 : 1,
  });
}

export function useLeaveRequestDetail(recordId: string | null) {
  return useQuery({
    queryKey: [...LEAVE_QUERY_KEY, "request", recordId],
    queryFn: () => api.get<LeaveRequestDetailDto>(`/rh/leave/requests/${recordId}`),
    enabled: recordId !== null,
    retry: config.useMock ? 0 : 1,
  });
}

export function useLeaveBancoHoras(enabled: boolean) {
  return useQuery({
    queryKey: [...LEAVE_QUERY_KEY, "banco-horas"],
    queryFn: () => api.get<LeaveBancoHorasDto>("/rh/leave/banco-horas"),
    enabled,
    retry: config.useMock ? 0 : 1,
  });
}

export function useLeaveTeamCalendar(enabled: boolean) {
  return useQuery({
    queryKey: [...LEAVE_QUERY_KEY, "team-calendar"],
    queryFn: () => api.get<LeaveTeamCalendarDto>("/rh/leave/team-calendar"),
    enabled,
    retry: config.useMock ? 0 : 1,
  });
}

export function extractLeaveRequestError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 422) {
      const detail =
        error.body && typeof error.body === "object" && "detail" in error.body
          ? String((error.body as { detail?: string }).detail)
          : error.message;
      return detail || "Saldo insuficiente para esta solicitação.";
    }

    if (error.status === 400 || error.status === 409) {
      const detail =
        error.body && typeof error.body === "object" && "detail" in error.body
          ? String((error.body as { detail?: string }).detail)
          : error.message;
      return detail || "Não foi possível enviar a solicitação.";
    }
  }

  return "Não foi possível enviar a solicitação. Tente novamente.";
}

export function useLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateLeaveRequestDto) =>
      api.post<LeaveRequestResultDto>("/rh/leave/requests", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEY });
    },
  });
}
