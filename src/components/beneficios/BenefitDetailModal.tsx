import { useBenefitDetail } from "../../api/hooks/useBenefits";
import type { BenefitDetailDto } from "../../api/types";
import { formatMoney } from "../../utils/money";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

type Props = {
  open: boolean;
  benefitId: string | null;
  showValues: boolean;
  onToggleShowValues: () => void;
  onClose: () => void;
  onRequest?: (benefitId: string) => void;
};

function formatLineValue(line: BenefitDetailDto["lines"][number], showValues: boolean): string {
  if (line.amount !== null && line.amount !== undefined) {
    return formatMoney(line.amount, showValues);
  }
  return line.note ?? "—";
}

function DetailContent({
  detail,
  showValues,
}: {
  detail: BenefitDetailDto;
  showValues: boolean;
}) {
  return (
    <>
      <p className="benefit-detail__desc">{detail.desc}</p>

      {detail.monthlyValue !== null && detail.monthlyValue !== undefined ? (
        <div className="pay-summary-row">
          <div className="pay-summary-box">
            <div className="pay-summary-box__label">Valor mensal (colaborador)</div>
            <div className="pay-summary-box__value">
              {formatMoney(detail.monthlyValue, showValues)}
            </div>
          </div>
        </div>
      ) : null}

      {detail.lines.length > 0 ? (
        <>
          <h3 className="benefit-detail__section">Detalhamento</h3>
          <table className="pay-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Valor / Info</th>
              </tr>
            </thead>
            <tbody>
              {detail.lines.map((line) => (
                <tr key={line.label}>
                  <td>
                    {line.label}
                    {line.note && line.amount !== null && line.amount !== undefined ? (
                      <div className="benefit-detail__note">{line.note}</div>
                    ) : null}
                  </td>
                  <td>{formatLineValue(line, showValues)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}

      {detail.dependents.length > 0 ? (
        <>
          <h3 className="benefit-detail__section">Dependentes</h3>
          <table className="pay-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Vínculo</th>
                <th>Mensalidade</th>
              </tr>
            </thead>
            <tbody>
              {detail.dependents.map((dep) => (
                <tr key={`${dep.name}-${dep.relation}`}>
                  <td>{dep.name}</td>
                  <td>{dep.relation}</td>
                  <td>
                    {dep.monthlyValue !== null && dep.monthlyValue !== undefined
                      ? formatMoney(dep.monthlyValue, showValues)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}

      {detail.notes.length > 0 ? (
        <ul className="benefit-detail__notes">
          {detail.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

export function BenefitDetailModal({
  open,
  benefitId,
  showValues,
  onToggleShowValues,
  onClose,
  onRequest,
}: Props) {
  const detailQuery = useBenefitDetail(open ? benefitId : null);
  const detail = detailQuery.data;
  const isOptional = detail?.status === "opcional";

  return (
    <ContrachequeModal
      open={open}
      title={detail?.title ?? "Consultar benefício"}
      wide
      showValues={showValues}
      onToggleShowValues={onToggleShowValues}
      onClose={onClose}
      footer={
        <>
          {isOptional && onRequest && benefitId ? (
            <button
              type="button"
              className="pay-modal__btn"
              onClick={() => onRequest(benefitId)}
            >
              Solicitar alteração
            </button>
          ) : null}
          {detail?.portalUrl ? (
            <a
              className="pay-modal__btn pay-modal__btn--ghost"
              href={detail.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir portal
            </a>
          ) : null}
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose}>
            Fechar
          </button>
        </>
      }
    >
      {detailQuery.isLoading ? <p className="pay-modal__loading">Carregando…</p> : null}
      {detailQuery.isError ? (
        <p className="pay-modal__error">Não foi possível carregar os detalhes do benefício.</p>
      ) : null}
      {detail ? <DetailContent detail={detail} showValues={showValues} /> : null}
    </ContrachequeModal>
  );
}
