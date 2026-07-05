import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type { EmailMessageDto, EmailMessageSummaryDto, PagedEmailMessagesDto } from "../types";

export const EMAIL_QUEUE_QUERY_KEY = ["admin", "email"] as const;

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function useEmailSummary() {
  return useQuery({
    queryKey: [...EMAIL_QUEUE_QUERY_KEY, "summary"],
    queryFn: () => api.get<EmailMessageSummaryDto>("/admin/email/summary"),
    retry: config.useMock ? 0 : 1,
    refetchInterval: config.useMock ? false : 30000,
  });
}

export function useEmailMessages(
  status: string,
  search: string,
  page: number,
  pageSize = 20,
) {
  return useQuery({
    queryKey: [...EMAIL_QUEUE_QUERY_KEY, "messages", status, search, page, pageSize],
    queryFn: () =>
      api.get<PagedEmailMessagesDto>(
        `/admin/email/messages${buildQueryString({ status, search, page, pageSize })}`,
      ),
    retry: config.useMock ? 0 : 1,
    refetchInterval: config.useMock ? false : 15000,
  });
}

export function useEmailMessage(id: string | null) {
  return useQuery({
    queryKey: [...EMAIL_QUEUE_QUERY_KEY, "message", id],
    queryFn: () => api.get<EmailMessageDto>(`/admin/email/messages/${id}`),
    enabled: Boolean(id),
    retry: config.useMock ? 0 : 1,
  });
}

export function useRetryEmailMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<EmailMessageDto>(`/admin/email/messages/${id}/retry`, {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EMAIL_QUEUE_QUERY_KEY });
    },
  });
}

export function useCancelEmailMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<EmailMessageDto>(`/admin/email/messages/${id}/cancel`, {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EMAIL_QUEUE_QUERY_KEY });
    },
  });
}
