import { ApiError } from "../api/client";
import { formatMsalErrorForUser } from "./msalErrors";

function apiErrorMessage(error: ApiError): string {
  const body = error.body;
  if (typeof body === "string" && body.trim()) {
    return body;
  }
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const title = record.title ?? record.detail ?? record.message;
    if (typeof title === "string" && title.trim()) {
      return title;
    }
  }

  if (error.status === 401) {
    return "Sessão do portal expirada. Faça login novamente e tente vincular a conta Microsoft.";
  }

  return `Não foi possível salvar o vínculo no servidor (HTTP ${error.status}).`;
}

/** Erros do fluxo MSAL + POST link-account no backend. */
export function formatLinkAccountError(error: unknown): string {
  if (error instanceof ApiError) {
    return apiErrorMessage(error);
  }

  if (error instanceof Error && error.message.includes("Configuração MSAL indisponível")) {
    return error.message;
  }

  return formatMsalErrorForUser(error);
}
