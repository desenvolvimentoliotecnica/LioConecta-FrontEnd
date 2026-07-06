import { useState } from "react";
import type { HelpDeskServiceDto } from "../../api/types";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

type Props = {
  open: boolean;
  service: HelpDeskServiceDto | null;
  onClose: () => void;
};

export function HelpDeskPhoneModal({ open, service, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const extension = "5500";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(extension);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <ContrachequeModal
      open={open && service !== null}
      title="Telefone plantão"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose}>
            Fechar
          </button>
          <button type="button" className="pay-modal__btn" onClick={() => void handleCopy()}>
            <i className="fa-regular fa-copy" aria-hidden="true" />
            {copied ? "Copiado!" : "Copiar ramal"}
          </button>
        </>
      }
    >
      <div className="hd-info-card hd-info-card--urgent">
        <div className="hd-info-card__icon" aria-hidden="true">
          <i className="fa-solid fa-phone-volume" />
        </div>
        <div>
          <h3 className="hd-info-card__title">Ramal {extension}</h3>
          <p className="hd-info-card__text">{service?.helpText}</p>
        </div>
      </div>
      <ul className="hd-info-list">
        <li>
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          <span>Use apenas para incidentes críticos (produção parada ou risco de segurança)</span>
        </li>
        <li>
          <i className="fa-solid fa-shield-halved" aria-hidden="true" />
          <span>Disponível 24/7 para plantão de infraestrutura</span>
        </li>
        <li>
          <i className="fa-regular fa-clock" aria-hidden="true" />
          <span>Tempo de resposta alvo: 30 minutos para incidentes críticos</span>
        </li>
      </ul>
    </ContrachequeModal>
  );
}
