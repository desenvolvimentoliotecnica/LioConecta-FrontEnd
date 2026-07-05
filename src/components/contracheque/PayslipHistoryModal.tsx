import { usePayslipHistory } from "../../api/hooks/usePayslips";
import { formatMoney } from "../../utils/money";
import { ContrachequeModal } from "./ContrachequeModal";

type Props = {
  open: boolean;
  showValues: boolean;
  onToggleShowValues: () => void;
  onClose: () => void;
  onSelect: (year: number, month: number) => void;
};

export function PayslipHistoryModal({
  open,
  showValues,
  onToggleShowValues,
  onClose,
  onSelect,
}: Props) {
  const { data, isLoading, isError } = usePayslipHistory(24);

  return (
    <ContrachequeModal
      open={open}
      title="Histórico de holerites"
      wide
      onClose={onClose}
      showValues={showValues}
      onToggleShowValues={onToggleShowValues}
    >
      {isLoading ? <p className="pay-status">Carregando histórico…</p> : null}
      {isError ? <p className="pay-status">Não foi possível carregar o histórico.</p> : null}
      {data && data.length > 0 ? (
        <table className="pay-table">
          <thead>
            <tr>
              <th>Competência</th>
              <th>Bruto</th>
              <th>Líquido</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={`${item.year}-${item.month}`}
                className="is-clickable"
                onClick={() => onSelect(item.year, item.month)}
              >
                <td>{item.competence}</td>
                <td>{formatMoney(item.grossAmount, showValues)}</td>
                <td>{formatMoney(item.netAmount, showValues)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {data && data.length === 0 ? <p className="pay-status">Nenhum holerite encontrado.</p> : null}
    </ContrachequeModal>
  );
}
