import { PublicClientApplication, type Configuration } from "@azure/msal-browser";
import { config } from "../api/client";

const msalEnabled = Boolean(config.azureClientId && config.azureTenantId);

const msalConfig: Configuration = {
  auth: {
    clientId: config.azureClientId || "00000000-0000-0000-0000-000000000000",
    authority: `https://login.microsoftonline.com/${config.azureTenantId || "common"}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage",
  },
};

export const msalInstance = msalEnabled ? new PublicClientApplication(msalConfig) : null;

export const loginRequest = {
  scopes: config.azureApiScope
    ? [config.azureApiScope]
    : ["User.Read"],
};

export function isMsalEnabled() {
  return msalEnabled;
}
