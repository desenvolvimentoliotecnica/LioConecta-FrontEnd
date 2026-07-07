import { useMemo, useState } from "react";
import { formatWeekRangeLabel } from "../../config/facilities/menu";

type CardapioSendEmailModalProps = {
  open: boolean;
  weekStart: string;
  defaultRecipients: string[];
  sending: boolean;
  onClose: () => void;
  onSend: (payload: { recipients: string[]; includePdf: boolean }) => void;
};

function parseEmails(value: string): string[] {
  return value
    .split(/[\n,;]+/)
    .map((email) => email.trim())
    .filter(Boolean);
}

export function CardapioSendEmailModal({
  open,
  weekStart,
  defaultRecipients,
  sending,
  onClose,
  onSend,
}: CardapioSendEmailModalProps) {
  const [recipientsText, setRecipientsText] = useState(defaultRecipients.join("\n"));
  const [includePdf, setIncludePdf] = useState(true);

  const subject = useMemo(
    () => `Cardápio Semanal — ${formatWeekRangeLabel(weekStart)}`,
    [weekStart],
  );

  if (!open) return null;

  return (
    <div className="cardapio-email-modal__backdrop" role="presentation" onClick={onClose}>
      <div
        className="cardapio-email-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cardapio-email-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="cardapio-email-modal__head">
          <h2 id="cardapio-email-title">Enviar cardápio por e-mail</h2>
          <button type="button" className="cardapio-email-modal__close" onClick={onClose} aria-label="Fechar">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <div className="cardapio-email-modal__body">
          <p className="cardapio-email-modal__subject">
            <strong>Assunto:</strong> {subject}
          </p>
          <label className="cardapio-email-modal__field">
            <span>Destinatários (um por linha)</span>
            <textarea
              rows={5}
              value={recipientsText}
              onChange={(event) => setRecipientsText(event.target.value)}
              placeholder="colaborador@liotecnica.com.br"
            />
          </label>
          <label className="cardapio-email-modal__checkbox">
            <input type="checkbox" checked={includePdf} onChange={(event) => setIncludePdf(event.target.checked)} />
            Incluir PDF anexo
          </label>
        </div>

        <footer className="cardapio-email-modal__footer">
          <button type="button" className="cardapio-page__btn" onClick={onClose} disabled={sending}>
            Cancelar
          </button>
          <button
            type="button"
            className="cardapio-page__btn cardapio-page__btn--primary"
            disabled={sending}
            onClick={() => onSend({ recipients: parseEmails(recipientsText), includePdf })}
          >
            {sending ? "Enviando…" : "Enviar e-mail"}
          </button>
        </footer>
      </div>
    </div>
  );
}
