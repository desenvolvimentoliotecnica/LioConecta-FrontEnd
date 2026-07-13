import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  ServiceRequestAttachmentMetaDto,
  ServiceRequestDto,
  ServiceRequestStatus,
} from "../types";
import { downloadBlobWithToast } from "../../utils/payslipToast";

export const SERVICE_REQUESTS_QUERY_KEY = ["service-requests"] as const;

export function useServiceRequestMineList(enabled = true) {
  return useQuery({
    queryKey: [...SERVICE_REQUESTS_QUERY_KEY, "mine"],
    queryFn: () => api.get<ServiceRequestDto[]>("/service-requests/mine"),
    enabled,
    retry: config.useMock ? 0 : 1,
  });
}

export function useServiceRequestMineDetail(id: string | null) {
  return useQuery({
    queryKey: [...SERVICE_REQUESTS_QUERY_KEY, "mine", id],
    queryFn: () => api.get<ServiceRequestDto>(`/service-requests/${id}`),
    enabled: id !== null,
    retry: config.useMock ? 0 : 1,
  });
}

export function useServiceRequestManagementList(params: {
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
    queryKey: [...SERVICE_REQUESTS_QUERY_KEY, "management", status, q, limit],
    queryFn: () =>
      api.get<ServiceRequestDto[]>(`/service-requests/management?${search.toString()}`),
    enabled: params.enabled !== false,
    retry: config.useMock ? 0 : 1,
  });
}

export function useServiceRequestManagementDetail(id: string | null) {
  return useQuery({
    queryKey: [...SERVICE_REQUESTS_QUERY_KEY, "management", id],
    queryFn: () => api.get<ServiceRequestDto>(`/service-requests/management/${id}`),
    enabled: id !== null,
    retry: config.useMock ? 0 : 1,
  });
}

export function useServiceRequestApprove() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      api.post<ServiceRequestDto>(`/service-requests/management/${id}/approve`, {
        comment: comment ?? null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SERVICE_REQUESTS_QUERY_KEY });
    },
  });
}

export function useServiceRequestReject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.post<ServiceRequestDto>(`/service-requests/management/${id}/reject`, {
        reason: reason ?? null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SERVICE_REQUESTS_QUERY_KEY });
    },
  });
}

export function useServiceRequestFinalize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      api.post<ServiceRequestDto>(`/service-requests/management/${id}/finalize`, {
        comment: comment ?? null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SERVICE_REQUESTS_QUERY_KEY });
    },
  });
}

export function useServiceRequestConfirmClosure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<ServiceRequestDto>(`/service-requests/${id}/confirm-closure`, {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SERVICE_REQUESTS_QUERY_KEY });
    },
  });
}

export function useServiceRequestReplyAsManager() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      message,
      files,
    }: {
      id: string;
      message?: string;
      files?: File[];
    }) => {
      const formData = new FormData();
      if (message?.trim()) formData.append("message", message.trim());
      for (const file of files ?? []) {
        formData.append("files", file);
      }
      return api.upload<ServiceRequestDto>(
        `/service-requests/management/${id}/messages`,
        formData,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SERVICE_REQUESTS_QUERY_KEY });
    },
  });
}

export function useServiceRequestReplyAsRequester() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      message,
      files,
    }: {
      id: string;
      message?: string;
      files?: File[];
    }) => {
      const formData = new FormData();
      if (message?.trim()) formData.append("message", message.trim());
      for (const file of files ?? []) {
        formData.append("files", file);
      }
      return api.upload<ServiceRequestDto>(`/service-requests/${id}/messages`, formData);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SERVICE_REQUESTS_QUERY_KEY });
    },
  });
}

export async function fetchServiceRequestAttachmentBlob(
  requestId: string,
  storageFileName: string,
): Promise<Blob> {
  return api.getBlob(
    `/service-requests/${requestId}/attachments/${encodeURIComponent(storageFileName)}`,
  );
}

export async function downloadServiceRequestAttachment(
  requestId: string,
  storageFileName: string,
  fileName: string,
) {
  await downloadBlobWithToast(
    fetchServiceRequestAttachmentBlob(requestId, storageFileName),
    fileName,
    "Anexo baixado com sucesso.",
  );
}

