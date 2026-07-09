import { useEffect } from "react";
import { Link } from "react-router-dom";
import type { UniLioQuestionSummary } from "../../config/unilio/types";
import { formatUniLioDateTime } from "../../utils/unilioView";

type Props = {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  onAskQuestion: () => void;
  items: UniLioQuestionSummary[];
  isLoading?: boolean;
  moduleTitle?: string;
};

function statusLabel(status: string) {
  if (status === "answered") return "Respondida";
  if (status === "closed") return "Encerrada";
  return "Aguardando resposta";
}

export function UniLioModuleQuestionsDrawer({
  open,
  onClose,
  onOpen,
  onAskQuestion,
  items,
  isLoading,
  moduleTitle,
}: Props) {
  const openCount = items.filter((item) => item.status === "open").length;
  const unreadCount = items.filter((item) => item.unread).length;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      {!open && items.length > 0 ? (
        <button
          type="button"
          className="unilio-module-questions-drawer__tab"
          onClick={onOpen}
          aria-label={`Abrir dúvidas do módulo (${items.length})`}
          title="Dúvidas deste módulo"
        >
          <i className="fa-solid fa-circle-question" aria-hidden="true" />
          <span className="unilio-module-questions-drawer__tab-label">Dúvidas</span>
          <span className="unilio-module-questions-drawer__tab-count">{items.length}</span>
        </button>
      ) : null}

      <div
        className={`unilio-module-questions-drawer${open ? " is-open" : ""}`}
        aria-hidden={!open}
      >
        {open ? (
          <button
            type="button"
            className="unilio-module-questions-drawer__backdrop"
            aria-label="Fechar dúvidas"
            onClick={onClose}
          />
        ) : null}

        <aside
          className="unilio-module-questions-drawer__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unilio-module-questions-drawer-title"
          aria-hidden={!open}
        >
          <header className="unilio-module-questions-drawer__header">
            <div>
              <h2 id="unilio-module-questions-drawer-title" className="unilio-module-questions-drawer__title">
                <i className="fa-solid fa-circle-question" aria-hidden="true" /> Dúvidas do módulo
              </h2>
              {moduleTitle ? (
                <p className="unilio-module-questions-drawer__subtitle">{moduleTitle}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="unilio-module-questions-drawer__close"
              onClick={onClose}
              aria-label="Fechar"
            >
              &times;
            </button>
          </header>

          <div className="unilio-module-questions-drawer__body">
            {isLoading ? (
              <p className="unilio-module-questions__loading">Carregando dúvidas…</p>
            ) : items.length === 0 ? (
              <div className="unilio-module-questions-drawer__empty">
                <p>Nenhuma dúvida neste módulo ainda.</p>
                <p className="unilio-module-questions-drawer__empty-hint">
                  Envie uma pergunta ao instrutor sobre o conteúdo.
                </p>
              </div>
            ) : (
              <ul className="unilio-module-questions__list">
                {items.map((item) => (
                  <li key={item.id} className="unilio-module-questions__item">
                    <div className="unilio-module-questions__item-head">
                      <span className="unilio-module-questions__author">{item.authorName}</span>
                      <span className="unilio-module-questions__meta">
                        {formatUniLioDateTime(item.createdAt)}
                        {item.visibility === "public" ? " · FAQ pública" : " · Privada"}
                      </span>
                      {item.unread ? (
                        <span className="unilio-module-questions__badge">Nova resposta</span>
                      ) : null}
                    </div>
                    <p className="unilio-module-questions__body">{item.body}</p>
                    {item.lastInstructorReply ? (
                      <div className="unilio-questions-inbox__bubble unilio-questions-inbox__bubble--instructor">
                        <strong>Instrutor</strong>
                        <p style={{ margin: "0.35rem 0 0" }}>{item.lastInstructorReply}</p>
                        {item.lastInstructorReplyAt ? (
                          <small>{formatUniLioDateTime(item.lastInstructorReplyAt)}</small>
                        ) : null}
                      </div>
                    ) : null}
                    <span className="unilio-module-questions__status">{statusLabel(item.status)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <footer className="unilio-module-questions-drawer__footer">
            <button type="button" className="unilio-player__help-btn" onClick={onAskQuestion}>
              <i className="fa-solid fa-plus" aria-hidden="true" />
              Nova dúvida
            </button>
            <Link to="/unilio/minhas-duvidas" className="unilio-module-questions__link">
              Minhas dúvidas
              {unreadCount > 0 ? (
                <span className="unilio-questions-inbox__unread" style={{ marginLeft: "0.35rem" }}>
                  {unreadCount}
                </span>
              ) : null}
            </Link>
            {openCount > 0 ? (
              <span className="unilio-module-questions-drawer__footer-meta">
                {openCount} aguardando resposta
              </span>
            ) : null}
          </footer>
        </aside>
      </div>
    </>
  );
}
