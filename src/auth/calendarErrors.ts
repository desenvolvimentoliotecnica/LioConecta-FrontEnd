import { ApiError } from "../api/client";

function readApiDetail(error: ApiError): string {
  const body = error.body;
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const detail = record.detail ?? record.message ?? record.title;
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
  }
  return error.message;
}

/** Mensagens amigáveis para falhas da API de calendário / Graph. */
export function formatCalendarApiError(error: unknown): string {
  if (error instanceof ApiError) {
    const detail = readApiDetail(error);

    if (
      error.status === 409
      && (detail.includes("Token Microsoft expirado")
        || detail.includes("Vincule a conta")
        || detail.includes("JWT is not well formed")
        || detail.includes("não vinculada"))
    ) {
      return "Sua sessão Microsoft expirou ou ficou inválida. Clique em «Vincular conta» e autorize novamente no popup.";
    }

    if (error.status === 409) {
      return detail.includes("Graph")
        ? "Não foi possível acessar o Outlook. Tente vincular a conta Microsoft novamente."
        : detail;
    }

    if (error.status === 401) {
      return "Sessão do portal expirada. Faça login novamente.";
    }

    return detail || `Erro ao acessar o calendário (HTTP ${error.status}).`;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Não foi possível concluir a operação no calendário. Tente novamente.";
}
