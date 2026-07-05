import { usePayslipComparativo } from "../../api/hooks/usePayslips";
import { formatMoney } from "../../utils/money";
import { ContrachequeModal } from "./ContrachequeModal";

type Props = {
  open: boolean;
  fromYear: number | null;
  fromMonth: number | null;
  toYear: number | null;
  toMonth: number | null;
  showValues: boolean;
  onToggleShowValues: () => void;
  onClose: () => void;
};

export function PayslipComparativoModal({
  open,
  fromYear,
  fromMonth,
  toYear,
  toMonth,
  showValues,
  onToggleShowValues,
  onClose,
}: Props) {
  const { data, isLoading, isError } = usePayslipComparativo(
    open ? fromYear : null,
    open ? fromMonth : null,
    open ? toYear : null,
    open ? toMonth : null,
  );

  return (
    <ContrachequeModal
      open={open}
      title="Comparativo salarial"
      wide
      onClose={onClose}
      showValues={showValues}
      onToggleShowValues={onToggleShowValues}
    >
      {isLoading ? <p className="pay-status">Calculando comparativo…</p> : null}
      {isError ? <p className="pay-status">Não foi possível gerar o comparativo.</p> : null}
      {data ? (
        <>
          <div className="pay-summary-row">
            <div className="pay-summary-box">
              <div className="pay-summary-box__label">{data.from.competence}</div>
              <div className="pay-summary-box__value">{formatMoney(data.from.netAmount, showValues)}</div>
            </div>
            <div className="pay-summary-box">
              <div className="pay-summary-box__label">{data.to.competence}</div>
              <div className="pay-summary-box__value">{formatMoney(data.to.netAmount, showValues)}</div>
            </div>
            <div className="pay-summary-box">
              <div className="pay-summary-box__label">Variação líquida</div>
              <div className="pay-summary-box__value">{formatMoney(data.netDifference, showValues)}</div>
            </div>
          </div>
          <table className="pay-table">
            <thead>
              <tr>
                <th>Indicador</th>
                <th>{data.from.competence}</th>
                <th>{data.to.competence}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Proventos</td>
                <td>{formatMoney(data.from.grossAmount, showValues)}</td>
                <td>{formatMoney(data.to.grossAmount, showValues)}</td>
              </tr>
              <tr>
                <td>Descontos</td>
                <td>{formatMoney(data.from.deductionsTotal, showValues)}</td>
                <td>{formatMoney(data.to.deductionsTotal, showValues)}</td>
              </tr>
              <tr>
                <td>Líquido</td>
                <td>{formatMoney(data.from.netAmount, showValues)}</td>
                <td>{formatMoney(data.to.netAmount, showValues)}</td>
              </tr>
            </tbody>
          </table>
        </>
      ) : null}
    </ContrachequeModal>
  );
}
