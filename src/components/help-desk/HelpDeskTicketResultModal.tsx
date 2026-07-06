import type { HelpDeskTicketResultDto } from "../../api/types";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

type Props = {
  open: boolean;
  result: HelpDeskTicketResultDto | null;
  onClose: () => void;
};

export function HelpDeskTicketResultModal({ open, result, onClose }: Props) {
  return (
    <ContrachequeModal
      open={open && result !== null}
      title="Chamado registrado"
      onClose={onClose}
      footer={
        <>
          {result?.externalUrl ? (
            <a
              className="pay-modal__btn pay-modal__btn--ghost"
              href={result.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /> Ver no GLPI
            </a>
          ) : null}
          <button type="button" className="pay-modal__btn" onClick={onClose}>
            Entendi
          </button>
        </>
      }
    >
      <div className="hd-result">
        <div className="hd-result__icon" aria-hidden="true">
          <i className="fa-solid fa-circle-check" />
        </div>
        <p>{result?.message ?? "Chamado registrado com sucesso."}</p>
        {result?.externalRef ? (
          <p className="hd-result__ref">
            <i className="fa-solid fa-hashtag" aria-hidden="true" /> Protocolo GLPI: {result.externalRef}
          </p>
        ) : null}
      </div>
    </ContrachequeModal>
  );
}
