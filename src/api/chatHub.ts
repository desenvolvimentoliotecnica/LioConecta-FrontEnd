import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import type { ChatConversationDto, ChatMessageDto } from "./types";

const HUB_URL = "/hubs/chat";
const MESSAGE_EVENT = "ChatMessageReceived";
const CONVERSATION_EVENT = "ChatConversationUpdated";

type MessageListener = (payload: { conversationId: string; message: ChatMessageDto }) => void;
type ConversationListener = (conversation: ChatConversationDto) => void;

let connection: HubConnection | null = null;
let startPromise: Promise<void> | null = null;
const messageListeners = new Set<MessageListener>();
const conversationListeners = new Set<ConversationListener>();

function buildConnection(): HubConnection {
  return new HubConnectionBuilder()
    .withUrl(HUB_URL, {
      withCredentials: true,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10_000, 30_000])
    .configureLogging(import.meta.env.DEV ? LogLevel.Error : LogLevel.Warning)
    .build();
}

const START_MAX_ATTEMPTS = 3;
const START_RETRY_MS = 1500;

async function startWithRetry(conn: HubConnection): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= START_MAX_ATTEMPTS; attempt += 1) {
    try {
      await conn.start();
      return;
    } catch (error) {
      lastError = error;
      if (attempt < START_MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, START_RETRY_MS * attempt));
      }
    }
  }
  throw lastError;
}

async function ensureStarted(): Promise<HubConnection> {
  if (!connection) {
    connection = buildConnection();
    connection.on(MESSAGE_EVENT, (message: ChatMessageDto, conversationId: string) => {
      for (const listener of messageListeners) {
        listener({ conversationId, message });
      }
    });
    connection.on(CONVERSATION_EVENT, (conversation: ChatConversationDto) => {
      for (const listener of conversationListeners) {
        listener(conversation);
      }
    });
  }

  if (connection.state === "Connected") {
    return connection;
  }

  if (!startPromise) {
    startPromise = startWithRetry(connection)
      .catch((error) => {
        startPromise = null;
        throw error;
      })
      .then(() => {
        startPromise = null;
      });
  }

  await startPromise;
  return connection;
}

export function subscribeToChatHub(listener: {
  onMessage?: MessageListener;
  onConversation?: ConversationListener;
}): () => void {
  if (listener.onMessage) {
    messageListeners.add(listener.onMessage);
  }
  if (listener.onConversation) {
    conversationListeners.add(listener.onConversation);
  }

  void ensureStarted().catch(() => {
    // Connection retries on next invalidate or remount.
  });

  return () => {
    if (listener.onMessage) {
      messageListeners.delete(listener.onMessage);
    }
    if (listener.onConversation) {
      conversationListeners.delete(listener.onConversation);
    }
    if (messageListeners.size === 0 && conversationListeners.size === 0 && connection) {
      void connection.stop();
      connection = null;
      startPromise = null;
    }
  };
}

export async function startChatHub(): Promise<void> {
  await ensureStarted();
}
