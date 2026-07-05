import { useLeaveBalance } from "../../api/hooks/useLeave";
import { formatSensitiveCount } from "../../utils/money";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

type Props = {
  open: boolean;
  showValues: boolean;
  onToggleShowValues: () => void;
  onClose: () => void;
};

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

export function LeaveBalanceModal({ open, showValues, onToggleShowValues, onClose }: Props) {
  const balanceQuery = useLeaveBalance(open);
  const balance = balanceQuery.data;

  return (
    <ContrachequeModal
      open={open}
      title="Saldo de férias"
      wide
      showValues={showValues}
      onToggleShowValues={onToggleShowValues}
      onClose={onClose}
    >
      {balanceQuery.isLoading ? <p>Carregando…</p> : null}
      {balance ? (
        <>
          <div className="pay-summary-row">
            <div className="pay-summary-box">
              <div className="pay-summary-box__label">Disponíveis</div>
              <div className="pay-summary-box__value">
                {formatSensitiveCount(balance.availableDays, showValues)}
              </div>
            </div>
            <div className="pay-summary-box">
              <div className="pay-summary-box__label">Programados</div>
              <div className="pay-summary-box__value">
                {formatSensitiveCount(balance.scheduledDays, showValues)}
              </div>
            </div>
            <div className="pay-summary-box">
              <div className="pay-summary-box__label">Vencidos</div>
              <div className="pay-summary-box__value">
                {formatSensitiveCount(balance.expiredDays, showValues)}
              </div>
            </div>
          </div>
          <table className="pay-table">
            <thead>
              <tr>
                <th>Período aquisitivo</th>
                <th>Adquiridos</th>
                <th>Usados</th>
                <th>Disponíveis</th>
                <th>Vencimento</th>
              </tr>
            </thead>
            <tbody>
              {balance.periods.map((period) => (
                <tr key={period.label}>
                  <td>{period.label}</td>
                  <td>{formatSensitiveCount(period.acquiredDays, showValues)}</td>
                  <td>{formatSensitiveCount(period.usedDays, showValues)}</td>
                  <td>{formatSensitiveCount(period.availableDays, showValues)}</td>
                  <td>{formatDate(period.expiresAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {balance.notes.length > 0 ? (
            <ul className="leave-detail__notes">
              {balance.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}
    </ContrachequeModal>
  );
}
