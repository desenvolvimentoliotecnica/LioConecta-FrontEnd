import { useEffect, useState } from "react";
import { useBenefitDetail } from "../../api/hooks/useBenefits";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import { BenefitDetailPreviewContent } from "./BenefitDetailPreview";

type Props = {
  open: boolean;
  benefitId: string | null;
  showValues: boolean;
  requesting?: boolean;
  onToggleShowValues: () => void;
  onClose: () => void;
  onRequest?: (benefitId: string, notes: string) => void;
};

export function BenefitDetailModal({
  open,
  benefitId,
  showValues,
  requesting = false,
  onToggleShowValues,
  onClose,
  onRequest,
}: Props) {
  const detailQuery = useBenefitDetail(open ? benefitId : null);
  const detail = detailQuery.data;
  const [compose, setCompose] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesError, setNotesError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setCompose(false);
      setNotes("");
      setNotesError(null);
    }
  }, [open]);

  useEffect(() => {
    setCompose(false);
    setNotes("");
    setNotesError(null);
  }, [benefitId]);

  const handleSubmit = () => {
    if (!benefitId || !onRequest) return;
    const trimmed = notes.trim();
    if (trimmed.length < 10) {
      setNotesError("Descreva o que precisa (mínimo 10 caracteres).");
      return;
    }
    setNotesError(null);
    onRequest(benefitId, trimmed);
  };

  return (
    <ContrachequeModal
      open={open}
      title={
        compose
          ? `Falar com o RH — ${detail?.title ?? "benefício"}`
          : (detail?.title ?? "Consultar benefício")
      }
      wide
      showValues={compose ? undefined : showValues}
      onToggleShowValues={compose ? undefined : onToggleShowValues}
      onClose={onClose}
      footer={
        compose ? (
          <>
            <button
              type="button"
              className="pay-modal__btn"
              disabled={requesting || !benefitId}
              data-testid="benefit-request-submit"
              onClick={handleSubmit}
            >
              {requesting ? "Enviando…" : "Enviar ao RH"}
            </button>
            <button
              type="button"
              className="pay-modal__btn pay-modal__btn--ghost"
              disabled={requesting}
              onClick={() => {
                setCompose(false);
                setNotesError(null);
              }}
            >
              Voltar
            </button>
          </>
        ) : (
          <>
            {onRequest && benefitId ? (
              <button
                type="button"
                className="pay-modal__btn"
                data-testid="benefit-request-start"
                onClick={() => setCompose(true)}
              >
                Solicitar alteração ou informação
              </button>
            ) : null}
            {detail?.portalUrl ? (
              <a
                className="pay-modal__btn pay-modal__btn--ghost"
                href={detail.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir portal
              </a>
            ) : null}
            <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose}>
              Fechar
            </button>
          </>
        )
      }
    >
      {detailQuery.isLoading ? <p className="pay-modal__loading">Carregando…</p> : null}
      {detailQuery.isError ? (
        <p className="pay-modal__error">Não foi possível carregar os detalhes do benefício.</p>
      ) : null}

      {compose ? (
        <div className="benefit-request-form">
          <p>
            Descreva a alteração desejada ou a dúvida sobre o benefício{" "}
            <strong>{detail?.title ?? "selecionado"}</strong>. O RH receberá o pedido na fila de
            Solicitações RH e poderá responder, anexar arquivos, aprovar ou rejeitar.
          </p>
          <label className="benefit-request-form__label" htmlFor="benefit-request-notes">
            Observação <span aria-hidden="true">*</span>
          </label>
          <textarea
            id="benefit-request-notes"
            className="benefit-request-form__notes"
            data-testid="benefit-request-notes"
            rows={5}
            value={notes}
            disabled={requesting}
            placeholder="Ex.: incluir dependente, alterar plano, dúvida sobre elegibilidade, valor ou elegibilidade…"
            onChange={(e) => {
              setNotes(e.target.value);
              if (notesError) setNotesError(null);
            }}
          />
          {notesError ? (
            <p className="pay-modal__error" role="alert">
              {notesError}
            </p>
          ) : (
            <p className="benefit-request-form__hint">Mínimo de 10 caracteres.</p>
          )}
        </div>
      ) : detail ? (
        <BenefitDetailPreviewContent detail={detail} showValues={showValues} />
      ) : null}
    </ContrachequeModal>
  );
}
