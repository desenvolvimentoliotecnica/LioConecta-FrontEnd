import { PublicClientApplication, type AuthenticationResult } from "@azure/msal-browser";
import type { ChatBootstrapDto } from "../../api/types";

let chatMsalInstance: PublicClientApplication | null = null;
let configuredKey = "";

function bootstrapKey(bootstrap: ChatBootstrapDto): string {
  return `${bootstrap.msalClientId}:${bootstrap.msalTenantId}:${bootstrap.msalAuthority}`;
}

function getOrCreateMsal(bootstrap: ChatBootstrapDto): PublicClientApplication | null {
  if (!bootstrap.msalClientId || !bootstrap.msalTenantId) {
    return null;
  }

  const key = bootstrapKey(bootstrap);
  if (chatMsalInstance && configuredKey === key) {
    return chatMsalInstance;
  }

  chatMsalInstance = new PublicClientApplication({
    auth: {
      clientId: bootstrap.msalClientId,
      authority:
        bootstrap.msalAuthority ||
        `https://login.microsoftonline.com/${bootstrap.msalTenantId}`,
      redirectUri: window.location.origin,
      postLogoutRedirectUri: window.location.origin,
    },
    cache: {
      cacheLocation: "localStorage",
    },
  });
  configuredKey = key;
  return chatMsalInstance;
}

export async function acquireTeamsChatToken(
  bootstrap: ChatBootstrapDto,
): Promise<AuthenticationResult> {
  const msal = getOrCreateMsal(bootstrap);
  if (!msal) {
    throw new Error("Configuração MSAL do chat indisponível.");
  }

  await msal.initialize();

  const scopes =
    bootstrap.delegatedScopes.length > 0
      ? bootstrap.delegatedScopes
      : ["Chat.ReadWrite", "ChatMessage.Send", "User.Read"];

  const account = msal.getAllAccounts()[0];
  if (account) {
    try {
      return await msal.acquireTokenSilent({ scopes, account });
    } catch {
      // Fall through to interactive consent.
    }
  }

  return msal.acquireTokenPopup({ scopes });
}
