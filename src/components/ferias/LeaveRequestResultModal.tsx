import { ContrachequeModal } from "../contracheque/ContrachequeModal";

type Props = {
  open: boolean;
  message: string | null;
  onClose: () => void;
};

export function LeaveRequestResultModal({ open, message, onClose }: Props) {
  return (
    <ContrachequeModal
      open={open}
      title="Solicitação registrada"
      onClose={onClose}
      footer={
        <button type="button" className="pay-modal__btn" onClick={onClose}>
          Entendi
        </button>
      }
    >
      <p>{message ?? "Sua solicitação foi enviada ao RH."}</p>
    </ContrachequeModal>
  );
}
