import { ContrachequeModal } from "../contracheque/ContrachequeModal";

type Props = {
  open: boolean;
  message: string | null;
  protocol?: string | null;
  variant?: "success" | "error";
  onClose: () => void;
};

export function PontoAdjustmentResultModal({
  open,
  message,
  protocol,
  variant = "success",
  onClose,
}: Props) {
  const isError = variant === "error";

  return (
    <ContrachequeModal
      open={open}
      title={isError ? "Não foi possível enviar" : "Solicitação registrada"}
      onClose={onClose}
      footer={
        <button type="button" className="pay-modal__btn" onClick={onClose}>
          Entendi
        </button>
      }
    >
      <div className={isError ? undefined : "leave-result"}>
        {!isError ? (
          <div className="leave-result__icon" aria-hidden="true">
            <i className="fa-solid fa-circle-check" />
          </div>
        ) : null}
        <p className={isError ? "leave-form__error" : undefined}>
          {message ??
            (isError
              ? "Tente novamente em instantes."
              : "Sua solicitação de ajuste de ponto foi enviada ao gestor.")}
        </p>
        {!isError && protocol ? (
          <p className="leave-result__protocol">
            Protocolo: <strong>{protocol}</strong>
          </p>
        ) : null}
      </div>
    </ContrachequeModal>
  );
}
