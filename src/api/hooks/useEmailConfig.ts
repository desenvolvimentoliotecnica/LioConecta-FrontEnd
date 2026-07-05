import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  EmailConfigurationDto,
  EmailConnectionTestResponse,
  EmailSmtpTestRequest,
  UpsertEmailConfigurationRequest,
} from "../types";

export const EMAIL_CONFIG_QUERY_KEY = ["admin", "email", "config"] as const;

export function useEmailConfiguration() {
  return useQuery({
    queryKey: EMAIL_CONFIG_QUERY_KEY,
    queryFn: () => api.get<EmailConfigurationDto>("/admin/email/config"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useSaveEmailConfiguration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertEmailConfigurationRequest) =>
      api.put<EmailConfigurationDto>("/admin/email/config", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EMAIL_CONFIG_QUERY_KEY });
    },
  });
}

export function useTestEmailSmtp() {
  return useMutation({
    mutationFn: (body: EmailSmtpTestRequest) =>
      api.post<EmailConnectionTestResponse>("/admin/email/config/test", body),
  });
}
