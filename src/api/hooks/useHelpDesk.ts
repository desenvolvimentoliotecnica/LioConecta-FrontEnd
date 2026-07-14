import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, config } from "../client";
import { downloadBlobWithToast } from "../../utils/payslipToast";

import type {

  CreateHelpDeskTicketRequestDto,

  HelpDeskKnowledgeArticleDto,

  HelpDeskServiceDto,

  HelpDeskSummaryDto,

  HelpDeskTicketDetailDto,

  HelpDeskTicketListItemDto,

  HelpDeskItilCategoryDto,

  HelpDeskAreaDto,

  HelpDeskGlpiEntityDto,

  HelpDeskFormCategoryDto,

  HelpDeskFormSummaryDto,

  HelpDeskFormSchemaDto,

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

export async function fetchHelpDeskTicketAttachmentBlob(
  ticketId: string,
  documentId: string,
): Promise<Blob> {
  return api.getBlob(
    `/ti/help-desk/tickets/${encodeURIComponent(ticketId)}/attachments/${encodeURIComponent(documentId)}`,
  );
}

export async function downloadHelpDeskTicketAttachment(
  ticketId: string,
  documentId: string,
  fileName: string,
) {
  await downloadBlobWithToast(
    fetchHelpDeskTicketAttachmentBlob(ticketId, documentId),
    fileName,
    "Anexo baixado com sucesso.",
  );
}

export async function uploadHelpDeskTicketAttachment(
  ticketId: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file, file.name);
  await api.upload(
    `/ti/help-desk/tickets/${encodeURIComponent(ticketId)}/attachments`,
    formData,
  );
}



export function useHelpDeskAreas(enabled: boolean) {
  return useQuery({
    queryKey: [...HELP_DESK_QUERY_KEY, "areas"],
    queryFn: () => api.get<HelpDeskAreaDto[]>("/ti/help-desk/areas"),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: config.useMock ? 0 : 1,
  });
}

export function useHelpDeskEntities(enabled: boolean) {
  return useQuery({
    queryKey: [...HELP_DESK_QUERY_KEY, "entities"],
    queryFn: () => api.get<HelpDeskGlpiEntityDto[]>("/ti/help-desk/entities"),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: config.useMock ? 0 : 1,
  });
}

export function useHelpDeskCategories(areaId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: [...HELP_DESK_QUERY_KEY, "categories", areaId],
    queryFn: () =>
      api.get<HelpDeskItilCategoryDto[]>(
        `/ti/help-desk/categories?areaId=${encodeURIComponent(String(areaId))}`,
      ),
    enabled: enabled && areaId !== null && areaId.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: config.useMock ? 0 : 1,
  });
}

export function useHelpDeskFormCategories(enabled: boolean) {
  return useQuery({
    queryKey: [...HELP_DESK_QUERY_KEY, "form-categories"],
    queryFn: () => api.get<HelpDeskFormCategoryDto[]>("/ti/help-desk/form-categories"),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: config.useMock ? 0 : 1,
  });
}

export function useHelpDeskForms(categoryId: number | null, enabled: boolean) {
  return useQuery({
    queryKey: [...HELP_DESK_QUERY_KEY, "forms", categoryId],
    queryFn: () =>
      api.get<HelpDeskFormSummaryDto[]>(
        categoryId != null && categoryId > 0
          ? `/ti/help-desk/forms?categoryId=${categoryId}`
          : "/ti/help-desk/forms",
      ),
    enabled: enabled && categoryId != null && categoryId > 0,
    staleTime: 5 * 60 * 1000,
    retry: config.useMock ? 0 : 1,
  });
}

export function useHelpDeskFormSchema(formId: number | null, enabled: boolean) {
  return useQuery({
    queryKey: [...HELP_DESK_QUERY_KEY, "form-schema", formId],
    queryFn: () => api.get<HelpDeskFormSchemaDto>(`/ti/help-desk/forms/${formId}`),
    enabled: enabled && formId != null && formId > 0,
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

