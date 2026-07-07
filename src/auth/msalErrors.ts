import { AuthError, BrowserAuthErrorCodes } from "@azure/msal-browser";
import { getMsalRedirectUri } from "./azureMsal";

function msalErrorCode(error: unknown): string | undefined {
  if (error instanceof AuthError) {
    return error.errorCode;
  }
  if (typeof error === "object" && error !== null && "errorCode" in error) {
    const code = (error as { errorCode?: unknown }).errorCode;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

function readAuthErrorText(error: unknown): string {
  if (error instanceof AuthError) {
    return [error.errorCode, error.errorMessage, error.message, error.subError]
      .filter((part) => typeof part === "string" && part.trim())
      .join(" ");
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "";
}

/** Mensagem em português para exibir ao usuário final. */
export function formatMsalErrorForUser(error: unknown): string {
  if (error instanceof Error && error.message.includes("Configuração MSAL indisponível")) {
    return error.message;
  }

  const code = msalErrorCode(error);
  const message = readAuthErrorText(error).toLowerCase();
  const rawMessage = readAuthErrorText(error);
  const redirectUri = getMsalRedirectUri();

  if (
    rawMessage.includes("AADSTS500113") ||
    message.includes("no reply address") ||
    message.includes("reply address is not registered")
  ) {
    return `A URL de redirecionamento «${redirectUri}» não está registrada no Azure. Em Entra ID → App registrations → sua app → Authentication → Single-page application, adicione essa URI exata e salve.`;
  }

  if (
    rawMessage.includes("AADSTS50011") ||
    message.includes("redirect uri") && message.includes("does not match")
  ) {
    return `A URL «${redirectUri}» não confere com o cadastro no Azure (redirect URI). Peça à infra para registrar exatamente essa URI em Authentication → SPA.`;
  }

  if (
    rawMessage.includes("AADSTS65001") ||
    rawMessage.includes("AADSTS650054") ||
    message.includes("admin consent") ||
    message.includes("administrator approval") ||
    message.includes("aprovação de administrador") ||
    message.includes("need admin approval")
  ) {
    return "É necessária aprovação de administrador no Microsoft Entra ID para as permissões de calendário (Calendars.ReadWrite). Peça ao admin do tenant para conceder consentimento na app registration e tente novamente.";
  }

  if (
    rawMessage.includes("AADSTS700016") ||
    message.includes("was not found in the directory")
  ) {
    return "A aplicação Microsoft configurada em azure_ad.client_id não existe neste tenant ou está desabilitada. Revise Config. Backend → Azure AD.";
  }

  if (message.includes("consent_denied") || message.includes("access_denied")) {
    return "Permissão negada no popup Microsoft. Clique em «Vincular conta» e aceite as permissões solicitadas.";
  }

  switch (code) {
    case BrowserAuthErrorCodes.interactionInProgress:
    case BrowserAuthErrorCodes.interactionInProgressCancelled:
      return "Já existe uma autorização Microsoft em andamento. Conclua o login na janela aberta ou feche-a e clique em «Vincular conta» novamente.";
    case BrowserAuthErrorCodes.userCancelled:
      return "Autorização cancelada. Clique em «Vincular conta» quando quiser tentar de novo.";
    case BrowserAuthErrorCodes.popupWindowError:
    case BrowserAuthErrorCodes.emptyWindowError:
    case BrowserAuthErrorCodes.blockNestedPopups:
      return "Não foi possível abrir a janela de login. Permita pop-ups para este site (10.0.0.79) e tente novamente.";
    case BrowserAuthErrorCodes.timedOut:
      return "A autorização demorou demais ou a janela foi fechada. Tente vincular novamente.";
    case "consent_required":
    case "interaction_required":
    case "login_required":
      return "O Microsoft solicitou nova autorização. Clique em «Vincular conta» novamente e conclua o login no popup.";
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

  if (rawMessage.trim()) {
    return `Não foi possível concluir a autorização Microsoft (${rawMessage.slice(0, 180)}). Redirect URI esperada: ${redirectUri}`;
  }

  return `Não foi possível concluir a autorização Microsoft. Verifique pop-ups e se ${redirectUri} está registrada no Azure (SPA).`;
}
