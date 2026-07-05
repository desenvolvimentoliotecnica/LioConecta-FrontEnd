import { useCallback, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { AuditEventDto } from "../../api/types";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import "../../styles/contracheque-page.css";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

function sourceLabel(source: AuditEventDto["source"]): string {
  if (source === "HttpRequest" || source === 0) return "Requisição HTTP";
  return "Alteração de entidade";
}

function formatDetails(detailsJson?: string | null): string | null {
  if (!detailsJson) return null;
  try {
    return JSON.stringify(JSON.parse(detailsJson), null, 2);
  } catch {
    return detailsJson;
  }
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="audit-trail-page__detail-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

type Props = {
  event: AuditEventDto | null;
  onClose: () => void;
};

export function AuditEventDetailModal({ event, onClose }: Props) {
  const details = event ? formatDetails(event.detailsJson) : null;
  const [toastVisible, setToastVisible] = useState(false);

  const copyDetails = useCallback(async () => {
    if (!details) {
      return;
    }

    try {
      await navigator.clipboard.writeText(details);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = details;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 3000);
  }, [details]);

  return (
    <>
      {toastVisible
        ? createPortal(
            <p className="audit-trail-page__toast" role="status" aria-live="polite">
              <i className="fa-solid fa-circle-check" aria-hidden="true" />
              Detalhes Copiados
            </p>,
            document.body,
          )
        : null}
      <ContrachequeModal
      open={event !== null}
      wide
      title={event ? `Detalhes — ${event.action}` : "Detalhes do evento"}
      onClose={onClose}
      footer={
        <button type="button" className="pay-modal__btn" onClick={onClose}>
          Fechar
        </button>
      }
    >
      {event ? (
        <dl className="audit-trail-page__detail-list audit-trail-page__detail-list--modal">
          <DetailRow label="ID do evento" value={<code>{event.id}</code>} />
          <DetailRow label="Data e hora" value={formatDate(event.createdAt)} />
          <DetailRow label="Origem" value={sourceLabel(event.source)} />
          <DetailRow label="Ação" value={event.action} />
          <DetailRow label="Ator" value={event.actorName ?? "Sistema"} />
          <DetailRow
            label="ID do ator"
            value={event.actorId ? <code>{event.actorId}</code> : "—"}
          />
          <DetailRow label="Tipo do alvo" value={event.targetType} />
          <DetailRow label="ID do alvo" value={<code>{event.targetId}</code>} />
          <DetailRow label="Método HTTP" value={event.httpMethod ?? "—"} />
          <DetailRow label="Caminho" value={event.path ?? "—"} />
          <DetailRow
            label="Status HTTP"
            value={event.statusCode != null ? String(event.statusCode) : "—"}
          />
          <DetailRow
            label="Duração"
            value={event.durationMs != null ? `${event.durationMs} ms` : "—"}
          />
          <DetailRow
            label="Correlation ID"
            value={<code className="audit-trail-page__detail-code">{event.correlationId}</code>}
          />
          <DetailRow
            label="Transaction ID"
            value={<code className="audit-trail-page__detail-code">{event.transactionId}</code>}
          />
        </dl>
      ) : null}
      {details ? (
        <div className="audit-trail-page__detail-json audit-trail-page__detail-json--modal">
          <div className="audit-trail-page__detail-json-header">
            <h3 className="audit-trail-page__detail-json-title">Payload / detalhes</h3>
            <button
              type="button"
              className="btn btn--ghost btn--sm audit-trail-page__copy-btn"
              onClick={() => void copyDetails()}
            >
              <i className="fa-regular fa-copy" aria-hidden="true" />
              Copiar JSON
            </button>
          </div>
          <pre className="audit-trail-page__details audit-trail-page__details--modal">{details}</pre>
        </div>
      ) : event && !details ? (
        <p className="audit-trail-page__detail-empty">Nenhum payload adicional registrado.</p>
      ) : null}
    </ContrachequeModal>
    </>
  );
}
