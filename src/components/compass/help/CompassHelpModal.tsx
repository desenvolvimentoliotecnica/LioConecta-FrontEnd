import { ContrachequeModal } from "../../contracheque/ContrachequeModal";
import { getCompassHelp, type CompassHelpText } from "../../../config/compass/help-content";
import "../../../styles/compass-help.css";

type Props = {
  open: boolean;
  infoId: string;
  onClose: () => void;
};

function HelpParagraphs({ text }: { text: CompassHelpText }) {
  const parts = Array.isArray(text) ? text : [text];
  return (
    <>
      {parts.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </>
  );
}

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
          <HelpParagraphs text={help.oQueE} />
        </section>
        {help.origemHyperion ? (
          <section>
            <h3>Origem Hyperion</h3>
            <HelpParagraphs text={help.origemHyperion} />
          </section>
        ) : null}
        {help.colunas ? (
          <section>
            <h3>Colunas</h3>
            <HelpParagraphs text={help.colunas} />
          </section>
        ) : null}
        {help.formulas ? (
          <section>
            <h3>Fórmulas</h3>
            <HelpParagraphs text={help.formulas} />
          </section>
        ) : null}
        {help.filtros ? (
          <section>
            <h3>Filtros</h3>
            <HelpParagraphs text={help.filtros} />
          </section>
        ) : null}
        {help.interpretacao ? (
          <section>
            <h3>Na prática</h3>
            <HelpParagraphs text={help.interpretacao} />
          </section>
        ) : null}
        {help.exemplo ? (
          <section>
            <h3>Exemplos</h3>
            <HelpParagraphs text={help.exemplo} />
          </section>
        ) : null}
      </div>
    </ContrachequeModal>
  );
}
