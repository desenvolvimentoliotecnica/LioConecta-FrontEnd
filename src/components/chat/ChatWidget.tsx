import { useEffect, useRef, useState } from "react";
import { useChatMessages } from "../../api/hooks/useChat";
import { closeOtherMenus, useMenuCloseSync } from "../layout/NotificationsMenu";
import { useChat } from "./ChatContext";
import { ChatTeamsLinkBanner } from "./ChatTeamsLinkBanner";
import { mapMessageDtos } from "./chatMappers";
import type { ChatConversation } from "./chatTypes";

function ChatWindow({ conversationId }: { conversationId: string }) {
  const { getConversation, closeConversation, sendMessage, currentUserId, linked, needsConsent } =
    useChat();
  const conversation = getConversation(conversationId);
  const {
    data: messageDtos = [],
    isLoading,
    isError,
  } = useChatMessages(linked && !needsConsent ? conversationId : null);
  const messages = mapMessageDtos(messageDtos);
  const [draft, setDraft] = useState("");
  const [expanded, setExpanded] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages.length]);

  if (!conversation) return null;

  const canSend = draft.trim().length > 0 && linked && !needsConsent;

  const handleSend = () => {
    if (!canSend) return;
    sendMessage(conversationId, draft);
    setDraft("");
  };

  return (
    <div className={`chat-window${expanded ? " chat-window--expanded" : ""}`}>
      <header className="chat-window__header">
        <div className="chat-window__header-user">
          <img className="chat-window__header-avatar" src={conversation.avatar} alt="" />
          <span className="chat-window__header-name">{conversation.name}</span>
        </div>
        <div className="chat-window__header-actions">
          <button className="chat-widget__icon-btn" type="button" aria-label="Mais opções">
            <i className="fa-solid fa-ellipsis" aria-hidden="true" />
          </button>
          <button
            className="chat-widget__icon-btn"
            type="button"
            aria-label={expanded ? "Restaurar" : "Expandir"}
            onClick={() => setExpanded((v) => !v)}
          >
            <i
              className={`fa-solid ${expanded ? "fa-down-left-and-up-right-to-center" : "fa-up-right-and-down-left-from-center"}`}
              aria-hidden="true"
            />
          </button>
          <button
            className="chat-widget__icon-btn"
            type="button"
            aria-label="Fechar conversa"
            onClick={() => closeConversation(conversationId)}
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="chat-window__profile">
        <img className="chat-window__profile-avatar" src={conversation.avatar} alt="" />
        <div className="chat-window__profile-info">
          <div className="chat-window__profile-name-row">
            <strong>{conversation.name}</strong>
          </div>
        </div>
      </div>

      <div className="chat-window__history" ref={historyRef}>
        {isLoading ? <p className="chat-window__state">Carregando mensagens…</p> : null}
        {isError ? (
          <p className="chat-window__state chat-window__state--error">
            Não foi possível carregar as mensagens.
          </p>
        ) : null}
        {!isLoading && !isError && messages.length === 0 ? (
          <p className="chat-window__state">Nenhuma mensagem ainda.</p>
        ) : null}
        {messages.map((msg, idx) => {
          const showDate =
            msg.dateLabel && (idx === 0 || messages[idx - 1]?.dateLabel !== msg.dateLabel);
          const isMine = Boolean(currentUserId && msg.senderId === currentUserId);
          const avatar = msg.authorPhotoUrl ?? conversation.avatar;
          const authorName = msg.authorDisplayName ?? conversation.name;

          return (
            <div key={msg.id}>
              {showDate ? <div className="chat-window__date-sep">{msg.dateLabel}</div> : null}
              <div className={`chat-window__msg${isMine ? " chat-window__msg--mine" : ""}`}>
                {!isMine ? <img className="chat-window__msg-avatar" src={avatar} alt="" /> : null}
                <div className="chat-window__msg-body">
                  {!isMine ? (
                    <div className="chat-window__msg-meta">
                      <strong>{authorName}</strong>
                      <time>{msg.timestamp}</time>
                    </div>
                  ) : null}
                  <p className="chat-window__msg-text">{msg.text}</p>
                  {isMine ? <time className="chat-window__msg-time">{msg.timestamp}</time> : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="chat-window__composer">
        {needsConsent ? (
          <p className="chat-window__composer-hint">Vincule sua conta do Teams para enviar mensagens.</p>
        ) : null}
        <textarea
          className="chat-window__input"
          placeholder="Escreva uma mensagem"
          rows={3}
          value={draft}
          disabled={!linked || needsConsent}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <div className="chat-window__toolbar">
          <div className="chat-window__toolbar-right">
            <button
              className={`chat-window__send${canSend ? " chat-window__send--active" : ""}`}
              type="button"
              disabled={!canSend}
              onClick={handleSend}
            >
              Enviar
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ConversationItem({
  conversation,
  selected,
  onSelect,
}: {
  conversation: ChatConversation;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`chat-list__item${selected ? " chat-list__item--selected" : ""}${conversation.unreadCount > 0 ? " chat-list__item--unread" : ""}`}
      onClick={onSelect}
    >
      <img className="chat-list__avatar" src={conversation.avatar} alt="" />
      <div className="chat-list__body">
        <div className="chat-list__row">
          <strong className="chat-list__name">{conversation.name}</strong>
          <time className="chat-list__date">{conversation.lastMessageDate}</time>
        </div>
        <p className="chat-list__preview">{conversation.lastMessage}</p>
      </div>
      {conversation.unreadCount > 0 ? (
        <span className="chat-list__badge">{conversation.unreadCount}</span>
      ) : null}
    </button>
  );
}

function MessagingListHeader({
  minimized,
  onToggleMinimize,
}: {
  minimized: boolean;
  onToggleMinimize: () => void;
}) {
  const expand = () => onToggleMinimize();

  const left = (
    <>
      <span className="chat-list__header-avatar-wrap chat-list__header-avatar-wrap--brand">
        <span className="chat-list__header-avatar-letter" aria-hidden="true">
          L
        </span>
        <span className="chat-list__online-dot" aria-hidden="true" />
      </span>
      <h2 className="chat-list__title">Mensagens</h2>
    </>
  );

  return (
    <header className="chat-list__header">
      {minimized ? (
        <button
          type="button"
          className="chat-list__header-left chat-list__header-left--clickable"
          onClick={expand}
          aria-label="Expandir mensagens"
        >
          {left}
        </button>
      ) : (
        <div className="chat-list__header-left">{left}</div>
      )}
      <div className="chat-list__header-actions">
        <button className="chat-widget__icon-btn" type="button" aria-label="Mais opções">
          <i className="fa-solid fa-ellipsis" aria-hidden="true" />
        </button>
        <button
          className="chat-widget__icon-btn"
          type="button"
          aria-label={minimized ? "Expandir" : "Minimizar"}
          onClick={onToggleMinimize}
        >
          <i
            className={`fa-solid ${minimized ? "fa-chevron-up" : "fa-chevron-down"}`}
            aria-hidden="true"
          />
        </button>
      </div>
    </header>
  );
}

function MessagingList() {
  const {
    listOpen,
    listMinimized,
    activeTab,
    searchQuery,
    openWindows,
    needsConsent,
    linked,
    conversationsLoading,
    conversationsError,
    setListMinimized,
    setActiveTab,
    setSearchQuery,
    openConversation,
    filteredConversations,
  } = useChat();

  if (!listOpen) return null;

  return (
    <aside
      className={`chat-list${listMinimized ? " chat-list--minimized" : ""}`}
      aria-label="Lista de mensagens"
    >
      <MessagingListHeader
        minimized={listMinimized}
        onToggleMinimize={() => setListMinimized(!listMinimized)}
      />

      {!listMinimized ? (
        <>
          {needsConsent ? <ChatTeamsLinkBanner /> : null}

          <div className="chat-list__search">
            <span className="chat-list__search-icon" aria-hidden="true">
              <i className="fa-solid fa-magnifying-glass" />
            </span>
            <input
              type="search"
              className="chat-list__search-input"
              placeholder="Pesquisar mensagens"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!linked}
            />
          </div>

          <div className="chat-list__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "priority"}
              className={`chat-list__tab${activeTab === "priority" ? " chat-list__tab--active" : ""}`}
              onClick={() => setActiveTab("priority")}
            >
              Prioritárias
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "other"}
              className={`chat-list__tab${activeTab === "other" ? " chat-list__tab--active" : ""}`}
              onClick={() => setActiveTab("other")}
            >
              Outras
            </button>
          </div>

          <div className="chat-list__conversations" role="list">
            {conversationsLoading ? (
              <p className="chat-list__empty">Carregando conversas…</p>
            ) : conversationsError ? (
              <p className="chat-list__empty">Não foi possível carregar as conversas.</p>
            ) : !linked && !needsConsent ? (
              <p className="chat-list__empty">Conta do Teams não vinculada.</p>
            ) : filteredConversations.length === 0 ? (
              <p className="chat-list__empty">Nenhuma conversa encontrada.</p>
            ) : (
              filteredConversations.map((c) => (
                <ConversationItem
                  key={c.id}
                  conversation={c}
                  selected={openWindows.includes(c.id)}
                  onSelect={() => openConversation(c.id)}
                />
              ))
            )}
          </div>
        </>
      ) : null}
    </aside>
  );
}

export function ChatWidget() {
  const { enabled, openWindows, closeList } = useChat();
  useMenuCloseSync((open) => {
    if (!open) closeList();
  }, "messages");

  if (!enabled) return null;

  return (
    <div className="chat-widget" aria-live="polite">
      <div className="chat-widget__windows">
        {openWindows.map((id) => (
          <ChatWindow key={id} conversationId={id} />
        ))}
      </div>
      <MessagingList />
    </div>
  );
}

export function MessagesTrigger() {
  const { enabled, toggleList, listOpen, listMinimized, totalUnread } = useChat();
  const isActive = listOpen && !listMinimized;

  if (!enabled) return null;

  return (
    <div
      className={`chat-trigger icon-btn-wrap${isActive ? " is-open" : ""}`}
      data-badge={totalUnread > 0 ? totalUnread : undefined}
    >
      <button
        className="topbar-icon-btn chat-trigger__btn"
        type="button"
        aria-label="Mensagens"
        aria-expanded={listOpen}
        onClick={(e) => {
          e.stopPropagation();
          closeOtherMenus("messages");
          toggleList();
        }}
      >
        <i className="fa-regular fa-comment" aria-hidden="true" />
      </button>
    </div>
  );
}
