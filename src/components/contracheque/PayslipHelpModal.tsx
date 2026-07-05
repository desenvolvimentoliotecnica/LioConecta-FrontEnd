import type { PayslipServiceDto } from "../../api/types";
import { ContrachequeModal } from "./ContrachequeModal";

type Props = {
  open: boolean;
  service: PayslipServiceDto | null;
  onClose: () => void;
};

export function PayslipHelpModal({ open, service, onClose }: Props) {
  return (
    <ContrachequeModal
      open={open && service !== null}
      title={service ? `Ajuda — ${service.title}` : "Ajuda"}
      onClose={onClose}
      footer={
        <button type="button" className="pay-modal__btn" onClick={onClose}>
          Entendi
        </button>
      }
    >
      <p className="pay-help-text">{service?.helpText}</p>
    </ContrachequeModal>
  );
}