export function parseServiceRequestAttachments(
  details?: Record<string, unknown> | null,
): ServiceRequestAttachmentMetaDto[] {
  if (!details) return [];
  const raw = details.attachments;
  if (!Array.isArray(raw)) return [];
  const list: ServiceRequestAttachmentMetaDto[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const fileName =
      typeof row.fileName === "string"
        ? row.fileName
        : typeof row.FileName === "string"
          ? row.FileName
          : null;
    const storageFileName =
      typeof row.storageFileName === "string"
        ? row.storageFileName
        : typeof row.StorageFileName === "string"
          ? row.StorageFileName
          : null;
    if (!fileName || !storageFileName) continue;
    list.push({
      fileName,
      storageFileName,
      contentType:
        typeof row.contentType === "string"
          ? row.contentType
          : typeof row.ContentType === "string"
            ? row.ContentType
            : "application/octet-stream",
      sizeBytes:
        typeof row.sizeBytes === "number"
          ? row.sizeBytes
          : typeof row.SizeBytes === "number"
            ? row.SizeBytes
            : 0,
      url:
        typeof row.url === "string"
          ? row.url
          : typeof row.Url === "string"
            ? row.Url
            : "",
    });
  }
  return list;
}

export function normalizeServiceRequestStatus(
  status: ServiceRequestStatus | string | number | null | undefined,
): ServiceRequestStatus | string {
  if (status == null) return "Submitted";
  if (typeof status === "number") {
    const byIndex: ServiceRequestStatus[] = [
      "Draft",
      "Submitted",
      "InReview",
      "Approved",
      "Rejected",
      "Completed",
      "Cancelled",
      "AwaitingConfirmation",
    ];
    return byIndex[status] ?? String(status);
  }
  const raw = String(status).trim();
  if (/^\d+$/.test(raw)) {
    return normalizeServiceRequestStatus(Number(raw));
  }
  const map: Record<string, ServiceRequestStatus> = {
    draft: "Draft",
    submitted: "Submitted",
    inreview: "InReview",
    approved: "Approved",
    rejected: "Rejected",
    completed: "Completed",
    cancelled: "Cancelled",
    canceled: "Cancelled",
    awaitingconfirmation: "AwaitingConfirmation",
    pending: "Submitted",
  };
  return map[raw.toLowerCase()] ?? (raw as ServiceRequestStatus);
}

export function serviceRequestTypeLabel(type: string): string {
  switch (type) {
    case "servicos-beneficios":
      return "Benefícios";
    case "servicos-contracheque":
      return "Contracheque";
    default:
      return type;
  }
}

export function serviceRequestStatusLabel(
  status: ServiceRequestStatus | string | number | null | undefined,
): string {
  switch (normalizeServiceRequestStatus(status)) {
    case "Submitted":
      return "Pendente";
    case "InReview":
      return "Em análise";
    case "AwaitingConfirmation":
      return "Aguardando confirmação";
    case "Approved":
      return "Aprovado";
    case "Rejected":
      return "Rejeitado";
    case "Completed":
      return "Concluído";
    case "Cancelled":
      return "Cancelado";
    case "Draft":
      return "Rascunho";
    default:
      return "Pendente";
  }
}

export function serviceRequestStatusTone(
  status: ServiceRequestStatus | string | number | null | undefined,
): "pending" | "approved" | "rejected" | "completed" {
  switch (normalizeServiceRequestStatus(status)) {
    case "Approved":
    case "AwaitingConfirmation":
      return "approved";
    case "Rejected":
    case "Cancelled":
      return "rejected";
    case "Completed":
      return "completed";
    default:
      return "pending";
  }
}

export function canDecideServiceRequest(
  status: ServiceRequestStatus | string | number | null | undefined,
): boolean {
  const normalized = normalizeServiceRequestStatus(status);
  return normalized === "Submitted" || normalized === "InReview";
}

export function canMessageServiceRequest(
  status: ServiceRequestStatus | string | number | null | undefined,
): boolean {
  const normalized = normalizeServiceRequestStatus(status);
  return (
    normalized === "Submitted" ||
    normalized === "InReview" ||
    normalized === "AwaitingConfirmation"
  );
}

export function canFinalizeServiceRequest(
  status: ServiceRequestStatus | string | number | null | undefined,
): boolean {
  return canDecideServiceRequest(status);
}

export function canConfirmServiceRequestClosure(
  status: ServiceRequestStatus | string | number | null | undefined,
): boolean {
  return normalizeServiceRequestStatus(status) === "AwaitingConfirmation";
}

export function serviceRequestStatusBannerText(
  status: ServiceRequestStatus | string | number | null | undefined,
): string {
  switch (normalizeServiceRequestStatus(status)) {
    case "AwaitingConfirmation":
      return "RH finalizou — confirme o encerramento";
    case "Approved":
      return "Pedido aprovado";
    case "Rejected":
      return "Pedido rejeitado";
    case "Completed":
      return "Pedido concluído";
    case "InReview":
      return "Em conversa com o RH";
    default:
      return "Aguardando decisão do RH";
  }
}
