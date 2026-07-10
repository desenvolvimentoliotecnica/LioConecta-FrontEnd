import { useState } from "react";
import {
  downloadLeaveManagementAttachment,
  downloadLeaveManagementPdf,
  openLeaveManagementPdf,
  useLeaveManagementApprove,
  useLeaveManagementDetail,
  useLeaveManagementReject,
} from "../../api/hooks/useLeave";
import type { LeaveAttachmentMetaDto } from "../../api/types";
import { formatSensitiveCount } from "../../utils/money";
import { leaveStatusLabel, sortLeaveTimelineNewestFirst } from "../../utils/leaveHelpers";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import { LeaveAttachmentViewerModal } from "./LeaveAttachmentViewerModal";
import { LeaveStatusBadge } from "./LeaveStatusBadge";

type Props = {
  recordId: string | null;
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

function attachmentIconClass(fileName: string, contentType: string): string {
  const lower = `${fileName} ${contentType}`.toLowerCase();
  if (lower.includes("pdf")) return "fa-file-pdf leave-attachments__icon--pdf";
  if (lower.includes("png") || lower.includes("image") || lower.includes("jpeg") || lower.includes("jpg")) {
    return "fa-file-image leave-attachments__icon--image";
  }
  return "fa-paperclip leave-attachments__icon--file";
}

export function LeaveManagementDetailModal({ recordId, onClose }: Props) {
  const detailQuery = useLeaveManagementDetail(recordId);
  const approveMutation = useLeaveManagementApprove();
  const rejectMutation = useLeaveManagementReject();
  const detail = detailQuery.data;
  const attachments = detail?.attachments ?? [];
  const [pdfBusy, setPdfBusy] = useState(false);
  const [viewerAttachment, setViewerAttachment] = useState<LeaveAttachmentMetaDto | null>(null);
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
          ? "Não foi possível aprovar a solicitação."
          : "Não foi possível rejeitar a solicitação.",
      );
    }
  };

  const handlePdf = async (action: "download" | "print") => {
    if (!recordId) return;
    setPdfBusy(true);
    try {
      if (action === "download") {
        await downloadLeaveManagementPdf(recordId);
      } else {
        await openLeaveManagementPdf(recordId);
      }
    } finally {
      setPdfBusy(false);
    }
  };

  const handleDownloadAttachment = async (attachment: LeaveAttachmentMetaDto) => {
    if (!recordId) return;
    setDownloadBusy(attachment.storageFileName);
    try {
      await downloadLeaveManagementAttachment(
        recordId,
        attachment.storageFileName,
        attachment.fileName,
      );
    } finally {
      setDownloadBusy(null);
    }
  };

  const handleClose = () => {
    setViewerAttachment(null);
    onClose();
  };

  return (
    <>
      <ContrachequeModal
        open={recordId !== null}
        title={detail?.employeeName ?? "Detalhe da solicitação"}
        wide
        onClose={handleClose}
        footer={
          <>
            {canDecide ? (
              <>
                <button
                  type="button"
                  className="pay-modal__btn"
                  disabled={decisionBusy}
                  data-testid="leave-gestao-approve"
                  onClick={() => void handleDecide("approve")}
                >
                  Aprovar
                </button>
                <button
                  type="button"
                  className="pay-modal__btn pay-modal__btn--ghost"
                  disabled={decisionBusy}
                  data-testid="leave-gestao-reject"
                  onClick={() => void handleDecide("reject")}
                >
                  Rejeitar
                </button>
              </>
            ) : null}
            <button
              type="button"
              className="pay-modal__btn"
              disabled={!detail || pdfBusy}
              onClick={() => void handlePdf("print")}
            >
              Imprimir PDF
            </button>
            <button
              type="button"
              className="pay-modal__btn pay-modal__btn--ghost"
              disabled={!detail || pdfBusy}
              onClick={() => void handlePdf("download")}
            >
              Baixar PDF
            </button>
            <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={handleClose}>
              Fechar
            </button>
          </>
        }
      >
        <div className="leave-gestao-detail" data-testid="leave-gestao-detail">
          {detailQuery.isLoading ? <p>Carregando detalhe…</p> : null}
          {actionError ? (
            <p className="leave-form__error" role="alert">
              {actionError}
            </p>
          ) : null}

          {detail ? (
            <>
              <div className="leave-detail__header">
                <div className="leave-detail__title-row">
                  <h3 className="leave-detail__title">{detail.title}</h3>
                  <LeaveStatusBadge status={detail.status} rmSyncStatus={detail.rmSyncStatus} />
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
                      <i className="fa-regular fa-calendar" aria-hidden="true" /> Período
                    </dt>
                    <dd>
                      {formatDate(detail.startDate)}
                      {detail.endDate ? ` — ${formatDate(detail.endDate)}` : ""}
                    </dd>
                  </div>
                  {detail.days != null ? (
                    <div>
                      <dt>
                        <i className="fa-regular fa-clock" aria-hidden="true" /> Duração
                      </dt>
                      <dd>{formatSensitiveCount(detail.days, true)} dia(s)</dd>
                    </div>
                  ) : null}
                  {detail.rmExternalId ? (
                    <div>
                      <dt>
                        <i className="fa-solid fa-link" aria-hidden="true" /> RM
                      </dt>
                      <dd>{detail.rmExternalId}</dd>
                    </div>
                  ) : null}
                </dl>

                {detail.notes ? (
                  <div className="leave-detail__notes-box">
                    <span className="leave-detail__notes-label">Observação</span>
                    <p className="leave-detail__note">{detail.notes}</p>
                  </div>
                ) : null}

                {detail.approvalNote ? (
                  <p className="leave-detail__source" role="note">
                    <i className="fa-solid fa-circle-info" aria-hidden="true" />
                    {detail.approvalNote}
                  </p>
                ) : null}
              </div>

              {attachments.length > 0 ? (
                <section className="leave-attachments" aria-label="Documentos anexados">
                  <h3 className="leave-attachments__title">Documentos anexados</h3>
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
                            data-testid="leave-attachment-view"
                            onClick={() => setViewerAttachment(attachment)}
                          >
                            Visualizar
                          </button>
                          <button
                            type="button"
                            className="leave-btn leave-btn--ghost"
                            data-testid="leave-attachment-download"
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
                {sortLeaveTimelineNewestFirst(detail.timeline).map((event, index) => (
                  <li
                    key={`${event.label}-${index}`}
                    className={`leave-timeline__item leave-timeline__item--${event.status}`}
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
                Status atual: <strong>{leaveStatusLabel(detail.status)}</strong>
              </p>
            </>
          ) : null}

          {!detailQuery.isLoading && recordId && !detail ? (
            <p>Solicitação não encontrada ou sem permissão.</p>
          ) : null}
        </div>
      </ContrachequeModal>

      {recordId ? (
        <LeaveAttachmentViewerModal
          open={viewerAttachment !== null}
          recordId={recordId}
          attachment={viewerAttachment}
          onClose={() => setViewerAttachment(null)}
        />
      ) : null}
    </>
  );
}
