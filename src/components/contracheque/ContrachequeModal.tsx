import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  title: string;
  wide?: boolean;
  stacked?: boolean;
  closeOnEscape?: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  footerStart?: ReactNode;
  showValues?: boolean;
  onToggleShowValues?: () => void;
};

function ValuesToggle({
  showValues,
  onToggle,
}: {
  showValues: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={`pay-toggle-values pay-toggle-values--modal${showValues ? " is-active" : ""}`}
      aria-pressed={showValues}
      onClick={onToggle}
    >
      <i className={`fa-regular ${showValues ? "fa-eye" : "fa-eye-slash"}`} aria-hidden="true" />
      {showValues ? "Ocultar valores" : "Mostrar valores"}
    </button>
  );
}

function DefaultFooter({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose}>
      Fechar
    </button>
  );
}

export function ContrachequeModal({
  open,
  title,
  wide,
  stacked = false,
  closeOnEscape = true,
  onClose,
  children,
  footer,
  footerStart,
  showValues = false,
  onToggleShowValues,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = stacked ? "pay-modal-title-stacked" : "pay-modal-title";

  useEffect(() => {
    if (!open || !closeOnEscape) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (stacked) {
          event.stopImmediatePropagation();
        }
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown, stacked);
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown, stacked);
    };
  }, [open, closeOnEscape, stacked, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className={`pay-modal__backdrop${stacked ? " pay-modal__backdrop--stacked" : ""}`}
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className={`pay-modal${wide ? " pay-modal--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="pay-modal__header">
          <h2 className="pay-modal__title" id={titleId}>
            {title}
          </h2>
          <button type="button" className="pay-modal__close" onClick={onClose} aria-label="Fechar">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>
        <div className="pay-modal__body">{children}</div>
        <footer className="pay-modal__footer">
          <div className="pay-modal__footer-start">
            {footerStart}
            {onToggleShowValues ? (
              <ValuesToggle showValues={showValues} onToggle={onToggleShowValues} />
            ) : null}
          </div>
          <div className="pay-modal__footer-end">{footer ?? <DefaultFooter onClose={onClose} />}</div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
