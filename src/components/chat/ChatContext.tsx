import { createContext, useCallback, useContext, useMemo, useReducer, useState, type ReactNode } from "react";
import { CURRENT_USER_ID, MOCK_CONVERSATIONS, type ChatConversation, type ChatMessage } from "./mockData";

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
  conversations: ChatConversation[];
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
  closeConversation: (id: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  getConversation: (id: string) => ChatConversation | undefined;
  filteredConversations: ChatConversation[];
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [{ view: listView }, dispatchList] = useReducer(listReducer, { view: "hidden" });
  const listOpen = listView !== "hidden";
  const listMinimized = listView === "minimized";
  const [activeTab, setActiveTab] = useState<"priority" | "other">("priority");
  const [searchQuery, setSearchQuery] = useState("");
  const [openWindows, setOpenWindows] = useState<string[]>([]);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations]
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
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  const closeConversation = useCallback((id: string) => {
    setOpenWindows((prev) => prev.filter((w) => w !== id));
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const now = new Date();
    const timestamp = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: CURRENT_USER_ID,
      text: trimmed,
      timestamp,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              lastMessage: trimmed,
              lastMessageDate: "Agora",
            }
          : c
      )
    );
  }, []);

  const getConversation = useCallback(
    (id: string) => conversations.find((c) => c.id === id),
    [conversations]
  );

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return conversations.filter((c) => {
      const matchesTab = activeTab === "priority" ? c.priority : !c.priority;
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [conversations, activeTab, searchQuery]);

  const value = useMemo<ChatContextValue>(
    () => ({
      conversations,
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
      closeConversation,
      sendMessage,
      getConversation,
      filteredConversations,
    }),
    [
      conversations,
      listOpen,
      listMinimized,
      activeTab,
      searchQuery,
      openWindows,
      totalUnread,
      toggleList,
      openList,
      closeList,
      openConversation,
      closeConversation,
      sendMessage,
      getConversation,
      filteredConversations,
    ]
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
      open: () => void;
      openConversation: (id: string) => void;
    };
  }
}

export function useChatWindowApi() {
  const { openList, openConversation } = useChat();

  return useMemo(
    () => ({
      open: openList,
      openConversation,
    }),
    [openList, openConversation]
  );
}
