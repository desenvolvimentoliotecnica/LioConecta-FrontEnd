import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMe } from "../../api/hooks/useMe";
import {
  downloadLeaveManagementAttachment,
  downloadLeaveManagementPdf,
  openLeaveManagementPdf,
  useLeaveManagementDetail,
  useLeaveManagementList,
} from "../../api/hooks/useLeave";
import { ApiError } from "../../api/client";
import { canAccessLeaveManagement } from "../../api/auth";
import type { LeaveAttachmentMetaDto } from "../../api/types";
import { formatSensitiveCount } from "../../utils/money";
import { leaveStatusLabel } from "../../utils/leaveHelpers";
import { RhPageHead } from "../servicos/RhPageHead";
import { sectionMainClass } from "../layout/SectionPageHead";
import { LeaveStatusBadge } from "./LeaveStatusBadge";
import { LeaveAttachmentViewerModal } from "./LeaveAttachmentViewerModal";
import "../../styles/contracheque-page.css";
import "../../styles/ferias-ausencias-page.css";

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function attachmentIconClass(fileName: string, contentType: string): string {
  const lower = `${fileName} ${contentType}`.toLowerCase();
  if (lower.includes("pdf")) return "fa-file-pdf";
  if (lower.includes("png") || lower.includes("image")) return "fa-file-image";
  return "fa-paperclip";
}

