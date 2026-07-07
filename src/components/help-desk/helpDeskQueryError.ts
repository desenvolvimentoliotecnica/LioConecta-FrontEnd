import { ApiError } from "../../api/client";

export function helpDeskQueryErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return `${fallback} O endpoint /ti/help-desk/areas não existe na API em execução — reinicie o backend com a versão mais recente.`;
    }

    if (error.status === 401 || error.status === 403) {
      return `${fallback} Sessão expirada ou sem permissão — faça login novamente.`;
    }

    const detail =
      error.body && typeof error.body === "object" && "detail" in error.body
        ? String((error.body as { detail?: unknown }).detail ?? "")
        : "";
    if (detail.trim()) {
      return `${fallback} ${detail.trim()}`;
    }
  }

  return fallback;
}
