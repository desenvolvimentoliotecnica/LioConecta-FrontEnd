import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import type { EmailAttachmentUploadDto, SendEmailRequest, SendEmailResponse } from "../types";

/** Safe multipart filename: keeps last allowed extension, strips commas/accents/punctuation. */
export function sanitizeEmailAttachmentFileName(name: string): string {
  const raw = name.replace(/[/\\]/g, "_").trim() || "anexo";
  const allowedExt =
    /\.(pdf|txt|csv|jpe?g|png|webp|gif|docx?|xlsx?|pptx?)$/i.exec(raw)?.[0]?.toLowerCase() ?? "";
  const stemSource = allowedExt ? raw.slice(0, -allowedExt.length) : raw;
  const stem =
    stemSource
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^[_]+|[_]+$/g, "")
      .slice(0, 180) || "anexo";
  return `${stem}${allowedExt === ".jpeg" ? ".jpeg" : allowedExt}`;
}

export function useUploadEmailAttachment() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      const safeName = sanitizeEmailAttachmentFileName(file.name);
      formData.append("file", file, safeName);
      return api.upload<EmailAttachmentUploadDto>("/email/attachments", formData);
    },
  });
}

export function useSendEmail() {
  return useMutation({
    mutationFn: (body: SendEmailRequest) => api.post<SendEmailResponse>("/email/send", body),
  });
}
