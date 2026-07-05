import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  CreateLeaveRequestDto,
  LeaveBalanceDto,
  LeaveBancoHorasDto,
  LeaveHistoryItemDto,
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
