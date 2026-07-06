import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, config } from "../client";

import type {

  CreateHelpDeskTicketRequestDto,

  HelpDeskKnowledgeArticleDto,

  HelpDeskServiceDto,

  HelpDeskSummaryDto,

  HelpDeskTicketDetailDto,

  HelpDeskTicketListItemDto,

  HelpDeskItilCategoryDto,

  HelpDeskTicketResultDto,

} from "../types";



export const HELP_DESK_QUERY_KEY = ["help-desk"] as const;



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



export function useHelpDeskTickets(enabled: boolean, scope = "open") {

  return useQuery({

    queryKey: [...HELP_DESK_QUERY_KEY, "tickets", "mine", scope],

    queryFn: () =>

      api.get<HelpDeskTicketListItemDto[]>(

        `/ti/help-desk/tickets/mine?scope=${encodeURIComponent(scope)}`,

      ),

    enabled,

    retry: config.useMock ? 0 : 1,

  });

}



export function useHelpDeskAllTickets(enabled: boolean, scope = "open") {

  return useQuery({

    queryKey: [...HELP_DESK_QUERY_KEY, "tickets", "all", scope],

    queryFn: () =>

      api.get<HelpDeskTicketListItemDto[]>(

        `/ti/help-desk/tickets/all?scope=${encodeURIComponent(scope)}`,

      ),

    enabled,

    retry: config.useMock ? 0 : 1,

  });

}



export function useHelpDeskTicketDetail(ticketId: string | null, enabled: boolean) {

  return useQuery({

    queryKey: [...HELP_DESK_QUERY_KEY, "tickets", "detail", ticketId],

    queryFn: () => api.get<HelpDeskTicketDetailDto>(`/ti/help-desk/tickets/${ticketId}`),

    enabled: enabled && ticketId !== null,

    retry: config.useMock ? 0 : 1,

  });

}



export function useHelpDeskCategories(enabled: boolean) {
  return useQuery({
    queryKey: [...HELP_DESK_QUERY_KEY, "categories"],
    queryFn: () => api.get<HelpDeskItilCategoryDto[]>("/ti/help-desk/categories"),
    enabled,
    staleTime: 5 * 60 * 1000,
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

    },

  });

}

