import { usePontoAdjustments } from "../../api/hooks/usePonto";

type PanelProps = {
  onSelect: (recordId: string) => void;
};

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
}

function statusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
      return "Pendente";
    case "approved":
      return "Aprovado";
    case "rejected":
      return "Rejeitado";
    case "completed":
      return "Concluído";
    default:
      return status;
  }
}

export function PontoAdjustmentsPanel({ onSelect }: PanelProps) {
  const requestsQuery = usePontoAdjustments(12, true);

  if (requestsQuery.isLoading) {
    return (
      <section className="leave-requests-panel" aria-label="Minhas solicitações de ajuste de ponto">
        <h2 className="leave-requests-panel__title">Minhas solicitações de ajuste</h2>
        <p>Carregando…</p>
      </section>
    );
  }

  const items = requestsQuery.data ?? [];

  return (
    <section className="leave-requests-panel" aria-label="Minhas solicitações de ajuste de ponto">
      <h2 className="leave-requests-panel__title">Minhas solicitações de ajuste</h2>
      {items.length === 0 ? (
        <p className="leave-requests-panel__empty">Nenhuma solicitação de ajuste registrada.</p>
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
                  <span className={`leave-badge leave-badge--${item.status.toLowerCase()}`}>
                    {statusLabel(item.status)}
                  </span>
                </div>
                <div className="leave-requests-list__meta">
                  <span>{item.dayCount} dia(s)</span>
                  <span>{formatDateTime(item.createdAt)}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
