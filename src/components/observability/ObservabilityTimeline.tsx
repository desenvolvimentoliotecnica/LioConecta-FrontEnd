import { Link } from "react-router-dom";
import type { ObservabilityTimelineItemDto } from "../../api/types";
import "../../styles/observability-hub.css";

const SOURCE_LABELS: Record<string, string> = {
  page_view: "Page view",
  access_event: "Acesso",
  observability_event: "Observabilidade",
  audit_event: "Auditoria",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

type Props = {
  correlationId: string;
  items: ObservabilityTimelineItemDto[];
};

export function ObservabilityTimeline({ correlationId, items }: Props) {
  if (items.length === 0) {
    return (
      <p className="observability-hub__empty">
        Nenhum evento encontrado para o correlation ID informado.
      </p>
    );
  }

  return (
    <div className="observability-timeline">
      <p className="observability-timeline__meta">
        Correlation ID: <code>{correlationId}</code> · {items.length} evento(s)
      </p>
      <ol className="observability-timeline__list">
        {items.map((item) => (
          <li key={`${item.source}-${item.referenceId}`} className="observability-timeline__item">
            <div className="observability-timeline__marker" aria-hidden="true" />
            <div className="observability-timeline__content">
              <div className="observability-timeline__head">
                <span className={`observability-timeline__badge observability-timeline__badge--${item.source.replace("_", "-")}`}>
                  {SOURCE_LABELS[item.source] ?? item.source}
                </span>
                <time dateTime={item.occurredAt}>{formatDate(item.occurredAt)}</time>
              </div>
              <div className="observability-timeline__label">{item.label}</div>
              {item.detail ? (
                <div className="observability-timeline__detail">{item.detail}</div>
              ) : null}
              {item.source === "audit_event" ? (
                <Link
                  className="observability-timeline__link"
                  to={`/admin/trilha-auditoria?correlationId=${encodeURIComponent(correlationId)}`}
                >
                  Abrir na Trilha de Auditoria
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