export function FeriasGestaoPage() {
  const meQuery = useMe();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestId = searchParams.get("requestId");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(requestId);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [viewerAttachment, setViewerAttachment] = useState<LeaveAttachmentMetaDto | null>(null);
  const [downloadBusy, setDownloadBusy] = useState<string | null>(null);

  const roleHint = canAccessLeaveManagement(meQuery.data);
  const listQuery = useLeaveManagementList({
    status: status || undefined,
    q: query || undefined,
    enabled: meQuery.isSuccess && roleHint,
  });
  const detailQuery = useLeaveManagementDetail(selectedId && roleHint ? selectedId : null);

  useEffect(() => {
    if (requestId) {
      setSelectedId(requestId);
    }
  }, [requestId]);

  const apiForbidden =
    listQuery.error instanceof ApiError && listQuery.error.status === 403;
  const forbidden = meQuery.isSuccess && (!roleHint || apiForbidden);

  const items = useMemo(() => listQuery.data ?? [], [listQuery.data]);
  const detail = detailQuery.data;
  const attachments = detail?.attachments ?? [];

  const selectRequest = (id: string) => {
    setSelectedId(id);
    setSearchParams({ requestId: id }, { replace: true });
  };

  const handlePdf = async (action: "download" | "print") => {
    if (!selectedId) return;
    setPdfBusy(true);
    try {
      if (action === "download") {
        await downloadLeaveManagementPdf(selectedId);
      } else {
        await openLeaveManagementPdf(selectedId);
      }
    } finally {
      setPdfBusy(false);
    }
  };

  const handleDownloadAttachment = async (attachment: LeaveAttachmentMetaDto) => {
    if (!selectedId) return;
    setDownloadBusy(attachment.storageFileName);
    try {
      await downloadLeaveManagementAttachment(
        selectedId,
        attachment.storageFileName,
        attachment.fileName,
      );
    } finally {
      setDownloadBusy(null);
    }
  };

  return (
    <main className={sectionMainClass("rh")}>
      <RhPageHead
        title="Gestão de férias"
        current="Gestão de férias"
        description="Acompanhe solicitações da equipe. A aprovação formal continua no RM Labore."
        actions={
          <Link className="pay-btn pay-btn--ghost" to="/servicos/ferias-ausencias">
            Minhas férias
          </Link>
        }
      />

      {forbidden ? (
        <section className="leave-gestao-denied" role="alert">
          <h2>Acesso restrito</h2>
          <p>
            A gestão de férias é disponível para quem tem a permissão{" "}
            <code>leave.manage</code> ou <code>leave.approve</code> (regras RH, Gestor ou Key User RH
            no Controle de Acesso). O perfil Administrador sozinho não inclui essa permissão.
          </p>
          <p className="leave-gestao-denied__hint">
            Se você deveria gerenciar férias da equipe, peça a regra <strong>Recursos Humanos</strong>{" "}
            ou <strong>Gestor</strong> em{" "}
            <Link to="/admin/controle-acesso">Controle de Acesso</Link>.
          </p>
          <div className="leave-gestao-denied__actions">
            <Link className="pay-btn" to="/servicos/ferias-ausencias">
              Ir para Minhas férias
            </Link>
          </div>
        </section>
      ) : (
        <div className="leave-gestao-layout">
          <section className="leave-gestao-list" aria-label="Solicitações de férias">
            <div className="leave-gestao-filters">
              <label>
                Status
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="pending">Pendente</option>
                  <option value="approved">Aprovado</option>
                  <option value="rejected">Rejeitado</option>
                  <option value="completed">Concluído</option>
                </select>
              </label>
              <label>
                Busca
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nome, e-mail ou chapa"
                />
              </label>
            </div>

            {listQuery.isLoading ? <p>Carregando…</p> : null}
            {!listQuery.isLoading && items.length === 0 ? (
              <p className="leave-requests-panel__empty">Nenhuma solicitação encontrada.</p>
            ) : null}

            <ul className="leave-requests-list">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`leave-requests-list__item${selectedId === item.id ? " is-selected" : ""}`}
                    onClick={() => selectRequest(item.id)}
                  >
                    <div className="leave-requests-list__head">
                      <span className="leave-requests-list__title">{item.employeeName}</span>
                      <LeaveStatusBadge status={item.status} rmSyncStatus={item.rmSyncStatus} />
                    </div>
                    <div className="leave-requests-list__meta">
                      <span>{item.title}</span>
                      <span>{item.employeeId ?? item.email}</span>
                      <span>
                        {formatDate(item.startDate)}
                        {item.endDate ? ` — ${formatDate(item.endDate)}` : ""}
                      </span>
                      {item.days != null ? <span>{item.days} dia(s)</span> : null}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="leave-gestao-detail" aria-label="Detalhe da solicitação">
            {!selectedId ? (
              <p className="leave-requests-panel__empty">
                Selecione uma solicitação para ver o detalhe e os anexos.
              </p>
            ) : null}
            {detailQuery.isLoading ? <p>Carregando detalhe…</p> : null}
            {detail ? (
              <>
                <div className="leave-detail__header">
                  <h2>{detail.employeeName}</h2>
                  <LeaveStatusBadge status={detail.status} rmSyncStatus={detail.rmSyncStatus} />
                  <p className="leave-detail__period">{detail.title}</p>
                  <p className="leave-detail__period">
                    {detail.employeeId ? `Chapa ${detail.employeeId} · ` : ""}
                    {detail.email}
                  </p>
                  <p className="leave-detail__period">
                    {formatDate(detail.startDate)}
                    {detail.endDate ? ` — ${formatDate(detail.endDate)}` : ""}
                    {detail.days != null
                      ? ` · ${formatSensitiveCount(detail.days, true)} dia(s)`
                      : ""}
                  </p>
                  {detail.notes ? <p className="leave-detail__note">{detail.notes}</p> : null}
                  <p className="leave-detail__source">{detail.approvalNote}</p>
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
                            <div>
                              <span className="leave-attachments__name">{attachment.fileName}</span>
                              <span className="leave-attachments__size">
                                {formatFileSize(attachment.sizeBytes)}
                              </span>
                            </div>
                          </div>
                          <div className="leave-attachments__actions">
                            <button
                              type="button"
                              className="pay-btn pay-btn--ghost"
                              data-testid="leave-attachment-view"
                              onClick={() => setViewerAttachment(attachment)}
                            >
                              Visualizar
                            </button>
                            <button
                              type="button"
                              className="pay-btn pay-btn--ghost"
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

                <div className="leave-gestao-actions">
                  <button
                    type="button"
                    className="pay-btn"
                    disabled={pdfBusy}
                    onClick={() => void handlePdf("print")}
                  >
                    Imprimir PDF
                  </button>
                  <button
                    type="button"
                    className="pay-btn pay-btn--ghost"
                    disabled={pdfBusy}
                    onClick={() => void handlePdf("download")}
                  >
                    Baixar PDF
                  </button>
                </div>

                <h3 className="leave-timeline__title">Linha do tempo</h3>
                <ol className="leave-timeline">
                  {detail.timeline.map((event, index) => (
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
                  {detail.rmExternalId ? ` · RM ${detail.rmExternalId}` : ""}
                </p>
              </>
            ) : null}
            {!detailQuery.isLoading && selectedId && !detail && !forbidden ? (
              <p>Solicitação não encontrada ou sem permissão.</p>
            ) : null}
          </section>
        </div>
      )}

      {selectedId ? (
        <LeaveAttachmentViewerModal
          open={viewerAttachment !== null}
          recordId={selectedId}
          attachment={viewerAttachment}
          onClose={() => setViewerAttachment(null)}
        />
      ) : null}
    </main>
  );
}
