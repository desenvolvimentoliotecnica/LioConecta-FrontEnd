import { ContrachequeModal } from "../contracheque/ContrachequeModal";

type Props = {
  open: boolean;
  message: string | null;
  variant?: "success" | "error";
  onClose: () => void;
};

export function LeaveRequestResultModal({
  open,
  message,
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
      <p className={isError ? "leave-form__error" : undefined}>
        {message ?? (isError ? "Tente novamente em instantes." : "Sua solicitação foi enviada ao RH.")}
      </p>
    </ContrachequeModal>
  );
}
