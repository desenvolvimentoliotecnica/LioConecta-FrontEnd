import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  ChatBootstrapDto,
  ChatConnectionTestResponse,
  ChatConversationDto,
  ChatMessageDto,
  ChatStatusDto,
  CreateChatConversationRequest,
  LinkTeamsAccountRequest,
  SendMessageRequest,
  TestChatConnectionRequest,
} from "../types";

export const CHAT_BOOTSTRAP_QUERY_KEY = ["chat", "bootstrap"] as const;
export const CHAT_STATUS_QUERY_KEY = ["chat", "status"] as const;
export const CHAT_CONVERSATIONS_QUERY_KEY = ["chat", "conversations"] as const;

export function chatMessagesQueryKey(conversationId: string) {
  return ["chat", "messages", conversationId] as const;
}

const DISABLED_BOOTSTRAP: ChatBootstrapDto = {
  enabled: false,
  authMode: "disabled",
  delegatedScopes: [],
  includeGroupChats: false,
  pollingIntervalSeconds: 60,
  signalREnabled: false,
  msalClientId: "",
  msalTenantId: "",
  msalAuthority: "",
};

export function useChatBootstrap() {
  return useQuery({
    queryKey: CHAT_BOOTSTRAP_QUERY_KEY,
    queryFn: async (): Promise<ChatBootstrapDto> => {
      if (config.useMock) {
        return DISABLED_BOOTSTRAP;
      }
      return api.get<ChatBootstrapDto>("/chat/bootstrap");
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useChatStatus() {
  const { data: bootstrap } = useChatBootstrap();

  return useQuery({
    queryKey: CHAT_STATUS_QUERY_KEY,
    queryFn: async (): Promise<ChatStatusDto> => {
      if (config.useMock || !bootstrap?.enabled) {
        return { enabled: false, linked: false, needsConsent: false };
      }
      return api.get<ChatStatusDto>("/chat/status");
    },
    enabled: Boolean(bootstrap?.enabled) && !config.useMock,
    refetchInterval: () => {
      if (config.useMock || !bootstrap?.enabled) return false;
      if (bootstrap?.signalREnabled) return false;
      const seconds = bootstrap?.pollingIntervalSeconds ?? 60;
      return Math.max(seconds, 15) * 1000;
    },
  });
}

export function useChatConversations() {
  const { data: bootstrap } = useChatBootstrap();
  const { data: status } = useChatStatus();

  return useQuery({
    queryKey: CHAT_CONVERSATIONS_QUERY_KEY,
    queryFn: async (): Promise<ChatConversationDto[]> => {
      if (config.useMock) {
        return [];
      }
      return api.get<ChatConversationDto[]>("/chat/conversations");
    },
    enabled: Boolean(bootstrap?.enabled && status?.linked) && !config.useMock,
    refetchInterval: () => {
      if (config.useMock || !bootstrap?.enabled || !status?.linked) return false;
      if (bootstrap?.signalREnabled) return false;
      const seconds = bootstrap?.pollingIntervalSeconds ?? 60;
      return Math.max(seconds, 15) * 1000;
    },
  });
}

export function useChatMessages(conversationId: string | null) {
  const { data: bootstrap } = useChatBootstrap();
  const { data: status } = useChatStatus();

  return useQuery({
    queryKey: chatMessagesQueryKey(conversationId ?? ""),
    queryFn: async (): Promise<ChatMessageDto[]> => {
      if (config.useMock || !conversationId) {
        return [];
      }
      return api.get<ChatMessageDto[]>(`/chat/conversations/${conversationId}/messages`);
    },
    enabled:
      Boolean(conversationId && bootstrap?.enabled && status?.linked) && !config.useMock,
  });
}

export function useLinkTeamsAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: LinkTeamsAccountRequest) => {
      if (config.useMock) return;
      await api.post("/chat/link-account", body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CHAT_STATUS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: CHAT_CONVERSATIONS_QUERY_KEY });
    },
  });
}

export function useCreateChatConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateChatConversationRequest) => {
      if (config.useMock) {
        throw new Error("Chat indisponível em modo mock.");
      }
      return api.post<ChatConversationDto>("/chat/conversations", body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CHAT_CONVERSATIONS_QUERY_KEY });
    },
  });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, text }: { conversationId: string; text: string }) => {
      if (config.useMock) return;
      const body: SendMessageRequest = { text };
      await api.post(`/chat/conversations/${conversationId}/messages`, body);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: chatMessagesQueryKey(variables.conversationId),
      });
      void queryClient.invalidateQueries({ queryKey: CHAT_CONVERSATIONS_QUERY_KEY });
    },
  });
}

export function useTestChatConnection() {
  return useMutation({
    mutationFn: (body: TestChatConnectionRequest = {}) =>
      api.post<ChatConnectionTestResponse>("/admin/chat/test", body),
  });
}
