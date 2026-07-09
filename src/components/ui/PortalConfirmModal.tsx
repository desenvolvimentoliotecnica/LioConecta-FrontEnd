import type { ReactNode } from "react";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import "../../styles/portal-confirm-modal.css";

export type PortalConfirmVariant = "default" | "danger" | "warning";

type Props = {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: PortalConfirmVariant;
  busy?: boolean;
  stacked?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const ICONS: Record<PortalConfirmVariant, string> = {
  default: "fa-solid fa-circle-question",
  danger: "fa-solid fa-triangle-exclamation",
  warning: "fa-solid fa-circle-exclamation",
};

export function PortalConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  busy = false,
  stacked = false,
  onConfirm,
  onClose,
}: Props) {
  const confirmClass =
    variant === "danger"
      ? "pay-modal__btn pay-modal__btn--danger"
      : variant === "warning"
        ? "pay-modal__btn pay-modal__btn--warning"
        : "pay-modal__btn";

  return (
    <ContrachequeModal
      open={open}
      title={title}
      compact
      stacked={stacked}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" disabled={busy} onClick={onClose}>
            {cancelLabel}
          </button>
          <button type="button" className={confirmClass} disabled={busy} onClick={onConfirm}>
            {busy ? "Aguarde…" : confirmLabel}
          </button>
        </>
      }
    >
      <div className="portal-confirm">
        <div className={`portal-confirm__icon portal-confirm__icon--${variant}`} aria-hidden="true">
          <i className={ICONS[variant]} />
        </div>
        <p className="portal-confirm__message">{message}</p>
      </div>
    </ContrachequeModal>
  );
}
