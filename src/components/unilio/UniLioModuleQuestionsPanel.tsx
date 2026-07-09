import { Link } from "react-router-dom";
import type { UniLioQuestionSummary } from "../../config/unilio/types";
import { formatUniLioDateTime } from "../../utils/unilioView";

type Props = {
  items: UniLioQuestionSummary[];
  isLoading?: boolean;
};

function statusLabel(status: string) {
  if (status === "answered") return "Respondida";
  if (status === "closed") return "Encerrada";
  return "Aguardando resposta";
}

export function UniLioModuleQuestionsPanel({ items, isLoading }: Props) {
  if (isLoading) {
    return (
      <section className="unilio-module-questions">
        <p className="unilio-module-questions__loading">Carregando dúvidas…</p>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="unilio-module-questions" aria-label="Dúvidas do módulo">
      <div className="unilio-module-questions__head">
        <h2 className="unilio-module-questions__title">
          <i className="fa-solid fa-circle-question" aria-hidden="true" /> Dúvidas deste módulo
        </h2>
        <Link to="/unilio/minhas-duvidas" className="unilio-module-questions__link">
          Ver todas as minhas dúvidas
        </Link>
      </div>

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
    </section>
  );
}
