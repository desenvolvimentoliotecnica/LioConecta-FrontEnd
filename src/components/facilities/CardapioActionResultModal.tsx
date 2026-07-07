type CardapioActionResultModalProps = {
  open: boolean;
  variant: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
};

export function CardapioActionResultModal({
  open,
  variant,
  title,
  message,
  onClose,
}: CardapioActionResultModalProps) {
  if (!open) return null;

  const iconClass =
    variant === "success" ? "fa-solid fa-circle-check" : "fa-solid fa-circle-xmark";

  return (
    <div className="cardapio-result-modal__backdrop" role="presentation" onClick={onClose}>
      <div
        className="cardapio-result-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cardapio-result-title"
        aria-describedby="cardapio-result-message"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`cardapio-result-modal__icon cardapio-result-modal__icon--${variant}`}
          aria-hidden="true"
        >
          <i className={iconClass} />
        </div>
        <h2 id="cardapio-result-title" className="cardapio-result-modal__title">
          {title}
        </h2>
        <p id="cardapio-result-message" className="cardapio-result-modal__message">
          {message}
        </p>
        <button
          type="button"
          className="cardapio-page__btn cardapio-page__btn--primary cardapio-result-modal__btn"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}
