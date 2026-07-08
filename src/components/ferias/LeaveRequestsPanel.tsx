import { useLeaveRequests } from "../../api/hooks/useLeave";
import { formatSensitiveCount } from "../../utils/money";
import { LeaveStatusBadge } from "./LeaveStatusBadge";

type Props = {
  showValues: boolean;
  onSelect: (recordId: string) => void;
};

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

export function LeaveRequestsPanel({ showValues, onSelect }: Props) {
  const requestsQuery = useLeaveRequests(12, true);

  if (requestsQuery.isLoading) {
    return (
      <section className="leave-requests-panel" aria-label="Minhas solicitações de férias">
        <h2 className="leave-requests-panel__title">Minhas solicitações de férias</h2>
        <p>Carregando…</p>
      </section>
    );
  }

  const items = requestsQuery.data ?? [];

  return (
    <section className="leave-requests-panel" aria-label="Minhas solicitações de férias">
      <h2 className="leave-requests-panel__title">Minhas solicitações de férias</h2>
      {items.length === 0 ? (
        <p className="leave-requests-panel__empty">Nenhuma solicitação de férias registrada.</p>
      ) : (
        <ul className="leave-requests-list">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="leave-requests-list__item"
                onClick={() => onSelect(item.id)}
              >
                <div className="leave-requests-list__head">
                  <span className="leave-requests-list__title">{item.title}</span>
                  <LeaveStatusBadge status={item.status} rmSyncStatus={item.rmSyncStatus} />
                </div>
                <div className="leave-requests-list__meta">
                  <span>
                    {formatDate(item.startDate)}
                    {item.endDate ? ` — ${formatDate(item.endDate)}` : ""}
                  </span>
                  {item.days != null ? (
                    <span>{formatSensitiveCount(item.days, showValues)} dia(s)</span>
                  ) : null}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
