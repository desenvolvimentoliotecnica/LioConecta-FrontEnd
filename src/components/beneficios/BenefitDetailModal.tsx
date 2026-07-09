import { useBenefitDetail } from "../../api/hooks/useBenefits";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import { BenefitDetailPreviewContent } from "./BenefitDetailPreview";

type Props = {
  open: boolean;
  benefitId: string | null;
  showValues: boolean;
  onToggleShowValues: () => void;
  onClose: () => void;
  onRequest?: (benefitId: string) => void;
};

export function BenefitDetailModal({
  open,
  benefitId,
  showValues,
  onToggleShowValues,
  onClose,
  onRequest,
}: Props) {
  const detailQuery = useBenefitDetail(open ? benefitId : null);
  const detail = detailQuery.data;
  const isOptional = detail?.status === "opcional";

  return (
    <ContrachequeModal
      open={open}
      title={detail?.title ?? "Consultar benefício"}
      wide
      showValues={showValues}
      onToggleShowValues={onToggleShowValues}
      onClose={onClose}
      footer={
        <>
          {isOptional && onRequest && benefitId ? (
            <button type="button" className="pay-modal__btn" onClick={() => onRequest(benefitId)}>
              Solicitar alteração
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
      }
    >
      {detailQuery.isLoading ? <p className="pay-modal__loading">Carregando…</p> : null}
      {detailQuery.isError ? (
        <p className="pay-modal__error">Não foi possível carregar os detalhes do benefício.</p>
      ) : null}
      {detail ? <BenefitDetailPreviewContent detail={detail} showValues={showValues} /> : null}
    </ContrachequeModal>
  );
}
