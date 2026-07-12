export function formatUniLioAttachmentSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function uniLioAttachmentIconClass(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "fa-file-pdf";
  if (["doc", "docx"].includes(ext)) return "fa-file-word";
  if (["xls", "xlsx", "csv"].includes(ext)) return "fa-file-excel";
  if (["ppt", "pptx"].includes(ext)) return "fa-file-powerpoint";
  if (["zip", "rar", "7z"].includes(ext)) return "fa-file-zipper";
  return "fa-file-lines";
}

export const UNILIO_MODULE_ATTACHMENT_ACCEPT =
  ".pdf,.zip,.rar,.7z,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv";

export const UNILIO_MODULE_ATTACHMENT_MAX_BYTES = 26_214_400;

export const UNILIO_SCORM_ACCEPT = ".zip,application/zip";

export const UNILIO_SCORM_MAX_BYTES = 209_715_200;
