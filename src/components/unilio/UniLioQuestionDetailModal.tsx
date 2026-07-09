import { Link } from "react-router-dom";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import type { UniLioQuestionDetail } from "../../config/unilio/types";
import { formatUniLioDateTime } from "../../utils/unilioView";
import "../../styles/contracheque-page.css";
import "../../styles/unilio-questions.css";

type LearnerProps = {
  mode: "learner";
  detail: UniLioQuestionDetail;
  loading?: boolean;
  moduleHref?: string;
};

type InstructorProps = {
  mode: "instructor";
  detail: UniLioQuestionDetail;
  loading?: boolean;
  replyBody: string;
  replyBusy?: boolean;
  onReplyBodyChange: (value: string) => void;
  onReply: () => void;
};

type Props = {
  open: boolean;
  onClose: () => void;
} & (LearnerProps | InstructorProps);

function statusLabel(status: string, mode: "learner" | "instructor") {
  if (status === "answered") return "Respondida";
  if (status === "closed") return "Encerrada";
  return mode === "instructor" ? "Aberta" : "Aguardando resposta";
}

function visibilityLabel(visibility: string) {
  return visibility === "public" ? "Pública (FAQ)" : "Privada";
}

export function UniLioQuestionDetailModal(props: Props) {
  const { open, onClose } = props;
  const detail = props.detail;
  const loading = props.loading;

  const contextLine =
    props.mode === "instructor"
      ? [detail.authorName, detail.courseTitle, detail.moduleTitle ?? "Curso inteiro", formatUniLioDateTime(detail.createdAt)].join(" · ")
      : [detail.courseTitle, detail.moduleTitle ?? "Curso inteiro", formatUniLioDateTime(detail.createdAt)].join(" · ");

  const footer =
    props.mode === "learner" ? (
      props.moduleHref ? (
        <Link to={props.moduleHref} className="pay-modal__btn">
          Abrir no módulo
        </Link>
      ) : (
        <Link to={`/unilio/curso/${detail.courseId}`} className="pay-modal__btn">
          Abrir curso
        </Link>
      )
    ) : detail.status !== "closed" ? (
      <button
        type="button"
        className="pay-modal__btn"
        disabled={!props.replyBody.trim() || props.replyBusy}
        onClick={props.onReply}
      >
        {props.replyBusy ? "Enviando…" : "Responder aluno"}
      </button>
    ) : undefined;

  return (
    <ContrachequeModal
      open={open}
      title="Detalhe da dúvida"
      wide
      onClose={onClose}
      footer={
        <div className="unilio-question-detail-modal__footer">
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose}>
            Fechar
          </button>
          {footer}
        </div>
      }
    >
      <div className="unilio-question-detail-modal">
        {loading ? <p className="unilio-question-detail-modal__loading">Carregando detalhe…</p> : null}
        <p className="unilio-question-detail-modal__meta">{contextLine}</p>
        <div className="unilio-question-detail-modal__badges">
          <span className="unilio-question-detail-modal__badge">{statusLabel(detail.status, props.mode)}</span>
          {props.mode === "instructor" ? (
            <span className="unilio-question-detail-modal__badge unilio-question-detail-modal__badge--muted">
              {visibilityLabel(detail.visibility)}
            </span>
          ) : null}
        </div>

        <div className="unilio-questions-inbox__thread">
          <div className="unilio-questions-inbox__bubble unilio-questions-inbox__bubble--learner">
            <strong>{detail.authorName}</strong>
            <p style={{ margin: "0.35rem 0 0" }}>{detail.body}</p>
          </div>
          {detail.replies.map((reply) => (
            <div
              key={reply.id}
              className={`unilio-questions-inbox__bubble ${
                reply.isInstructorReply
                  ? "unilio-questions-inbox__bubble--instructor"
                  : "unilio-questions-inbox__bubble--learner"
              }`}
            >
              <strong>{reply.authorName}</strong>
              <p style={{ margin: "0.35rem 0 0" }}>{reply.body}</p>
              <small>{formatUniLioDateTime(reply.createdAt)}</small>
            </div>
          ))}
        </div>

        {props.mode === "instructor" && detail.status !== "closed" ? (
          <div className="unilio-questions-inbox__reply-form">
            <label htmlFor="instructor-reply-modal">Sua resposta</label>
            <textarea
              id="instructor-reply-modal"
              value={props.replyBody}
              maxLength={2000}
              placeholder="Escreva a resposta para o aluno…"
              onChange={(e) => props.onReplyBodyChange(e.target.value)}
            />
          </div>
        ) : null}
      </div>
    </ContrachequeModal>
  );
}
