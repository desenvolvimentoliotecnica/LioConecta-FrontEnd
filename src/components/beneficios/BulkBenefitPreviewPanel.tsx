import type { BulkBenefitPreviewDto } from "../../api/types";

type BulkBenefitPreviewPanelProps = {
  preview?: BulkBenefitPreviewDto;
  isLoading?: boolean;
  operationLabel: string;
};

export function BulkBenefitPreviewPanel({
  preview,
  isLoading,
  operationLabel,
}: BulkBenefitPreviewPanelProps) {
  if (isLoading) {
    return (
      <div className="beneficios-gestao__preview" aria-live="polite">
        Calculando impacto...
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="beneficios-gestao__preview beneficios-gestao__preview--empty">
        Selecione pessoas ou departamentos para ver o preview da operação.
      </div>
    );
  }

  return (
    <div className="beneficios-gestao__preview" aria-live="polite">
      <strong>{operationLabel}</strong>
      <p>
        Afetará <b>{preview.targetPeopleCount}</b> pessoa(s) · criar <b>{preview.wouldCreate}</b> · atualizar{" "}
        <b>{preview.wouldUpdate}</b> · ignorar <b>{preview.wouldSkip}</b>
      </p>
      {preview.samplePeople.length > 0 ? (
        <p className="beneficios-gestao__preview-sample">
          Exemplos: {preview.samplePeople.map((person) => person.name).join(", ")}
        </p>
      ) : null}
    </div>
  );
}
