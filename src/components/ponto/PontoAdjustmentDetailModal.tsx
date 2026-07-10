import {
  usePontoAdjustmentDetail,
} from "../../api/hooks/usePonto";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import { PontoAdjustmentDaysCompare } from "./PontoAdjustmentDaysCompare";

type Props = {
  recordId: string | null;
  onClose: () => void;
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

export function PontoAdjustmentDetailModal({ recordId, onClose }: Props) {
  const detailQuery = usePontoAdjustmentDetail(recordId);
  const detail = detailQuery.data;

  return (
    <ContrachequeModal
      open={recordId !== null}
      title={detail?.title ?? "Detalhe do ajuste"}
      wide
      onClose={onClose}
      footer={
        <button type="button" className="pay-modal__btn" onClick={onClose}>
          Fechar
        </button>
      }
    >
      {detailQuery.isLoading ? <p>Carregando…</p> : null}
      {detailQuery.isError ? (
        <p className="leave-form__error" role="alert">
          Não foi possível carregar o detalhe.
        </p>
      ) : null}

      {detail ? (
        <div className="leave-gestao-detail ponto-adjust-detail">
          <div className="leave-detail__header">
            <div className="leave-detail__title-row">
              <h3 className="leave-detail__title">{detail.title}</h3>
              <span className={`leave-badge leave-badge--${detail.status.toLowerCase()}`}>
                {statusLabel(detail.status)}
              </span>
            </div>

            <dl className="leave-detail__meta">
              <div>
                <dt>
                  <i className="fa-regular fa-calendar-days" aria-hidden="true" /> Dias
                </dt>
                <dd>
                  {detail.dayCount} dia{detail.dayCount === 1 ? "" : "s"}
                </dd>
              </div>
              <div>
                <dt>
                  <i className="fa-regular fa-clock" aria-hidden="true" /> Enviado em
                </dt>
                <dd>{formatDateTime(detail.createdAt)}</dd>
              </div>
            </dl>

            <div className="leave-detail__notes-box">
              <span className="leave-detail__notes-label">Motivo</span>
              <p className="leave-detail__note">{detail.reason || "—"}</p>
            </div>
          </div>

          <section className="ponto-adjust-detail__section" aria-label="Dias solicitados">
            <h4 className="ponto-adjust-detail__section-title">Dias solicitados</h4>
            <PontoAdjustmentDaysCompare days={detail.days} />
          </section>

          <h3 className="leave-timeline__title">Acompanhamento</h3>
          <ol className="leave-timeline">
            {[...detail.timeline]
              .sort(
                (a, b) =>
                  new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
              )
              .map((event, index) => (
                <li
                  key={`${event.label}-${event.occurredAt}-${index}`}
                  className={`leave-timeline__item leave-timeline__item--${event.status.toLowerCase()}`}
                >
                  <div className="leave-timeline__dot" aria-hidden="true" />
                  <div className="leave-timeline__content">
                    <div className="leave-timeline__label">{event.label}</div>
                    <div className="leave-timeline__when">{formatDateTime(event.occurredAt)}</div>
                    {event.detail ? (
                      <div className="leave-timeline__detail">{event.detail}</div>
                    ) : null}
                  </div>
                </li>
              ))}
          </ol>

          <p className="leave-detail__status-note">
            Status atual: <strong>{statusLabel(detail.status)}</strong>
          </p>
        </div>
      ) : null}
    </ContrachequeModal>
  );
}
