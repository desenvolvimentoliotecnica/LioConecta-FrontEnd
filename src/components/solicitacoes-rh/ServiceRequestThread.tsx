import { useEffect, useId, useRef, useState } from "react";
import {
  downloadServiceRequestAttachment,
  parseServiceRequestAttachments,
} from "../../api/hooks/useServiceRequests";
import type {
  ServiceRequestAttachmentMetaDto,
  ServiceRequestDto,
  ServiceRequestEventDto,
} from "../../api/types";
import { ServiceRequestAttachmentViewerModal } from "./ServiceRequestAttachmentViewerModal";

type Props = {
  detail: ServiceRequestDto;
  mode: "management" | "mine";
  canCompose: boolean;
  busy?: boolean;
  onSend: (message: string, files: File[]) => Promise<void>;
};

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
}

function isRhSide(ev: ServiceRequestEventDto): boolean {
  if (ev.eventType === "Message") {
    const role = ev.details?.role;
    return role === "rh";
  }
  return (
    ev.eventType === "Approved" ||
    ev.eventType === "Rejected" ||
    ev.eventType === "Finalized"
  );
}

function eventTitle(ev: ServiceRequestEventDto): string {
  switch (ev.eventType) {
    case "Submitted":
      return "Pedido enviado";
    case "Message":
      return isRhSide(ev) ? "Resposta do RH" : "Resposta do colaborador";
    case "Approved":
      return "Aprovado pelo RH";
    case "Rejected":
      return "Rejeitado pelo RH";
    case "Finalized":
      return "Atendimento finalizado pelo RH";
    case "ClosureConfirmed":
      return "Encerramento confirmado";
    case "InReview":
      return "Em análise";
    default:
      return ev.eventType;
  }
}

function eventBody(ev: ServiceRequestEventDto): string | null {
  const d = ev.details;
  if (!d) return null;
  const message = typeof d.message === "string" ? d.message.trim() : "";
  const comment = typeof d.comment === "string" ? d.comment.trim() : "";
  const reason = typeof d.reason === "string" ? d.reason.trim() : "";
  return message || comment || reason || null;
}

export function ServiceRequestThread({ detail, mode, canCompose, busy, onSend }: Props) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewer, setViewer] = useState<ServiceRequestAttachmentMetaDto | null>(null);

  useEffect(() => {
    setMessage("");
    setFiles([]);
    setError(null);
  }, [detail.id]);

  const events = [...detail.events].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const handleSend = async () => {
    setError(null);
    if (!message.trim() && files.length === 0) {
      setError("Escreva uma mensagem ou anexe um arquivo.");
      return;
    }
    try {
      await onSend(message, files);
      setMessage("");
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      const apiMessage =
        err &&
        typeof err === "object" &&
        "body" in err &&
        err.body &&
        typeof err.body === "object" &&
        "message" in (err.body as object) &&
        typeof (err.body as { message?: unknown }).message === "string"
          ? (err.body as { message: string }).message
          : null;
      setError(apiMessage || "Não foi possível enviar a resposta. Tente novamente.");
    }
  };

  const openAttachment = (att: ServiceRequestAttachmentMetaDto) => {
    setViewer(att);
  };

  const downloadAttachment = async (att: ServiceRequestAttachmentMetaDto) => {
    await downloadServiceRequestAttachment(detail.id, att.storageFileName, att.fileName);
  };

  return (
    <div className="sr-thread" data-testid="sr-thread">
      <h3 className="leave-timeline__title">Conversa</h3>
      <div className="sr-thread__list" role="log" aria-live="polite">
        {events.map((ev) => {
          const body = eventBody(ev);
          const attachments = parseServiceRequestAttachments(ev.details);
          const rhSide = isRhSide(ev);
          const bubbleClass = rhSide ? "sr-thread__bubble--rh" : "sr-thread__bubble--requester";
          return (
            <article key={ev.id} className={`sr-thread__bubble ${bubbleClass}`}>
              <header className="sr-thread__bubble-head">
                <strong>{eventTitle(ev)}</strong>
                <span>
                  {formatDateTime(ev.createdAt)}
                  {ev.actor?.name ? ` · ${ev.actor.name}` : ""}
                </span>
              </header>
              {body ? <p className="sr-thread__bubble-body">{body}</p> : null}
              {attachments.length > 0 ? (
                <ul className="sr-thread__attachments">
                  {attachments.map((att) => (
                    <li key={att.storageFileName}>
                      <button
                        type="button"
                        className="sr-thread__attachment-btn"
                        onClick={() => openAttachment(att)}
                      >
                        <i className="fa-solid fa-paperclip" aria-hidden="true" />
                        {att.fileName}
                      </button>
                      <button
                        type="button"
                        className="sr-thread__attachment-dl"
                        onClick={() => void downloadAttachment(att)}
                        aria-label={`Baixar ${att.fileName}`}
                      >
                        <i className="fa-solid fa-download" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>

      {canCompose ? (
        <div className="sr-thread__composer leave-detail__notes-box">
          <label className="leave-detail__notes-label" htmlFor={inputId}>
            {mode === "management" ? "Responder ao solicitante" : "Responder ao RH"}
          </label>
          <textarea
            id={inputId}
            className="sr-decision-box__textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            disabled={busy}
            placeholder="Escreva a observação para a outra parte…"
            data-testid="sr-reply-message"
          />
          <div className="leave-form__upload">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
              multiple
              hidden
              onChange={(e) => {
                const next = Array.from(e.target.files ?? []).slice(0, 3);
                setFiles(next);
              }}
            />
            <button
              type="button"
              className="pay-modal__btn pay-modal__btn--ghost leave-form__upload-btn"
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="fa-solid fa-paperclip" aria-hidden="true" /> Anexar
            </button>
            <p className="leave-form__upload-hint">
              PDF, PNG ou JPG · até 3 arquivos · 10 MB cada
              {files.length > 0
                ? ` · ${files.map((f) => f.name).join(", ")}`
                : ""}
            </p>
          </div>
          {error ? (
            <p className="leave-form__error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="sr-thread__composer-actions">
            <button
              type="button"
              className="pay-modal__btn"
              disabled={busy}
              data-testid="sr-reply-send"
              onClick={() => void handleSend()}
            >
              {busy ? "Enviando…" : "Enviar resposta"}
            </button>
          </div>
        </div>
      ) : null}

      <ServiceRequestAttachmentViewerModal
        open={viewer !== null}
        requestId={detail.id}
        attachment={viewer}
        onClose={() => setViewer(null)}
      />
    </div>
  );
}
