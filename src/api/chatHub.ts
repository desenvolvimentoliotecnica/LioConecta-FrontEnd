import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { getHubAccessToken } from "./hubAuth";
import { HUB_LOG_LEVEL, HUB_STOP_GRACE_MS, isBenignHubStopError } from "./hubLifecycle";
import type { ChatConversationDto, ChatMessageDto } from "./types";

const HUB_URL = "/hubs/chat";
const MESSAGE_EVENT = "ChatMessageReceived";
const CONVERSATION_EVENT = "ChatConversationUpdated";

type MessageListener = (payload: { conversationId: string; message: ChatMessageDto }) => void;
type ConversationListener = (conversation: ChatConversationDto) => void;

let connection: HubConnection | null = null;
let startPromise: Promise<void> | null = null;
let stopTimer: ReturnType<typeof setTimeout> | null = null;
const messageListeners = new Set<MessageListener>();
const conversationListeners = new Set<ConversationListener>();

function cancelScheduledStop() {
  if (stopTimer != null) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }
}

function hasListeners() {
  return messageListeners.size > 0 || conversationListeners.size > 0;
}

function buildConnection(): HubConnection {
  return new HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: getHubAccessToken,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10_000, 30_000])
    .configureLogging(HUB_LOG_LEVEL)
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
      if (isBenignHubStopError(error)) {
        return;
      }
      if (attempt < START_MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, START_RETRY_MS * attempt));
      }
    }
  }
  throw lastError;
}

async function ensureStarted(): Promise<HubConnection> {
  cancelScheduledStop();

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
    const conn = connection;
    startPromise = startWithRetry(conn)
      .catch((error) => {
        startPromise = null;
        if (isBenignHubStopError(error)) {
          return;
        }
        throw error;
      })
      .then(() => {
        startPromise = null;
      });
  }

  await startPromise;
  return connection;
}

function scheduleStopIfIdle() {
  if (hasListeners() || !connection) {
    return;
  }

  cancelScheduledStop();
  const conn = connection;
  stopTimer = setTimeout(() => {
    stopTimer = null;
    if (hasListeners()) {
      return;
    }
    void conn.stop().catch(() => {
      // Ignore abort while tearing down an in-flight negotiate.
    });
    if (connection === conn) {
      connection = null;
      startPromise = null;
    }
  }, HUB_STOP_GRACE_MS);
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
  cancelScheduledStop();

  void ensureStarted().catch((error) => {
    if (!isBenignHubStopError(error)) {
      // Real failures surface on next remount / invalidate.
    }
  });

  return () => {
    if (listener.onMessage) {
      messageListeners.delete(listener.onMessage);
    }
    if (listener.onConversation) {
      conversationListeners.delete(listener.onConversation);
    }
    scheduleStopIfIdle();
  };
}

export async function startChatHub(): Promise<void> {
  await ensureStarted();
}
