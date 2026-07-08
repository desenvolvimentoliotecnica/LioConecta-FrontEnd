import {
  BrowserAuthError,
  BrowserAuthErrorCodes,
  PublicClientApplication,
  type AuthenticationResult,
  type PopupRequest,
} from "@azure/msal-browser";

export type AzureMsalBootstrap = {
  msalClientId: string;
  msalTenantId: string;
  msalAuthority: string;
  delegatedScopes: string[];
};

export type AcquireDelegatedTokenOptions = {
  /** Ignora cache/silent e abre popup (recomendado em «Vincular conta»). */
  forceInteractive?: boolean;
  prompt?: PopupRequest["prompt"];
  loginHint?: string;
};

let sharedMsalInstance: PublicClientApplication | null = null;
let configuredKey = "";
let interactiveTokenPromise: Promise<AuthenticationResult> | null = null;

function normalizeMsalScopes(scopes: string[]): string[] {
  const result = new Set<string>();

  for (const scope of scopes) {
    const trimmed = scope.trim();
    if (!trimmed) continue;

    if (
      trimmed === "offline_access"
      || trimmed === "openid"
      || trimmed === "profile"
      || trimmed.startsWith("https://")
    ) {
      result.add(trimmed);
      continue;
    }

    result.add(`https://graph.microsoft.com/${trimmed}`);
  }

  result.add("openid");
  result.add("profile");
  result.add("offline_access");

  return [...result];
}

/** Redirect URI enviada ao Entra ID — deve existir em Authentication → SPA. */
export function getMsalRedirectUri(): string {
  const override = import.meta.env.VITE_MSAL_REDIRECT_URI?.trim();
  if (override) {
    return override;
  }

  const origin = window.location.origin;
  // Dev costuma registrar localhost:5173, mas o Vite pode abrir em 127.0.0.1.
  if (/^https?:\/\/127\.0\.0\.1(?::\d+)?$/i.test(origin)) {
    return origin.replace(/^https?:\/\/127\.0\.0\.1/i, window.location.protocol + "//localhost");
  }

  return origin;
}

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
      redirectUri: getMsalRedirectUri(),
      postLogoutRedirectUri: getMsalRedirectUri(),
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
  options?: Pick<AcquireDelegatedTokenOptions, "prompt" | "loginHint">,
): Promise<AuthenticationResult> {
  await msal.handleRedirectPromise();

  const popupRequest: PopupRequest = {
    scopes,
    prompt: options?.prompt,
    loginHint: options?.loginHint,
  };

  try {
    return await msal.acquireTokenPopup(popupRequest);
  } catch (error) {
    if (
      error instanceof BrowserAuthError &&
      error.errorCode === BrowserAuthErrorCodes.interactionInProgress
    ) {
      await msal.handleRedirectPromise();
      return msal.acquireTokenPopup(popupRequest);
    }
    throw error;
  }
}

async function acquireTokenInteractive(
  msal: PublicClientApplication,
  scopes: string[],
  options?: Pick<AcquireDelegatedTokenOptions, "prompt" | "loginHint">,
): Promise<AuthenticationResult> {
  if (interactiveTokenPromise) {
    return interactiveTokenPromise;
  }

  interactiveTokenPromise = runInteractiveTokenFlow(msal, scopes, options).finally(() => {
    interactiveTokenPromise = null;
  });

  return interactiveTokenPromise;
}

export async function acquireDelegatedToken(
  bootstrap: AzureMsalBootstrap,
  fallbackScopes: string[],
  options?: AcquireDelegatedTokenOptions,
): Promise<AuthenticationResult> {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    const httpsOrigin = window.location.origin.replace(/^http:/i, "https:");
    throw new Error(
      `O vínculo Microsoft exige HTTPS (Web Crypto). Acesse ${httpsOrigin}, aceite o certificado de desenvolvimento e tente «Vincular conta» novamente.`,
    );
  }

  const msal = getOrCreateMsalInstance(bootstrap);
  if (!msal) {
    throw new Error("Configuração MSAL indisponível — preencha azure_ad.* no admin.");
  }

  await msal.initialize();
  await msal.handleRedirectPromise();

  const scopes = normalizeMsalScopes(
    bootstrap.delegatedScopes.length > 0 ? bootstrap.delegatedScopes : fallbackScopes,
  );

  if (!options?.forceInteractive) {
    const account = msal.getAllAccounts()[0];
    if (account) {
      try {
        return await msal.acquireTokenSilent({ scopes, account });
      } catch {
        // Fall through to interactive consent.
      }
    }
  }

  return acquireTokenInteractive(msal, scopes, {
    prompt: options?.prompt ?? (options?.forceInteractive ? "consent" : undefined),
    loginHint: options?.loginHint,
  });
}
