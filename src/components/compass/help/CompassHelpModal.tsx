import { ContrachequeModal } from "../../contracheque/ContrachequeModal";
import { getCompassHelp } from "../../../config/compass/help-content";
import "../../../styles/compass-help.css";

type Props = {
  open: boolean;
  infoId: string;
  onClose: () => void;
};

export function CompassHelpModal({ open, infoId, onClose }: Props) {
  const help = getCompassHelp(infoId);
  if (!help) return null;

  return (
    <ContrachequeModal
      open={open}
      title={help.title}
      wide
      onClose={onClose}
      footer={
        <button type="button" className="pay-modal__btn" onClick={onClose}>
          Entendi
        </button>
      }
    >
      <div className="compass-help">
        <section>
          <h3>O que é</h3>
          <p>{help.oQueE}</p>
        </section>
        {help.origemHyperion ? (
          <section>
            <h3>Origem Hyperion</h3>
            <p>{help.origemHyperion}</p>
          </section>
        ) : null}
        {help.colunas ? (
          <section>
            <h3>Colunas</h3>
            <p>{help.colunas}</p>
          </section>
        ) : null}
        {help.formulas ? (
          <section>
            <h3>Fórmulas</h3>
            <p>{help.formulas}</p>
          </section>
        ) : null}
        {help.filtros ? (
          <section>
            <h3>Filtros</h3>
            <p>{help.filtros}</p>
          </section>
        ) : null}
        {help.interpretacao ? (
          <section>
            <h3>Interpretação</h3>
            <p>{help.interpretacao}</p>
          </section>
        ) : null}
        {help.exemplo ? (
          <section>
            <h3>Exemplo</h3>
            <p>{help.exemplo}</p>
          </section>
        ) : null}
      </div>
    </ContrachequeModal>
  );
}
