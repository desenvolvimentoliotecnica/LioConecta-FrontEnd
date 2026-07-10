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
  // Date-only (yyyy-MM-dd) sem timezone — evita deslocar 1 dia no pt-BR.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (dateOnly) {
    const [, y, m, d] = dateOnly;
    return `${d}/${m}/${y}`;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

function statusLabel(status: string): string {
  switch (status) {
    case "em_aquisicao":
      return "Em aquisição";
    case "vencido":
      return "Vencido";
    case "liberado":
      return "Liberado para gozo";
    default:
      return status;
  }
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
              <div className="pay-summary-box__label">Liberados para gozo</div>
              <div className="pay-summary-box__value">
                {formatSensitiveCount(balance.availableDays, showValues)}
              </div>
            </div>
            <div className="pay-summary-box">
              <div className="pay-summary-box__label">Em aquisição</div>
              <div className="pay-summary-box__value">
                {formatSensitiveCount(balance.acquiringDays ?? 0, showValues)}
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

          {(balance.acquiringDays ?? 0) > 0 ? (
            <p className="leave-detail__hint" role="status">
              {(balance.acquiringDays ?? 0) > 0 && balance.nextLiberationAt
                ? `${formatSensitiveCount(balance.acquiringDays ?? 0, showValues)} dia(s) ainda em aquisição — poderão ser solicitados a partir de ${formatDate(balance.nextLiberationAt)}.`
                : `${formatSensitiveCount(balance.acquiringDays ?? 0, showValues)} dia(s) ainda em aquisição e não podem ser solicitados agora.`}
            </p>
          ) : null}

          {balance.availableDays <= 0 && (balance.acquiringDays ?? 0) <= 0 && balance.expiredDays > 0 ? (
            <p className="leave-detail__hint" role="status">
              Não há dias liberados para solicitação. Há saldo vencido — consulte o RH.
            </p>
          ) : null}

          <table className="pay-table">
            <thead>
              <tr>
                <th>Período aquisitivo</th>
                <th>Situação</th>
                <th>Saldo</th>
                <th>Liberação</th>
                <th>Vencimento</th>
              </tr>
            </thead>
            <tbody>
              {balance.periods.map((period) => (
                <tr key={`${period.label}-${period.status}-${period.liberatesAt ?? ""}`}>
                  <td>{period.label}</td>
                  <td>
                    <span className={`leave-period-status leave-period-status--${period.status}`}>
                      {statusLabel(period.status)}
                    </span>
                  </td>
                  <td>{formatSensitiveCount(period.availableDays, showValues)}</td>
                  <td>
                    {period.status === "em_aquisicao"
                      ? formatDate(period.liberatesAt)
                      : period.status === "liberado"
                        ? "Já liberado"
                        : "—"}
                  </td>
                  <td>{formatDate(period.expiresAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {balance.periods.some((p) => p.contextNote) ? (
            <ul className="leave-detail__notes">
              {balance.periods
                .filter((p) => p.contextNote)
                .map((period) => (
                  <li key={`note-${period.label}-${period.status}`}>{period.contextNote}</li>
                ))}
            </ul>
          ) : null}

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
