import { useLeaveRequestDetail } from "../../api/hooks/useLeave";
import { leaveStatusLabel } from "../../utils/leaveHelpers";
import { formatSensitiveCount } from "../../utils/money";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import { LeaveStatusBadge } from "./LeaveStatusBadge";

type Props = {
  recordId: string | null;
  showValues: boolean;
  onClose: () => void;
};

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
}

export function LeaveRequestDetailModal({ recordId, showValues, onClose }: Props) {
  const detailQuery = useLeaveRequestDetail(recordId);
  const detail = detailQuery.data;

  return (
    <ContrachequeModal
      open={recordId !== null}
      title={detail?.title ?? "Detalhe da solicitação"}
      wide
      onClose={onClose}
    >
      {detailQuery.isLoading ? <p>Carregando…</p> : null}
      {detail ? (
        <>
          <div className="leave-detail__header">
            <LeaveStatusBadge status={detail.status} rmSyncStatus={detail.rmSyncStatus} />
            <p className="leave-detail__period">
              {formatDate(detail.startDate)}
              {detail.endDate ? ` — ${formatDate(detail.endDate)}` : ""}
              {detail.days != null
                ? ` · ${formatSensitiveCount(detail.days, showValues)} dia(s)`
                : ""}
            </p>
            {detail.notes ? <p className="leave-detail__note">{detail.notes}</p> : null}
            {detail.dataSource ? (
              <p className="leave-detail__source">Origem: {detail.dataSource}</p>
            ) : null}
          </div>

          <h3 className="leave-timeline__title">Linha do tempo</h3>
          <ol className="leave-timeline">
            {detail.timeline.map((event, index) => (
              <li key={`${event.label}-${index}`} className={`leave-timeline__item leave-timeline__item--${event.status}`}>
                <div className="leave-timeline__dot" aria-hidden="true" />
                <div className="leave-timeline__content">
                  <div className="leave-timeline__label">{event.label}</div>
                  <div className="leave-timeline__when">{formatDateTime(event.occurredAt)}</div>
                  {event.detail ? <div className="leave-timeline__detail">{event.detail}</div> : null}
                </div>
              </li>
            ))}
          </ol>

          <p className="leave-detail__status-note">
            Status atual: <strong>{leaveStatusLabel(detail.status)}</strong>
          </p>
        </>
      ) : null}
      {!detailQuery.isLoading && recordId && !detail ? (
        <p>Solicitação não encontrada.</p>
      ) : null}
    </ContrachequeModal>
  );
}
