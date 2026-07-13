import { useEffect, useState } from "react";
import {
  canConfirmServiceRequestClosure,
  canDecideServiceRequest,
  canFinalizeServiceRequest,
  canMessageServiceRequest,
  serviceRequestStatusBannerText,
  serviceRequestStatusLabel,
  serviceRequestStatusTone,
  serviceRequestTypeLabel,
  useServiceRequestApprove,
  useServiceRequestConfirmClosure,
  useServiceRequestFinalize,
  useServiceRequestManagementDetail,
  useServiceRequestMineDetail,
  useServiceRequestReject,
  useServiceRequestReplyAsManager,
  useServiceRequestReplyAsRequester,
} from "../../api/hooks/useServiceRequests";
import type { ServiceRequestDto } from "../../api/types";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import { ServiceRequestThread } from "./ServiceRequestThread";

type Props = {
  requestId: string | null;
  mode: "management" | "mine";
  onClose: () => void;
};

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
}

function readPayload(detail: ServiceRequestDto) {
  const p = detail.payload ?? {};
  return {
    benefitTitle: typeof p.benefitTitle === "string" ? p.benefitTitle : null,
    notes: typeof p.notes === "string" ? p.notes.trim() : null,
    competence: typeof p.competence === "string" ? p.competence : null,
    serviceId: typeof p.serviceId === "string" ? p.serviceId : null,
  };
}

