import { ContrachequeModal } from "../contracheque/ContrachequeModal";

type Props = {
  open: boolean;
  message: string | null;
  protocol?: string | null;
  variant?: "success" | "error";
  onClose: () => void;
};

export function LeaveRequestResultModal({
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
              : "Sua solicitação foi enviada ao RH.")}
        </p>
        {!isError && protocol ? (
          <p className="leave-result__protocol">
            <i className="fa-solid fa-hashtag" aria-hidden="true" /> Protocolo: {protocol}
          </p>
        ) : null}
      </div>
    </ContrachequeModal>
  );
}
