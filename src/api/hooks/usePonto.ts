import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config, ApiError } from "../client";
import type {
  CreatePontoAdjustmentDto,
  HourBankTeamMemberDto,
  LeaveBancoHorasDto,
  PontoAdjustmentDetailDto,
  PontoAdjustmentItemDto,
  PontoAdjustmentManagementDetailDto,
  PontoAdjustmentManagementItemDto,
  PontoAdjustmentResultDto,
  PontoPeriodSettingsDto,
  PontoResponseDto,
} from "../types";
import { downloadBlobWithToast } from "../../utils/payslipToast";

export const PONTO_QUERY_KEY = ["ponto"] as const;
export const PONTO_PERIODS_QUERY_KEY = ["ponto", "periods"] as const;
export const PONTO_ADJUSTMENTS_QUERY_KEY = ["ponto", "adjustments"] as const;

export function usePontoPeriods() {
  return useQuery({
    queryKey: PONTO_PERIODS_QUERY_KEY,
    queryFn: () => api.get<PontoPeriodSettingsDto>("/rh/ponto/periods"),
    retry: config.useMock ? 0 : 1,
  });
}

export function usePonto(month: number, year: number) {
  return useQuery({
    queryKey: [...PONTO_QUERY_KEY, year, month],
    queryFn: () =>
      api.get<PontoResponseDto>(`/rh/ponto?month=${month}&year=${year}`),
    retry: config.useMock ? 0 : 1,
  });
}

export function usePontoAdjustments(limit = 12, enabled = true) {
  return useQuery({
    queryKey: [...PONTO_ADJUSTMENTS_QUERY_KEY, "mine", limit],
    queryFn: () =>
      api.get<PontoAdjustmentItemDto[]>(`/rh/ponto/adjustments?limit=${limit}`),
    enabled,
    retry: config.useMock ? 0 : 1,
  });
}

export function usePontoAdjustmentDetail(recordId: string | null) {
  return useQuery({
    queryKey: [...PONTO_ADJUSTMENTS_QUERY_KEY, "mine", recordId],
    queryFn: () =>
      api.get<PontoAdjustmentDetailDto>(`/rh/ponto/adjustments/${recordId}`),
    enabled: recordId !== null,
    retry: config.useMock ? 0 : 1,
  });
}

export function usePontoManagementList(params: {
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
    queryKey: [...PONTO_ADJUSTMENTS_QUERY_KEY, "management", status ?? "", q ?? "", limit],
    queryFn: () =>
      api.get<PontoAdjustmentManagementItemDto[]>(
        `/rh/ponto/adjustments/management?${search.toString()}`,
      ),
    enabled: params.enabled !== false,
    retry: config.useMock ? 0 : 1,
  });
}

export function useHourBankTeam(params: { q?: string; enabled?: boolean }) {
  const q = params.q?.trim() || undefined;
  const search = new URLSearchParams();
  if (q) search.set("q", q);
  const qs = search.toString();

  return useQuery({
    queryKey: [...PONTO_QUERY_KEY, "banco-horas", "team", q ?? ""],
    queryFn: () =>
      api.get<HourBankTeamMemberDto[]>(
        `/rh/ponto/banco-horas${qs ? `?${qs}` : ""}`,
      ),
    enabled: params.enabled !== false,
    retry: config.useMock ? 0 : 1,
  });
}

export function useHourBankPerson(personId: string | null) {
  return useQuery({
    queryKey: [...PONTO_QUERY_KEY, "banco-horas", "person", personId],
    queryFn: () =>
      api.get<LeaveBancoHorasDto>(`/rh/ponto/banco-horas/${personId}`),
    enabled: personId !== null,
    retry: config.useMock ? 0 : 1,
  });
}

export function usePontoManagementDetail(recordId: string | null) {
  return useQuery({
    queryKey: [...PONTO_ADJUSTMENTS_QUERY_KEY, "management", "detail", recordId],
    queryFn: () =>
      api.get<PontoAdjustmentManagementDetailDto>(
        `/rh/ponto/adjustments/management/${recordId}`,
      ),
    enabled: recordId !== null,
    retry: config.useMock ? 0 : 1,
  });
}

export function extractPontoAdjustmentError(error: unknown): string {
  if (error instanceof ApiError) {
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

export function usePontoAdjustmentRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePontoAdjustmentDto) => {
      if (body.files && body.files.length > 0) {
        const formData = new FormData();
        const { files: _files, ...payload } = body;
        formData.append("payload", JSON.stringify(payload));
        for (const file of body.files) {
          formData.append("files", file);
        }
        return api.upload<PontoAdjustmentResultDto>(
          "/rh/ponto/adjustments/multipart",
          formData,
        );
      }

      const { files: _files, ...jsonBody } = body;
      return api.post<PontoAdjustmentResultDto>("/rh/ponto/adjustments", jsonBody);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PONTO_ADJUSTMENTS_QUERY_KEY });
    },
  });
}

export async function downloadPontoManagementAttachment(
  recordId: string,
  storageFileName: string,
  fileName: string,
) {
  await downloadBlobWithToast(
    api.getBlob(
      `/rh/ponto/adjustments/management/${recordId}/attachments/${encodeURIComponent(storageFileName)}`,
    ),
    fileName,
    "Anexo baixado.",
  );
}
