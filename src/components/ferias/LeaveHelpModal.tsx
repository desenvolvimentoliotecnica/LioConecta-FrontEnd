import type { LeaveServiceDto } from "../../api/types";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

type Props = {
  open: boolean;
  service: LeaveServiceDto | null;
  onClose: () => void;
};

export function LeaveHelpModal({ open, service, onClose }: Props) {
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
      <p className="leave-help__text">{service?.helpText}</p>
    </ContrachequeModal>
  );
}
