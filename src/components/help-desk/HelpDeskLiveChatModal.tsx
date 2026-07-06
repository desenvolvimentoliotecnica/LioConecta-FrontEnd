import type { HelpDeskServiceDto } from "../../api/types";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

type Props = {
  open: boolean;
  service: HelpDeskServiceDto | null;
  onClose: () => void;
  onOpenTeams: () => void;
};

export function HelpDeskLiveChatModal({ open, service, onClose, onOpenTeams }: Props) {
  return (
    <ContrachequeModal
      open={open && service !== null}
      title="Chat ao vivo"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose}>
            Fechar
          </button>
          <button type="button" className="pay-modal__btn" onClick={onOpenTeams}>
            <i className="fa-brands fa-microsoft" aria-hidden="true" /> Abrir Teams
          </button>
        </>
      }
    >
      <div className="hd-info-card">
        <div className="hd-info-card__icon" aria-hidden="true">
          <i className="fa-solid fa-comments" />
        </div>
        <div>
          <h3 className="hd-info-card__title">Atendimento síncrono — Teams TI</h3>
          <p className="hd-info-card__text">{service?.helpText}</p>
        </div>
      </div>
      <ul className="hd-info-list">
        <li>
          <i className="fa-regular fa-clock" aria-hidden="true" />
          <span>Horário: 7h às 22h (dias úteis e plantão estendido)</span>
        </li>
        <li>
          <i className="fa-solid fa-bolt" aria-hidden="true" />
          <span>Tempo médio de resposta: 15 minutos</span>
        </li>
        <li>
          <i className="fa-solid fa-user-headset" aria-hidden="true" />
          <span>Analista de plantão disponível para triagem imediata</span>
        </li>
      </ul>
    </ContrachequeModal>
  );
}
