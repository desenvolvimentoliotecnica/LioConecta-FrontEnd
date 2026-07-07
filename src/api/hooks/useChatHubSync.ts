import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { subscribeToChatHub } from "../chatHub";
import { config } from "../client";
import { hasPortalSession } from "../hubAuth";
import {
  CHAT_CONVERSATIONS_QUERY_KEY,
  CHAT_STATUS_QUERY_KEY,
  chatMessagesQueryKey,
  useChatBootstrap,
} from "./useChat";

export function useChatHubSync() {
  const queryClient = useQueryClient();
  const { data: bootstrap } = useChatBootstrap();

  useEffect(() => {
    if (config.useMock || !hasPortalSession() || !bootstrap?.enabled || !bootstrap.signalREnabled) {
      return;
    }

    return subscribeToChatHub({
      onMessage: ({ conversationId }) => {
        void queryClient.invalidateQueries({ queryKey: chatMessagesQueryKey(conversationId) });
        void queryClient.invalidateQueries({ queryKey: CHAT_CONVERSATIONS_QUERY_KEY });
      },
      onConversation: () => {
        void queryClient.invalidateQueries({ queryKey: CHAT_CONVERSATIONS_QUERY_KEY });
        void queryClient.invalidateQueries({ queryKey: CHAT_STATUS_QUERY_KEY });
      },
    });
  }, [queryClient, bootstrap?.enabled, bootstrap?.signalREnabled]);
}
