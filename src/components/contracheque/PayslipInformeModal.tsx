import { useIncomeStatement } from "../../api/hooks/usePayslips";
import { formatMoney } from "../../utils/money";
import { ContrachequeModal } from "./ContrachequeModal";

const MONTH_NAMES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

type Props = {
  open: boolean;
  year: number;
  showValues: boolean;
  onToggleShowValues: () => void;
  onClose: () => void;
};

export function PayslipInformeModal({
  open,
  year,
  showValues,
  onToggleShowValues,
  onClose,
}: Props) {
  const { data, isLoading, isError } = useIncomeStatement(year, open);

  const footer = (
    <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose}>
      Fechar
    </button>
  );

  return (
    <ContrachequeModal
      open={open}
      title={`Informe de rendimentos ${year}`}
      wide
      onClose={onClose}
      showValues={showValues}
      onToggleShowValues={onToggleShowValues}
      footer={footer}>
      {isLoading ? <p className="pay-status">Gerando informe…</p> : null}
      {isError ? <p className="pay-status">Informe não disponível para o ano selecionado.</p> : null}
      {data ? (
        <>
          <div className="pay-summary-row">
            <div className="pay-summary-box">
              <div className="pay-summary-box__label">Total pago</div>
              <div className="pay-summary-box__value">{formatMoney(data.totalPaid, showValues)}</div>
            </div>
            <div className="pay-summary-box">
              <div className="pay-summary-box__label">Total retido</div>
              <div className="pay-summary-box__value">{formatMoney(data.totalWithheld, showValues)}</div>
            </div>
          </div>
          <table className="pay-table">
            <thead>
              <tr>
                <th>Mês</th>
                <th>Pago</th>
                <th>Retido</th>
              </tr>
            </thead>
            <tbody>
              {data.lines.map((line) => (
                <tr key={line.month}>
                  <td>{MONTH_NAMES[line.month - 1] ?? line.month}</td>
                  <td>{formatMoney(line.paid, showValues)}</td>
                  <td>{formatMoney(line.withheld, showValues)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}
    </ContrachequeModal>
  );
}
