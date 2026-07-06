import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  CreateHelpDeskTicketRequestDto,
  HelpDeskKnowledgeArticleDto,
  HelpDeskServiceDto,
  HelpDeskSummaryDto,
  HelpDeskTicketResultDto,
  ServiceRequestDto,
} from "../types";

export const HELP_DESK_QUERY_KEY = ["help-desk"] as const;
export const SERVICE_REQUESTS_QUERY_KEY = ["service-requests"] as const;

const HELP_DESK_TYPE = "servicos-help-desk";

export function useHelpDeskSummary() {
  return useQuery({
    queryKey: [...HELP_DESK_QUERY_KEY, "summary"],
    queryFn: () => api.get<HelpDeskSummaryDto>("/ti/help-desk/summary"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useHelpDeskServices() {
  return useQuery({
    queryKey: [...HELP_DESK_QUERY_KEY, "services"],
    queryFn: () => api.get<HelpDeskServiceDto[]>("/ti/help-desk/services"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useHelpDeskKnowledge(query: string, enabled: boolean) {
  const normalized = query.trim();
  return useQuery({
    queryKey: [...HELP_DESK_QUERY_KEY, "knowledge", normalized],
    queryFn: () =>
      api.get<HelpDeskKnowledgeArticleDto[]>(
        `/ti/help-desk/knowledge${normalized ? `?q=${encodeURIComponent(normalized)}` : ""}`,
      ),
    enabled,
    retry: config.useMock ? 0 : 1,
  });
}

export function useHelpDeskTickets(enabled: boolean) {
  return useQuery({
    queryKey: [...SERVICE_REQUESTS_QUERY_KEY, "mine", HELP_DESK_TYPE],
    queryFn: async () => {
      const all = await api.get<ServiceRequestDto[]>("/service-requests/mine");
      return all.filter((item) => item.type === HELP_DESK_TYPE);
    },
    enabled,
    retry: config.useMock ? 0 : 1,
  });
}

export function useHelpDeskTicketDetail(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: [...SERVICE_REQUESTS_QUERY_KEY, "detail", id],
    queryFn: () => api.get<ServiceRequestDto>(`/service-requests/${id}`),
    enabled: enabled && id !== null,
    retry: config.useMock ? 0 : 1,
  });
}

export function useHelpDeskCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateHelpDeskTicketRequestDto) =>
      api.post<HelpDeskTicketResultDto>("/ti/help-desk/tickets", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: HELP_DESK_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: SERVICE_REQUESTS_QUERY_KEY });
    },
  });
}
