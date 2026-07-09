import { useEffect, useState } from "react";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import "../../styles/unilio-module-feedback-modal.css";

type Props = {
  open: boolean;
  courseTitle: string;
  busy?: boolean;
  onSubmit: (payload: { contentRating: number; feedbackComment: string }) => void;
};

const RATING_LABELS = [
  "Muito ruim",
  "Ruim",
  "Regular",
  "Bom",
  "Excelente",
] as const;

export function UniLioCourseFeedbackModal({ open, courseTitle, busy = false, onSubmit }: Props) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const displayRating = hoverRating || rating;
  const canSubmit = rating >= 1 && rating <= 5;

  useEffect(() => {
    if (!open) return;
    setRating(0);
    setHoverRating(0);
    setComment("");
  }, [open, courseTitle]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ contentRating: rating, feedbackComment: comment.trim() });
  };

  return (
    <ContrachequeModal
      open={open}
      title="Curso concluído!"
      compact
      stacked
      closeOnEscape={false}
      onClose={() => {}}
      footer={
        <button
          type="button"
          className="pay-modal__btn"
          disabled={!canSubmit || busy}
          onClick={handleSubmit}
        >
          {busy ? "Salvando…" : "Finalizar"}
        </button>
      }
    >
      <div className="unilio-module-feedback">
        <div className="unilio-module-feedback__celebration" aria-hidden="true">
          <i className="fa-solid fa-trophy" />
        </div>
        <p className="unilio-module-feedback__lead">
          Parabéns! Você concluiu o curso <strong>{courseTitle}</strong>.
        </p>
        <p className="unilio-module-feedback__hint">Como você avalia este curso?</p>

        <div
          className="unilio-module-feedback__stars"
          role="radiogroup"
          aria-label="Avaliação do curso em estrelas"
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              className={`unilio-module-feedback__star${value <= displayRating ? " is-active" : ""}`}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(value)}
              disabled={busy}
            >
              <i className={value <= displayRating ? "fa-solid fa-star" : "fa-regular fa-star"} aria-hidden="true" />
              <span className="sr-only">{value} estrela{value === 1 ? "" : "s"}</span>
            </button>
          ))}
        </div>

        {displayRating > 0 ? (
          <p className="unilio-module-feedback__rating-label">{RATING_LABELS[displayRating - 1]}</p>
        ) : (
          <p className="unilio-module-feedback__rating-label unilio-module-feedback__rating-label--muted">
            Selecione de 1 a 5 estrelas
          </p>
        )}

        <label className="unilio-module-feedback__field">
          <span>Sugestões ou observações (opcional)</span>
          <textarea
            rows={4}
            maxLength={2000}
            placeholder="Conte o que achou do curso, o que ajudou ou o que podemos melhorar…"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            disabled={busy}
          />
        </label>
      </div>
    </ContrachequeModal>
  );
}
