import { useLeaveBancoHoras } from "../../api/hooks/useLeave";
import { formatHours } from "../../utils/money";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

type Props = {
  open: boolean;
  showValues: boolean;
  onToggleShowValues: () => void;
  onClose: () => void;
};

export function LeaveBancoHorasModal({ open, showValues, onToggleShowValues, onClose }: Props) {
  const query = useLeaveBancoHoras(open);
  const data = query.data;

  return (
    <ContrachequeModal
      open={open}
      title="Banco de horas"
      wide
      showValues={showValues}
      onToggleShowValues={onToggleShowValues}
      onClose={onClose}
    >
      {query.isLoading ? <p>Carregando…</p> : null}
      {data ? (
        <>
          <div className="pay-summary-row">
            <div className="pay-summary-box">
              <div className="pay-summary-box__label">Saldo atual</div>
              <div className="pay-summary-box__value">{formatHours(data.balanceHours, showValues)}</div>
            </div>
          </div>
          <table className="pay-table">
            <thead>
              <tr>
                <th>Competência</th>
                <th>Descrição</th>
                <th>Horas</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map((entry) => (
                <tr key={`${entry.date}-${entry.description}`}>
                  <td>{entry.date}</td>
                  <td>{entry.description}</td>
                  <td>{formatHours(entry.hours, showValues)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}
    </ContrachequeModal>
  );
}
