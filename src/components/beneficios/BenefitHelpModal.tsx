import type { BenefitListItemDto } from "../../api/types";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

type Props = {
  open: boolean;
  benefit: BenefitListItemDto | null;
  helpText: string;
  onClose: () => void;
};

export function BenefitHelpModal({ open, benefit, helpText, onClose }: Props) {
  return (
    <ContrachequeModal
      open={open}
      title={benefit ? `Ajuda — ${benefit.title}` : "Ajuda"}
      onClose={onClose}
    >
      <p className="benefit-help__text">{helpText || "Informações não disponíveis."}</p>
    </ContrachequeModal>
  );
}
