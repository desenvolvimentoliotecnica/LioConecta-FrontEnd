import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import type { EmailAttachmentUploadDto, SendEmailRequest, SendEmailResponse } from "../types";

export function useUploadEmailAttachment() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.upload<EmailAttachmentUploadDto>("/email/attachments", formData);
    },
  });
}

export function useSendEmail() {
  return useMutation({
    mutationFn: (body: SendEmailRequest) => api.post<SendEmailResponse>("/email/send", body),
  });
}
