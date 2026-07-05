import { ContrachequeModal } from "./ContrachequeModal";

type Props = {
  open: boolean;
  message: string;
  onClose: () => void;
};

export function PayslipRequestResultModal({ open, message, onClose }: Props) {
  return (
    <ContrachequeModal
      open={open}
      title="Solicitação registrada"
      onClose={onClose}
      footer={
        <button type="button" className="pay-modal__btn" onClick={onClose}>
          OK
        </button>
      }
    >
      <p className="pay-help-text">{message}</p>
    </ContrachequeModal>
  );
}
