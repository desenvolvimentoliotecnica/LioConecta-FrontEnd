import {
  BrowserAuthError,
  BrowserAuthErrorCodes,
  PublicClientApplication,
  type AuthenticationResult,
} from "@azure/msal-browser";
import { formatMsalErrorForUser } from "./msalErrors";

export type AzureMsalBootstrap = {
  msalClientId: string;
  msalTenantId: string;
  msalAuthority: string;
  delegatedScopes: string[];
};

let sharedMsalInstance: PublicClientApplication | null = null;
let configuredKey = "";
let interactiveTokenPromise: Promise<AuthenticationResult> | null = null;

function bootstrapKey(bootstrap: AzureMsalBootstrap): string {
  return `${bootstrap.msalClientId}:${bootstrap.msalTenantId}:${bootstrap.msalAuthority}`;
}

export function getOrCreateMsalInstance(bootstrap: AzureMsalBootstrap): PublicClientApplication | null {
  if (!bootstrap.msalClientId || !bootstrap.msalTenantId) {
    return null;
  }

  const key = bootstrapKey(bootstrap);
  if (sharedMsalInstance && configuredKey === key) {
    return sharedMsalInstance;
  }

  sharedMsalInstance = new PublicClientApplication({
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
  return sharedMsalInstance;
}

async function runInteractiveTokenFlow(
  msal: PublicClientApplication,
  scopes: string[],
): Promise<AuthenticationResult> {
  await msal.handleRedirectPromise();

  try {
    return await msal.acquireTokenPopup({ scopes });
  } catch (error) {
    if (
      error instanceof BrowserAuthError &&
      error.errorCode === BrowserAuthErrorCodes.interactionInProgress
    ) {
      await msal.handleRedirectPromise();
      return msal.acquireTokenPopup({ scopes });
    }
    throw error;
  }
}

async function acquireTokenInteractive(
  msal: PublicClientApplication,
  scopes: string[],
): Promise<AuthenticationResult> {
  if (interactiveTokenPromise) {
    return interactiveTokenPromise;
  }

  interactiveTokenPromise = runInteractiveTokenFlow(msal, scopes).finally(() => {
    interactiveTokenPromise = null;
  });

  return interactiveTokenPromise;
}

export async function acquireDelegatedToken(
  bootstrap: AzureMsalBootstrap,
  fallbackScopes: string[],
): Promise<AuthenticationResult> {
  const msal = getOrCreateMsalInstance(bootstrap);
  if (!msal) {
    throw new Error("Configuração MSAL indisponível — preencha azure_ad.* no admin.");
  }

  try {
    await msal.initialize();
    await msal.handleRedirectPromise();

    const scopes =
      bootstrap.delegatedScopes.length > 0 ? bootstrap.delegatedScopes : fallbackScopes;

    const account = msal.getAllAccounts()[0];
    if (account) {
      try {
        return await msal.acquireTokenSilent({ scopes, account });
      } catch {
        // Fall through to interactive consent.
      }
    }

    return await acquireTokenInteractive(msal, scopes);
  } catch (error) {
    throw new Error(formatMsalErrorForUser(error));
  }
}
