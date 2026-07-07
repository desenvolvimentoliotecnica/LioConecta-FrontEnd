import type { ChatBootstrapDto } from "../../api/types";
import { acquireDelegatedToken, type AzureMsalBootstrap } from "../../auth/azureMsal";

export async function acquireTeamsChatToken(bootstrap: ChatBootstrapDto) {
  const msalBootstrap: AzureMsalBootstrap = {
    msalClientId: bootstrap.msalClientId,
    msalTenantId: bootstrap.msalTenantId,
    msalAuthority: bootstrap.msalAuthority,
    delegatedScopes: bootstrap.delegatedScopes,
  };

  return acquireDelegatedToken(msalBootstrap, [
    "Chat.ReadWrite",
    "ChatMessage.Send",
    "User.Read",
    "offline_access",
  ]);
}
