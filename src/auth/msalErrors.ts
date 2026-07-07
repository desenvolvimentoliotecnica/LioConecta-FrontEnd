import { BrowserAuthError, BrowserAuthErrorCodes } from "@azure/msal-browser";

function msalErrorCode(error: unknown): string | undefined {
  if (error instanceof BrowserAuthError) {
    return error.errorCode;
  }
  if (typeof error === "object" && error !== null && "errorCode" in error) {
    const code = (error as { errorCode?: unknown }).errorCode;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

/** Mensagem em português para exibir ao usuário final (sem códigos MSAL). */
export function formatMsalErrorForUser(error: unknown): string {
  if (error instanceof Error && error.message.includes("Configuração MSAL indisponível")) {
    return error.message;
  }

  const code = msalErrorCode(error);
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  switch (code) {
    case BrowserAuthErrorCodes.interactionInProgress:
    case BrowserAuthErrorCodes.interactionInProgressCancelled:
      return "Já existe uma autorização Microsoft em andamento. Conclua o login na janela aberta ou feche-a e clique em «Vincular conta» novamente.";
    case BrowserAuthErrorCodes.userCancelled:
      return "Autorização cancelada. Clique em «Vincular conta» quando quiser tentar de novo.";
    case BrowserAuthErrorCodes.popupWindowError:
    case BrowserAuthErrorCodes.emptyWindowError:
    case BrowserAuthErrorCodes.blockNestedPopups:
      return "Não foi possível abrir a janela de login. Permita pop-ups para este site e tente novamente.";
    case BrowserAuthErrorCodes.timedOut:
      return "A autorização demorou demais ou a janela foi fechada. Tente vincular novamente.";
    default:
      break;
  }

  if (message.includes("interaction_in_progress")) {
    return "Já existe uma autorização Microsoft em andamento. Conclua o login na janela aberta ou feche-a e clique em «Vincular conta» novamente.";
  }
  if (message.includes("user_cancelled") || message.includes("user_cancel")) {
    return "Autorização cancelada. Clique em «Vincular conta» quando quiser tentar de novo.";
  }
  if (message.includes("popup") || message.includes("window")) {
    return "Não foi possível abrir a janela de login. Permita pop-ups para este site e tente novamente.";
  }

  return "Não foi possível concluir a autorização Microsoft. Tente novamente em instantes.";
}
