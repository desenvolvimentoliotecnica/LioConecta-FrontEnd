import { useState } from "react";
import {
  useChatBootstrap,
  useLinkTeamsAccount,
} from "../../api/hooks/useChat";
import { formatLinkAccountError } from "../../auth/linkAccountErrors";
import { acquireTeamsChatToken } from "./chatMsal";

export function ChatTeamsLinkBanner() {
  const { data: bootstrap } = useChatBootstrap();
  const linkAccount = useLinkTeamsAccount();
  const [error, setError] = useState<string | null>(null);

  async function handleLink() {
    if (!bootstrap) return;
    setError(null);

    try {
      const result = await acquireTeamsChatToken(bootstrap);
      const expiresAt = result.expiresOn?.toISOString() ?? new Date(Date.now() + 3600_000).toISOString();

      await linkAccount.mutateAsync({
        accessToken: result.accessToken,
        refreshToken: "",
        expiresAt,
        scopes: result.scopes,
      });
    } catch (linkError) {
      setError(formatLinkAccountError(linkError));
    }
  }

  return (
    <div className="chat-list__teams-banner" role="note">
      <div className="chat-list__teams-banner-icon" aria-hidden="true">
        <i className="fa-brands fa-microsoft" />
      </div>
      <div className="chat-list__teams-banner-body">
        <strong>Vincule sua conta do Microsoft Teams</strong>
        <p>
          Para enviar e receber mensagens pelo portal, autorize o acesso às conversas do Teams com sua
          conta corporativa.
        </p>
        {error ? <p className="chat-list__teams-banner-error">{error}</p> : null}
      </div>
      <button
        type="button"
        className="chat-list__teams-banner-btn"
        onClick={() => void handleLink()}
        disabled={linkAccount.isPending}
      >
        {linkAccount.isPending ? "Vinculando…" : "Vincular conta"}
      </button>
    </div>
  );
}