export function ServiceRequestDetailModal({ requestId, mode, onClose }: Props) {
  const managementQuery = useServiceRequestManagementDetail(
    mode === "management" ? requestId : null,
  );
  const mineQuery = useServiceRequestMineDetail(mode === "mine" ? requestId : null);
  const detailQuery = mode === "management" ? managementQuery : mineQuery;
  const detail = detailQuery.data;

  const approveMutation = useServiceRequestApprove();
  const rejectMutation = useServiceRequestReject();
  const finalizeMutation = useServiceRequestFinalize();
  const confirmMutation = useServiceRequestConfirmClosure();
  const replyManagerMutation = useServiceRequestReplyAsManager();
  const replyRequesterMutation = useServiceRequestReplyAsRequester();

  const [decisionNote, setDecisionNote] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const busy =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    finalizeMutation.isPending ||
    confirmMutation.isPending ||
    replyManagerMutation.isPending ||
    replyRequesterMutation.isPending;

  const canDecide = mode === "management" && canDecideServiceRequest(detail?.status);
  const canFinalize = mode === "management" && canFinalizeServiceRequest(detail?.status);
  const canMessage = canMessageServiceRequest(detail?.status);
  const canConfirm = mode === "mine" && canConfirmServiceRequestClosure(detail?.status);
  const payload = detail ? readPayload(detail) : null;
  const statusTone = serviceRequestStatusTone(detail?.status);
  const statusLabel = serviceRequestStatusLabel(detail?.status);

  useEffect(() => {
    setDecisionNote("");
    setActionError(null);
  }, [requestId]);

  const handleDecide = async (action: "approve" | "reject") => {
    if (!requestId) return;
    setActionError(null);
    try {
      if (action === "approve") {
        await approveMutation.mutateAsync({ id: requestId, comment: decisionNote || undefined });
      } else {
        await rejectMutation.mutateAsync({ id: requestId, reason: decisionNote || undefined });
      }
      setDecisionNote("");
    } catch {
      setActionError(
        action === "approve"
          ? "Não foi possível aprovar o pedido."
          : "Não foi possível rejeitar o pedido.",
      );
    }
  };

  const handleFinalize = async () => {
    if (!requestId) return;
    setActionError(null);
    try {
      await finalizeMutation.mutateAsync({ id: requestId, comment: decisionNote || undefined });
      setDecisionNote("");
    } catch {
      setActionError("Não foi possível finalizar o atendimento.");
    }
  };

  const handleConfirm = async () => {
    if (!requestId) return;
    setActionError(null);
    try {
      await confirmMutation.mutateAsync(requestId);
    } catch {
      setActionError("Não foi possível confirmar o encerramento.");
    }
  };

  const handleSend = async (message: string, files: File[]) => {
    if (!requestId) return;
    if (mode === "management") {
      await replyManagerMutation.mutateAsync({ id: requestId, message, files });
    } else {
      await replyRequesterMutation.mutateAsync({ id: requestId, message, files });
    }
  };

  const subjectTitle =
    payload?.benefitTitle ??
    (detail ? serviceRequestTypeLabel(detail.type) : null) ??
    "Solicitação RH";

  return (
    <ContrachequeModal
      open={requestId !== null}
      title={subjectTitle}
      wide
      onClose={onClose}
      footer={
        <>
          {canConfirm ? (
            <button
              type="button"
              className="pay-modal__btn"
              disabled={busy}
              data-testid="sr-confirm-closure"
              onClick={() => void handleConfirm()}
            >
              {busy && confirmMutation.isPending ? "Confirmando…" : "Confirmar encerramento"}
            </button>
          ) : null}
          {canFinalize ? (
            <button
              type="button"
              className="pay-modal__btn"
              disabled={busy}
              data-testid="sr-finalize"
              onClick={() => void handleFinalize()}
            >
              {busy && finalizeMutation.isPending ? "Finalizando…" : "Finalizar atendimento"}
            </button>
          ) : null}
          {canDecide ? (
            <>
              <button
                type="button"
                className="pay-modal__btn"
                disabled={busy}
                data-testid="sr-gestao-approve"
                onClick={() => void handleDecide("approve")}
              >
                {busy && approveMutation.isPending ? "Aprovando…" : "Aprovar"}
              </button>
              <button
                type="button"
                className="pay-modal__btn pay-modal__btn--ghost"
                disabled={busy}
                data-testid="sr-gestao-reject"
                onClick={() => void handleDecide("reject")}
              >
                {busy && rejectMutation.isPending ? "Rejeitando…" : "Rejeitar"}
              </button>
            </>
          ) : null}
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose}>
            Fechar
          </button>
        </>
      }
    >
      <div className="leave-gestao-detail" data-testid="sr-gestao-detail">
        {detailQuery.isLoading ? <p>Carregando detalhe…</p> : null}
        {actionError ? (
          <p className="leave-form__error" role="alert">
            {actionError}
          </p>
        ) : null}

        {detail && payload ? (
          <>
            <div className={`sr-status-banner sr-status-banner--${statusTone}`} role="status">
              <span className={`leave-badge leave-badge--${statusTone}`}>{statusLabel}</span>
              <span className="sr-status-banner__text">
                {serviceRequestStatusBannerText(detail.status)}
              </span>
            </div>

            <div className="leave-detail__header">
              <div className="leave-detail__title-row">
                {mode === "management" ? (
                  <h3 className="leave-detail__title sr-detail__requester">
                    <span className="sr-detail__requester-label">Solicitante:</span>{" "}
                    {detail.requester.name}
                  </h3>
                ) : (
                  <h3 className="leave-detail__title">{serviceRequestTypeLabel(detail.type)}</h3>
                )}
              </div>

              <dl className="leave-detail__meta sr-detail__meta">
                <div>
                  <dt>
                    <i className="fa-solid fa-tag" aria-hidden="true" /> Tipo
                  </dt>
                  <dd>{serviceRequestTypeLabel(detail.type)}</dd>
                </div>
                {mode === "mine" ? (
                  <div>
                    <dt>
                      <i className="fa-solid fa-user" aria-hidden="true" /> Solicitante
                    </dt>
                    <dd>{detail.requester.name}</dd>
                  </div>
                ) : null}
                {detail.requester.title ? (
                  <div>
                    <dt>
                      <i className="fa-solid fa-briefcase" aria-hidden="true" /> Cargo
                    </dt>
                    <dd>{detail.requester.title}</dd>
                  </div>
                ) : null}
                {detail.requester.departmentName ? (
                  <div>
                    <dt>
                      <i className="fa-solid fa-building" aria-hidden="true" /> Departamento
                    </dt>
                    <dd>{detail.requester.departmentName}</dd>
                  </div>
                ) : null}
                {payload.competence ? (
                  <div>
                    <dt>
                      <i className="fa-regular fa-calendar" aria-hidden="true" /> Competência
                    </dt>
                    <dd>{payload.competence}</dd>
                  </div>
                ) : null}
                {payload.serviceId ? (
                  <div>
                    <dt>
                      <i className="fa-solid fa-file-invoice" aria-hidden="true" /> Serviço
                    </dt>
                    <dd>{payload.serviceId}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>
                    <i className="fa-regular fa-clock" aria-hidden="true" /> Criado em
                  </dt>
                  <dd>{formatDateTime(detail.createdAt)}</dd>
                </div>
                <div>
                  <dt>
                    <i className="fa-solid fa-rotate" aria-hidden="true" /> Atualizado em
                  </dt>
                  <dd>{formatDateTime(detail.updatedAt)}</dd>
                </div>
              </dl>

              {payload.notes ? (
                <div className="leave-detail__notes-box">
                  <span className="leave-detail__notes-label">Observação inicial do colaborador</span>
                  <p className="leave-detail__note">{payload.notes}</p>
                </div>
              ) : null}
            </div>

            {mode === "management" && (canDecide || canFinalize) ? (
              <div className="leave-detail__notes-box sr-decision-box">
                <label className="leave-detail__notes-label" htmlFor="sr-decision-reason">
                  Comentário da decisão / finalização (opcional)
                </label>
                <textarea
                  id="sr-decision-reason"
                  className="sr-decision-box__textarea"
                  value={decisionNote}
                  onChange={(e) => setDecisionNote(e.target.value)}
                  rows={2}
                  disabled={busy}
                  placeholder="Ex.: documentação ok · falta comprovante · atendimento concluído…"
                  data-testid="sr-gestao-reason"
                />
              </div>
            ) : null}

            <ServiceRequestThread
              detail={detail}
              mode={mode}
              canCompose={canMessage}
              busy={busy}
              onSend={handleSend}
            />
          </>
        ) : null}

        {!detailQuery.isLoading && requestId && !detail && !detailQuery.isError ? (
          <p>Solicitação não encontrada ou sem permissão.</p>
        ) : null}
        {detailQuery.isError ? (
          <p role="alert">Não foi possível carregar o pedido.</p>
        ) : null}
      </div>
    </ContrachequeModal>
  );
}
