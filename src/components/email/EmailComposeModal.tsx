import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSendEmail, useUploadEmailAttachment } from "../../api/hooks/useSendEmail";
import { ApiError } from "../../api/client";
import type { EmailAttachmentUploadDto, EmailComposeOpenOptions, EmailRecipient, SendEmailResponse } from "../../api/types";
import "../../styles/email-compose-modal.css";
import { RichTextEditor } from "./RichTextEditor";

export type EmailComposeModalProps = {
  open: boolean;
  onClose: () => void;
  onSent?: (result: SendEmailResponse) => void;
  defaults?: EmailComposeOpenOptions;
};

type PendingAttachment = EmailAttachmentUploadDto & { localName: string };

function parseAddressList(value: string): string[] {
  return value
    .split(/[,;]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function formatRecipients(recipients: EmailRecipient[]): string {
  return recipients
    .map((recipient) => (recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email))
    .join(", ");
}

function buildMailtoLink(to: EmailRecipient[], subject: string, bodyHtml: string): string {
  const toParam = encodeURIComponent(to.map((r) => r.email).join(","));
  const subjectParam = encodeURIComponent(subject);
  const plain = bodyHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const bodyParam = encodeURIComponent(plain);
  return `mailto:${toParam}?subject=${subjectParam}&body=${bodyParam}`;
}

export function EmailComposeModal({ open, onClose, onSent, defaults }: EmailComposeModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendEmail = useSendEmail();
  const uploadAttachment = useUploadEmailAttachment();

  const [toRecipients, setToRecipients] = useState<EmailRecipient[]>([]);
  const [toInput, setToInput] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("<p></p>");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const lockedTo = defaults?.lockedTo ?? false;
  const showExternalMailtoLink = defaults?.showExternalMailtoLink ?? true;

  useEffect(() => {
    if (!open) return;

    const initialTo = defaults?.to ?? [];
    setToRecipients(initialTo);
    setToInput(initialTo.length ? formatRecipients(initialTo) : "");
    setSubject(defaults?.subject ?? "");
    setBodyHtml(defaults?.bodyHtml ?? "<p></p>");
    setAttachments([]);
    setFeedback(null);
    sendEmail.reset();
    uploadAttachment.reset();
  }, [open, defaults]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const isBusy = sendEmail.isPending || uploadAttachment.isPending;

  const mailtoHref = useMemo(() => {
    if (!toRecipients.length) return "#";
    return buildMailtoLink(toRecipients, subject, bodyHtml);
  }, [toRecipients, subject, bodyHtml]);

  const handleAddAttachments = async (files: FileList | null) => {
    if (!files?.length) return;
    if (attachments.length >= 5) {
      setFeedback({ type: "error", message: "Máximo de 5 anexos por envio." });
      return;
    }

    for (const file of Array.from(files)) {
      if (attachments.length >= 5) break;
      if (file.size > 10 * 1024 * 1024) {
        setFeedback({ type: "error", message: `${file.name} excede 10 MB.` });
        continue;
      }

      try {
        const uploaded = await uploadAttachment.mutateAsync(file);
        setAttachments((current) => [...current, { ...uploaded, localName: file.name }]);
      } catch {
        setFeedback({ type: "error", message: `Falha ao anexar ${file.name}.` });
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    setFeedback(null);

    const resolvedTo = lockedTo
      ? toRecipients
      : parseAddressList(toInput).map((email) => ({ email }));

    if (!resolvedTo.length) {
      setFeedback({ type: "error", message: "Informe ao menos um destinatário." });
      return;
    }

    if (!subject.trim()) {
      setFeedback({ type: "error", message: "Informe o assunto." });
      return;
    }

    const plain = bodyHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!plain) {
      setFeedback({ type: "error", message: "Escreva o corpo do e-mail." });
      return;
    }

    try {
      const result = await sendEmail.mutateAsync({
        to: defaults?.recipientSlug ? null : resolvedTo.map((r) => r.email),
        recipientSlug: defaults?.recipientSlug ?? null,
        subject: subject.trim(),
        bodyHtml,
        cc: defaults?.cc ?? [],
        bcc: defaults?.bcc ?? [],
        attachmentIds: attachments.map((item) => item.id),
        source: defaults?.source ?? "compose",
      });

      setFeedback({ type: "success", message: "E-mail enfileirado para envio." });
      onSent?.(result);
      window.setTimeout(onClose, 900);
    } catch (error) {
      let message = "Não foi possível enviar o e-mail.";
      if (error instanceof ApiError) {
        const body = error.body as { message?: string } | undefined;
        message = body?.message ?? error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setFeedback({ type: "error", message });
    }
  };

  if (!open) return null;

  const recipientSummary =
    toRecipients.length === 1
      ? toRecipients[0]?.name
        ? `${toRecipients[0].name} · ${toRecipients[0].email}`
        : toRecipients[0].email
      : toRecipients.length > 1
        ? formatRecipients(toRecipients)
        : "Composição de mensagem";

  return createPortal(
    <div className="email-compose-modal__backdrop" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="email-compose-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-compose-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="email-compose-modal__header">
          <div className="email-compose-modal__header-main">
            <div className="email-compose-modal__header-icon" aria-hidden="true">
              <i className="fa-solid fa-envelope" />
            </div>
            <div>
              <h2 id="email-compose-title" className="email-compose-modal__title">
                Novo e-mail
              </h2>
              <p className="email-compose-modal__subtitle">{recipientSummary}</p>
            </div>
          </div>
          <button type="button" className="email-compose-modal__close" onClick={onClose} aria-label="Fechar">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <div className="email-compose-modal__body">
          {feedback ? (
            <div className={`email-compose-modal__feedback email-compose-modal__feedback--${feedback.type}`} role="status">
              <i
                className={`fa-solid ${feedback.type === "success" ? "fa-circle-check" : "fa-circle-exclamation"}`}
                aria-hidden="true"
              />
              <span>{feedback.message}</span>
            </div>
          ) : null}

          {!lockedTo ? (
            <div className="email-compose-modal__field">
              <label className="email-compose-modal__label" htmlFor="email-compose-to">
                <i className="fa-regular fa-user" aria-hidden="true" /> Para
              </label>
              <input
                id="email-compose-to"
                className="email-compose-modal__input"
                type="text"
                value={toInput}
                onChange={(event) => setToInput(event.target.value)}
                placeholder="email@liotecnica.com.br"
                disabled={isBusy}
              />
            </div>
          ) : null}

          <div className="email-compose-modal__field">
            <label className="email-compose-modal__label" htmlFor="email-compose-subject" aria-label="Assunto" title="Assunto">
              <i className="fa-solid fa-tag" aria-hidden="true" />
            </label>
            <input
              id="email-compose-subject"
              className="email-compose-modal__input"
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Assunto da mensagem"
              disabled={isBusy}
            />
          </div>

          <div className="email-compose-modal__field email-compose-modal__field--message">
            <span className="email-compose-modal__label" aria-label="Mensagem" title="Mensagem">
              <i className="fa-regular fa-message" aria-hidden="true" />
            </span>
            <RichTextEditor value={bodyHtml} onChange={setBodyHtml} disabled={isBusy} />
          </div>

          <div className="email-compose-modal__field email-compose-modal__field--attachments">
            <span className="email-compose-modal__label" aria-label="Anexos" title="Anexos">
              <i className="fa-solid fa-paperclip" aria-hidden="true" />
            </span>
            <div className="email-compose-modal__attachments">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={(event) => void handleAddAttachments(event.target.files)}
              />
              <button
                type="button"
                className="email-compose-modal__attach-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy || attachments.length >= 5}
              >
                <i className="fa-solid fa-cloud-arrow-up" aria-hidden="true" /> Selecionar arquivos
              </button>
              <p className="email-compose-modal__attach-hint">Até 5 arquivos · máx. 10 MB cada</p>
              {attachments.length ? (
                <div className="email-compose-modal__attachment-list">
                  {attachments.map((item) => (
                    <div key={item.id} className="email-compose-modal__attachment-item">
                      <span className="email-compose-modal__attachment-meta">
                        <i className="fa-regular fa-file-lines" aria-hidden="true" />
                        <span>
                          {item.fileName} · {Math.max(1, Math.round(item.sizeBytes / 1024))} KB
                        </span>
                      </span>
                      <button
                        type="button"
                        className="email-compose-modal__attachment-remove"
                        onClick={() => setAttachments((current) => current.filter((a) => a.id !== item.id))}
                        disabled={isBusy}
                        aria-label={`Remover ${item.fileName}`}
                      >
                        <i className="fa-solid fa-xmark" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <footer className="email-compose-modal__footer">
          {showExternalMailtoLink && toRecipients.length ? (
            <a className="email-compose-modal__footer-link" href={mailtoHref}>
              <i className="fa-brands fa-microsoft" aria-hidden="true" /> Abrir no Outlook
            </a>
          ) : (
            <span aria-hidden="true" />
          )}
          <div className="email-compose-modal__footer-actions">
            <button type="button" className="email-compose-modal__btn" onClick={onClose} disabled={isBusy}>
              Cancelar
            </button>
            <button
              type="button"
              className="email-compose-modal__btn email-compose-modal__btn--primary"
              onClick={() => void handleSend()}
              disabled={isBusy}
            >
              <i className="fa-solid fa-paper-plane" aria-hidden="true" />
              {isBusy ? "Enviando…" : "Enviar"}
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
