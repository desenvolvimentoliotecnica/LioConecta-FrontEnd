import { createContext, useCallback, useContext, useMemo, useReducer, useState, type ReactNode } from "react";
import {
  useChatBootstrap,
  useChatConversations,
  useChatStatus,
  useCreateChatConversation,
  useSendChatMessage,
} from "../../api/hooks/useChat";
import { useMe } from "../../api/hooks/useMe";
import { mapConversationDto } from "./chatMappers";
import type { ChatConversation } from "./chatTypes";

type ListView = "hidden" | "minimized" | "expanded";

type ListState = {
  view: ListView;
};

type ListAction =
  | { type: "toggle" }
  | { type: "open" }
  | { type: "close" }
  | { type: "minimize" }
  | { type: "expand" };

function listReducer(state: ListState, action: ListAction): ListState {
  switch (action.type) {
    case "toggle":
      if (state.view === "hidden") return { view: "expanded" };
      if (state.view === "expanded") return { view: "minimized" };
      return { view: "hidden" };
    case "open":
      return { view: "expanded" };
    case "close":
      return { view: "hidden" };
    case "minimize":
      return state.view === "hidden" ? state : { view: "minimized" };
    case "expand":
      return state.view === "hidden" ? state : { view: "expanded" };
    default:
      return state;
  }
}

type ChatContextValue = {
  enabled: boolean;
  needsConsent: boolean;
  linked: boolean;
  currentUserId?: string;
  conversations: ChatConversation[];
  conversationsLoading: boolean;
  conversationsError: boolean;
  listOpen: boolean;
  listMinimized: boolean;
  activeTab: "priority" | "other";
  searchQuery: string;
  openWindows: string[];
  totalUnread: number;
  toggleList: () => void;
  openList: () => void;
  closeList: () => void;
  setListMinimized: (v: boolean) => void;
  setActiveTab: (tab: "priority" | "other") => void;
  setSearchQuery: (q: string) => void;
  openConversation: (id: string) => void;
  openConversationByEmail: (email: string) => Promise<void>;
  closeConversation: (id: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  getConversation: (id: string) => ChatConversation | undefined;
  filteredConversations: ChatConversation[];
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { data: bootstrap } = useChatBootstrap();
  const { data: status } = useChatStatus();
  const {
    data: conversationDtos = [],
    isLoading: conversationsLoading,
    isError: conversationsError,
  } = useChatConversations();
  const { data: me } = useMe();
  const sendChatMessage = useSendChatMessage();
  const createConversation = useCreateChatConversation();

  const enabled = Boolean(bootstrap?.enabled);
  const needsConsent = Boolean(status?.needsConsent);
  const linked = Boolean(status?.linked);

  const conversations = useMemo(
    () => conversationDtos.map(mapConversationDto),
    [conversationDtos],
  );

  const [{ view: listView }, dispatchList] = useReducer(listReducer, { view: "hidden" });
  const listOpen = listView !== "hidden";
  const listMinimized = listView === "minimized";
  const [activeTab, setActiveTab] = useState<"priority" | "other">("priority");
  const [searchQuery, setSearchQuery] = useState("");
  const [openWindows, setOpenWindows] = useState<string[]>([]);
  const [readConversationIds, setReadConversationIds] = useState<Set<string>>(() => new Set());

  const totalUnread = useMemo(
    () =>
      conversations.reduce(
        (sum, c) => sum + (readConversationIds.has(c.id) ? 0 : c.unreadCount),
        0,
      ),
    [conversations, readConversationIds],
  );

  const toggleList = useCallback(() => {
    dispatchList({ type: "toggle" });
  }, []);

  const openList = useCallback(() => {
    dispatchList({ type: "open" });
  }, []);

  const closeList = useCallback(() => {
    dispatchList({ type: "close" });
  }, []);

  const setListMinimized = useCallback((v: boolean) => {
    dispatchList({ type: v ? "minimize" : "expand" });
  }, []);

  const openConversation = useCallback((id: string) => {
    dispatchList({ type: "open" });
    setOpenWindows((prev) => (prev.includes(id) ? prev : [...prev, id].slice(-3)));
    setReadConversationIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const openConversationByEmail = useCallback(
    async (email: string) => {
      const normalized = email.trim().toLowerCase();
      if (!normalized) return;

      const existing = conversations.find((c) =>
        c.participantEmails.some((participantEmail) => participantEmail.toLowerCase() === normalized),
      );
      if (existing) {
        openConversation(existing.id);
        return;
      }

      const created = await createConversation.mutateAsync({ targetEmail: normalized });
      openConversation(created.id);
    },
    [conversations, createConversation, openConversation],
  );

  const closeConversation = useCallback((id: string) => {
    setOpenWindows((prev) => prev.filter((w) => w !== id));
  }, []);

  const sendMessage = useCallback(
    (conversationId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      sendChatMessage.mutate({ conversationId, text: trimmed });
    },
    [sendChatMessage],
  );

  const getConversation = useCallback(
    (id: string) => conversations.find((c) => c.id === id),
    [conversations],
  );

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return conversations.filter((c) => {
      const matchesTab = activeTab === "priority" ? c.priority : !c.priority;
      const matchesSearch =
        !q || c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [conversations, activeTab, searchQuery]);

  const value = useMemo<ChatContextValue>(
    () => ({
      enabled,
      needsConsent,
      linked,
      currentUserId: me?.id,
      conversations,
      conversationsLoading,
      conversationsError,
      listOpen,
      listMinimized,
      activeTab,
      searchQuery,
      openWindows,
      totalUnread,
      toggleList,
      openList,
      closeList,
      setListMinimized,
      setActiveTab,
      setSearchQuery,
      openConversation,
      openConversationByEmail,
      closeConversation,
      sendMessage,
      getConversation,
      filteredConversations,
    }),
    [
      enabled,
      needsConsent,
      linked,
      me?.id,
      conversations,
      conversationsLoading,
      conversationsError,
      listOpen,
      listMinimized,
      activeTab,
      searchQuery,
      openWindows,
      totalUnread,
      toggleList,
      openList,
      closeList,
      setListMinimized,
      openConversation,
      openConversationByEmail,
      closeConversation,
      sendMessage,
      getConversation,
      filteredConversations,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}

declare global {
  interface Window {
    LioChat?: {
      enabled: boolean;
      open: () => void;
      openConversation: (id: string) => void;
      openConversationByEmail: (email: string) => void;
    };
  }
}

export function useChatWindowApi() {
  const { openList, openConversation, openConversationByEmail, enabled } = useChat();

  return useMemo(
    () => ({
      enabled,
      open: () => {
        if (!enabled) return;
        openList();
      },
      openConversation: (id: string) => {
        if (!enabled) return;
        openConversation(id);
      },
      openConversationByEmail: (email: string) => {
        if (!enabled) return;
        void openConversationByEmail(email);
      },
    }),
    [enabled, openList, openConversation, openConversationByEmail],
  );
}
