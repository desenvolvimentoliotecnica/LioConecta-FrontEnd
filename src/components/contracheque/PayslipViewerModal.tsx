import { usePayslipDetail } from "../../api/hooks/usePayslips";
import type { PayslipDetailDto } from "../../api/types";
import { formatMoney } from "../../utils/money";
import { ContrachequeModal } from "./ContrachequeModal";

type Props = {
  open: boolean;
  title: string;
  year: number | null;
  month: number | null;
  showValues: boolean;
  onToggleShowValues: () => void;
  onClose: () => void;
};

function PayslipContent({ detail, showValues }: { detail: PayslipDetailDto; showValues: boolean }) {
  return (
    <>
      <div className="pay-summary-row">
        <div className="pay-summary-box">
          <div className="pay-summary-box__label">Proventos</div>
          <div className="pay-summary-box__value">{formatMoney(detail.grossAmount, showValues)}</div>
        </div>
        <div className="pay-summary-box">
          <div className="pay-summary-box__label">Descontos</div>
          <div className="pay-summary-box__value">{formatMoney(detail.deductionsTotal, showValues)}</div>
        </div>
        <div className="pay-summary-box">
          <div className="pay-summary-box__label">Líquido</div>
          <div className="pay-summary-box__value">{formatMoney(detail.netAmount, showValues)}</div>
        </div>
      </div>

      <h3 className="pay-modal__title" style={{ fontSize: 13, marginBottom: 8 }}>
        Proventos
      </h3>
      <table className="pay-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descrição</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {detail.earnings.map((line) => (
            <tr key={`e-${line.code}`}>
              <td>{line.code}</td>
              <td>{line.label}</td>
              <td>{formatMoney(line.amount, showValues)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="pay-modal__title" style={{ fontSize: 13, margin: "16px 0 8px" }}>
        Descontos
      </h3>
      <table className="pay-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descrição</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {detail.deductions.map((line) => (
            <tr key={`d-${line.code}`}>
              <td>{line.code}</td>
              <td>{line.label}</td>
              <td>{formatMoney(line.amount, showValues)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function PayslipViewerModal({
  open,
  title,
  year,
  month,
  showValues,
  onToggleShowValues,
  onClose,
}: Props) {
  const { data, isLoading, isError } = usePayslipDetail(open ? year : null, open ? month : null);

  return (
    <ContrachequeModal
      open={open}
      title={title}
      wide
      onClose={onClose}
      showValues={showValues}
      onToggleShowValues={onToggleShowValues}
    >
      {isLoading ? <p className="pay-status">Carregando holerite…</p> : null}
      {isError ? <p className="pay-status">Não foi possível carregar o holerite.</p> : null}
      {data ? <PayslipContent detail={data} showValues={showValues} /> : null}
    </ContrachequeModal>
  );
}
