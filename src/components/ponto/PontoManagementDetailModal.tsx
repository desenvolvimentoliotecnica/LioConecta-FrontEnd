import { useState } from "react";
import {
  downloadPontoManagementAttachment,
  usePontoManagementApprove,
  usePontoManagementDetail,
  usePontoManagementReject,
} from "../../api/hooks/usePonto";
import type { PontoAttachmentMetaDto } from "../../api/types";
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

function attachmentIconClass(fileName: string, contentType: string): string {
  const lower = `${fileName} ${contentType}`.toLowerCase();
  if (lower.includes("pdf")) return "fa-file-pdf leave-attachments__icon--pdf";
  if (lower.includes("png") || lower.includes("image") || lower.includes("jpeg") || lower.includes("jpg")) {
    return "fa-file-image leave-attachments__icon--image";
  }
  return "fa-paperclip leave-attachments__icon--file";
}

export function PontoManagementDetailModal({ recordId, onClose }: Props) {
  const detailQuery = usePontoManagementDetail(recordId);
  const approveMutation = usePontoManagementApprove();
  const rejectMutation = usePontoManagementReject();
  const detail = detailQuery.data;
  const attachments = detail?.attachments ?? [];
  const [downloadBusy, setDownloadBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const decisionBusy = approveMutation.isPending || rejectMutation.isPending;
  const canDecide = detail?.status?.toLowerCase() === "pending";

  const handleDecide = async (action: "approve" | "reject") => {
    if (!recordId) return;
    setActionError(null);
    try {
      if (action === "approve") {
        await approveMutation.mutateAsync({ id: recordId });
      } else {
        await rejectMutation.mutateAsync({ id: recordId });
      }
    } catch {
      setActionError(
        action === "approve"
          ? "Não foi possível aprovar o ajuste."
          : "Não foi possível rejeitar o ajuste.",
      );
    }
  };

  const handleDownloadAttachment = async (attachment: PontoAttachmentMetaDto) => {
    if (!recordId) return;
    setDownloadBusy(attachment.storageFileName);
    try {
      await downloadPontoManagementAttachment(
        recordId,
        attachment.storageFileName,
        attachment.fileName,
      );
    } finally {
      setDownloadBusy(null);
    }
  };

  return (
    <ContrachequeModal
      open={recordId !== null}
      title={detail?.employeeName ?? "Detalhe do ajuste"}
      wide
      onClose={onClose}
      footer={
        <>
          {canDecide ? (
            <>
              <button
                type="button"
                className="pay-modal__btn"
                disabled={decisionBusy}
                data-testid="ponto-gestao-approve"
                onClick={() => void handleDecide("approve")}
              >
                Aprovar
              </button>
              <button
                type="button"
                className="pay-modal__btn pay-modal__btn--ghost"
                disabled={decisionBusy}
                data-testid="ponto-gestao-reject"
                onClick={() => void handleDecide("reject")}
              >
                Rejeitar
              </button>
            </>
          ) : null}
          <button type="button" className="pay-modal__btn" onClick={onClose}>
            Fechar
          </button>
        </>
      }
    >
      {detailQuery.isLoading ? <p>Carregando…</p> : null}
      {actionError ? (
        <p className="leave-form__error" role="alert">
          {actionError}
        </p>
      ) : null}
      {detailQuery.isError ? (
        <p className="leave-form__error" role="alert">
          Não foi possível carregar o detalhe da solicitação.
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
                  <i className="fa-regular fa-envelope" aria-hidden="true" /> E-mail
                </dt>
                <dd>
                  <a href={`mailto:${detail.email}`}>{detail.email}</a>
                </dd>
              </div>
              {detail.employeeId ? (
                <div>
                  <dt>
                    <i className="fa-solid fa-id-badge" aria-hidden="true" /> Chapa
                  </dt>
                  <dd>{detail.employeeId}</dd>
                </div>
              ) : null}
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

            {detail.infoNote ? (
              <p className="leave-detail__source" role="note">
                <i className="fa-solid fa-circle-info" aria-hidden="true" />
                {detail.infoNote}
              </p>
            ) : null}
          </div>

          <section className="ponto-adjust-detail__section" aria-label="Horários solicitados">
            <h4 className="ponto-adjust-detail__section-title">Horários solicitados</h4>
            <PontoAdjustmentDaysCompare days={detail.days} />
          </section>

          {attachments.length > 0 ? (
            <section className="leave-attachments" aria-label="Documentos anexados">
              <h3 className="leave-attachments__title">Anexos</h3>
              <ul className="leave-attachments__list">
                {attachments.map((attachment) => (
                  <li key={attachment.storageFileName} className="leave-attachments__item">
                    <div className="leave-attachments__meta">
                      <i
                        className={`fa-solid ${attachmentIconClass(attachment.fileName, attachment.contentType)}`}
                        aria-hidden="true"
                      />
                      <span className="leave-attachments__name">{attachment.fileName}</span>
                    </div>
                    <div className="leave-attachments__actions">
                      <button
                        type="button"
                        className="leave-btn leave-btn--ghost"
                        disabled={downloadBusy === attachment.storageFileName}
                        onClick={() => void handleDownloadAttachment(attachment)}
                      >
                        Baixar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <h3 className="leave-timeline__title">Linha do tempo</h3>
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
