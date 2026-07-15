import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config, ApiError } from "../client";
import type {
  CreateLeaveRequestDto,
  LeaveBalanceDto,
  LeaveBancoHorasDto,
  LeaveHistoryItemDto,
  LeaveManagementDetailDto,
  LeaveManagementItemDto,
  LeaveRequestDetailDto,
  LeaveRequestItemDto,
  LeaveRequestResultDto,
  LeaveServiceDto,
  LeaveSummaryDto,
  LeaveTeamCalendarDto,
} from "../types";
import { downloadBlobWithToast } from "../../utils/payslipToast";

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

export function useLeaveManagementList(params: {
  status?: string;
  q?: string;
  limit?: number;
  enabled?: boolean;
}) {
  const status = params.status?.trim() || undefined;
  const q = params.q?.trim() || undefined;
  const limit = params.limit ?? 50;
  const search = new URLSearchParams();
  if (status) search.set("status", status);
  if (q) search.set("q", q);
  search.set("limit", String(limit));

  return useQuery({
    queryKey: [...LEAVE_QUERY_KEY, "management", status ?? "", q ?? "", limit],
    queryFn: () =>
      api.get<LeaveManagementItemDto[]>(`/rh/leave/management?${search.toString()}`),
    enabled: params.enabled !== false,
    retry: config.useMock ? 0 : 1,
  });
}

export function useLeaveManagementDetail(recordId: string | null) {
  return useQuery({
    queryKey: [...LEAVE_QUERY_KEY, "management", "detail", recordId],
    queryFn: () => api.get<LeaveManagementDetailDto>(`/rh/leave/management/${recordId}`),
    enabled: recordId !== null,
    retry: config.useMock ? 0 : 1,
  });
}

export function useLeaveManagementApprove() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      api.post<LeaveManagementDetailDto>(`/rh/leave/management/${id}/approve`, { comment: comment ?? null }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEY });
    },
  });
}

export function useLeaveManagementReject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      api.post<LeaveManagementDetailDto>(`/rh/leave/management/${id}/reject`, { reason: comment ?? null }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEY });
    },
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
    mutationFn: (body: CreateLeaveRequestDto) => {
      if (body.files && body.files.length > 0) {
        const formData = new FormData();
        formData.append("serviceId", body.serviceId);
        if (body.startDate) formData.append("startDate", body.startDate);
        if (body.endDate) formData.append("endDate", body.endDate);
        if (body.days != null) formData.append("days", String(body.days));
        if (body.notes) formData.append("notes", body.notes);
        for (const file of body.files) {
          formData.append("files", file);
        }
        return api.upload<LeaveRequestResultDto>("/rh/leave/requests/multipart", formData);
      }

      const { files: _files, ...jsonBody } = body;
      return api.post<LeaveRequestResultDto>("/rh/leave/requests", jsonBody);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEY });
    },
  });
}

export async function downloadLeaveRequestPdf(recordId: string) {
  await downloadBlobWithToast(
    api.getBlob(`/rh/leave/requests/${recordId}/pdf`),
    `comprovante-ferias-${recordId}.pdf`,
    "O comprovante da solicitação de férias foi baixado.",
  );
}

export async function openLeaveRequestPdf(recordId: string) {
  const blob = await api.getBlob(`/rh/leave/requests/${recordId}/pdf`);
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function downloadLeaveManagementPdf(recordId: string) {
  await downloadBlobWithToast(
    api.getBlob(`/rh/leave/management/${recordId}/pdf`),
    `comprovante-ferias-gestao-${recordId}.pdf`,
    "O comprovante da solicitação de férias foi baixado.",
  );
}

export async function openLeaveManagementPdf(recordId: string) {
  const blob = await api.getBlob(`/rh/leave/management/${recordId}/pdf`);
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function fetchLeaveManagementAttachmentBlob(
  recordId: string,
  storageFileName: string,
): Promise<Blob> {
  return api.getBlob(
    `/rh/leave/management/${recordId}/attachments/${encodeURIComponent(storageFileName)}`,
  );
}

export async function downloadLeaveManagementAttachment(
  recordId: string,
  storageFileName: string,
  fileName: string,
) {
  await downloadBlobWithToast(
    fetchLeaveManagementAttachmentBlob(recordId, storageFileName),
    fileName,
    "Anexo baixado com sucesso.",
  );
}
