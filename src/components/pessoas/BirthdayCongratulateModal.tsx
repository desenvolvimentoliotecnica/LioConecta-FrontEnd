import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import {
  BIRTHDAY_CARD_TEMPLATES,
  defaultBirthdayMessage,
  type BirthdayCardTemplate,
} from "../../config/birthday-cards";
import type { BirthdayPersonDto } from "../../api/types";
import "../../styles/birthday-congratulate-modal.css";

export type BirthdayCongratulatePayload = {
  message: string;
  card: BirthdayCardTemplate | null;
};

type Props = {
  open: boolean;
  person: BirthdayPersonDto | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: BirthdayCongratulatePayload) => void;
};

export function BirthdayCongratulateModal({
  open,
  person,
  submitting = false,
  onClose,
  onSubmit,
}: Props) {
  const titleId = useId();
  const [message, setMessage] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [previewCardId, setPreviewCardId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !person) return;
    setMessage(defaultBirthdayMessage(person.name));
    setSelectedCardId(null);
    setPreviewCardId(null);
  }, [open, person]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (previewCardId) {
          setPreviewCardId(null);
          return;
        }
        onClose();
      }
      if (!previewCardId) return;
      const index = BIRTHDAY_CARD_TEMPLATES.findIndex((card) => card.id === previewCardId);
      if (index < 0) return;
      if (event.key === "ArrowLeft" && index > 0) {
        event.preventDefault();
        setPreviewCardId(BIRTHDAY_CARD_TEMPLATES[index - 1].id);
      }
      if (event.key === "ArrowRight" && index < BIRTHDAY_CARD_TEMPLATES.length - 1) {
        event.preventDefault();
        setPreviewCardId(BIRTHDAY_CARD_TEMPLATES[index + 1].id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, previewCardId]);

  if (!open || !person) return null;

  const selectedCard =
    BIRTHDAY_CARD_TEMPLATES.find((card) => card.id === selectedCardId) ?? null;
  const previewCard =
    BIRTHDAY_CARD_TEMPLATES.find((card) => card.id === previewCardId) ?? null;
  const previewIndex = previewCard
    ? BIRTHDAY_CARD_TEMPLATES.findIndex((card) => card.id === previewCard.id)
    : -1;

  function handleSubmit(withCard: boolean) {
    const trimmed = message.trim();
    if (!trimmed || submitting) return;
    onSubmit({
      message: trimmed,
      card: withCard ? selectedCard : null,
    });
  }

  return createPortal(
    <div className="birthday-congrats-modal" role="presentation">
      <button
        type="button"
        className="birthday-congrats-modal__backdrop"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        className="birthday-congrats-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="birthday-congrats-modal__header">
          <div>
            <h2 className="birthday-congrats-modal__title" id={titleId}>
              Parabenizar {person.name.split(/\s+/)[0]}
            </h2>
            <p className="birthday-congrats-modal__subtitle">
              Personalize a mensagem e, se quiser, escolha um cartão candy para o feed.
            </p>
          </div>
          <button
            type="button"
            className="birthday-congrats-modal__close"
            aria-label="Fechar"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <div className="birthday-congrats-modal__body">
          <label className="birthday-congrats-modal__field" htmlFor="birthday-congrats-message">
            <span>Mensagem</span>
            <textarea
              id="birthday-congrats-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              maxLength={500}
              disabled={submitting}
            />
            <small>{message.trim().length}/500</small>
          </label>

          <section className="birthday-congrats-modal__gallery" aria-label="Cartões de aniversário">
            <div className="birthday-congrats-modal__gallery-head">
              <h3>Cartão de aniversário</h3>
              <button
                type="button"
                className="birthday-congrats-modal__clear-card"
                disabled={!selectedCardId || submitting}
                onClick={() => setSelectedCardId(null)}
              >
                Sem cartão
              </button>
            </div>
            <p className="birthday-congrats-modal__hint">
              Toque para selecionar · duplo clique ou “ampliar” para ver em tela cheia
            </p>
            <div className="birthday-congrats-modal__grid">
              {BIRTHDAY_CARD_TEMPLATES.map((card) => {
                const selected = selectedCardId === card.id;
                return (
                  <div
                    key={card.id}
                    className={`birthday-congrats-modal__card${selected ? " is-selected" : ""}`}
                  >
                    <button
                      type="button"
                      className="birthday-congrats-modal__card-pick"
                      disabled={submitting}
                      onClick={() => setSelectedCardId(card.id)}
                      onDoubleClick={() => setPreviewCardId(card.id)}
                      aria-pressed={selected}
                      title={card.label}
                    >
                      <img src={card.url} alt={card.label} loading="lazy" />
                    </button>
                    <button
                      type="button"
                      className="birthday-congrats-modal__card-zoom"
                      aria-label={`Ampliar ${card.label}`}
                      onClick={() => setPreviewCardId(card.id)}
                    >
                      <i className="fa-solid fa-expand" aria-hidden="true" />
                    </button>
                    <span className="birthday-congrats-modal__card-label">{card.label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <footer className="birthday-congrats-modal__footer">
          <button type="button" className="birthday-congrats-modal__btn" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button
            type="button"
            className="birthday-congrats-modal__btn"
            disabled={!message.trim() || submitting}
            onClick={() => handleSubmit(false)}
          >
            Só mensagem
          </button>
          <button
            type="button"
            className="birthday-congrats-modal__btn birthday-congrats-modal__btn--primary"
            disabled={!message.trim() || submitting}
            onClick={() => handleSubmit(true)}
          >
            {submitting ? "Enviando…" : selectedCard ? "Enviar com cartão" : "Enviar"}
          </button>
        </footer>
      </div>

      {previewCard ? (
        <div className="birthday-congrats-lightbox" role="dialog" aria-modal="true" aria-label={previewCard.label}>
          <button
            type="button"
            className="birthday-congrats-lightbox__backdrop"
            aria-label="Fechar prévia"
            onClick={() => setPreviewCardId(null)}
          />
          <div className="birthday-congrats-lightbox__shell">
            <button
              type="button"
              className="birthday-congrats-lightbox__close"
              aria-label="Fechar"
              onClick={() => setPreviewCardId(null)}
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="birthday-congrats-lightbox__nav"
              aria-label="Anterior"
              disabled={previewIndex <= 0}
              onClick={() =>
                previewIndex > 0 && setPreviewCardId(BIRTHDAY_CARD_TEMPLATES[previewIndex - 1].id)
              }
            >
              <i className="fa-solid fa-chevron-left" aria-hidden="true" />
            </button>
            <img src={previewCard.url} alt={previewCard.label} />
            <button
              type="button"
              className="birthday-congrats-lightbox__nav"
              aria-label="Próximo"
              disabled={previewIndex >= BIRTHDAY_CARD_TEMPLATES.length - 1}
              onClick={() =>
                previewIndex < BIRTHDAY_CARD_TEMPLATES.length - 1 &&
                setPreviewCardId(BIRTHDAY_CARD_TEMPLATES[previewIndex + 1].id)
              }
            >
              <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            </button>
            <div className="birthday-congrats-lightbox__footer">
              <span>
                {previewIndex + 1} / {BIRTHDAY_CARD_TEMPLATES.length} · {previewCard.label}
              </span>
              <button
                type="button"
                className="birthday-congrats-modal__btn birthday-congrats-modal__btn--primary"
                onClick={() => {
                  setSelectedCardId(previewCard.id);
                  setPreviewCardId(null);
                }}
              >
                Usar este cartão
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
