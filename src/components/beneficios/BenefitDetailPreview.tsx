import { useState } from "react";
import type {
  BenefitDependentDto,
  BenefitDetailLineDto,
  UpsertEmployeeBenefitRequest,
} from "../../api/types";
import { formatMoney } from "../../utils/money";
import "../../styles/beneficios-page.css";

export type BenefitDetailPreviewData = {
  title: string;
  desc: string;
  status: string;
  portalUrl?: string | null;
  monthlyValue?: number | null;
  lines: BenefitDetailLineDto[];
  dependents: BenefitDependentDto[];
  notes: string[];
};

type CatalogPreviewSource = {
  title: string;
  desc: string;
  status: string;
  portalUrl?: string | null;
  defaultMonthlyValue?: number | null;
  lines: BenefitDetailLineDto[];
  dependents: BenefitDependentDto[];
  notes: string[];
};

function formatLineValue(line: BenefitDetailPreviewData["lines"][number], showValues: boolean): string {
  if (line.amount !== null && line.amount !== undefined) {
    return formatMoney(line.amount, showValues);
  }
  return line.note ?? "—";
}

export function BenefitDetailPreviewContent({
  detail,
  showValues,
}: {
  detail: BenefitDetailPreviewData;
  showValues: boolean;
}) {
  return (
    <>
      <p className="benefit-detail__desc">{detail.desc}</p>

      {detail.monthlyValue !== null && detail.monthlyValue !== undefined ? (
        <div className="pay-summary-row">
          <div className="pay-summary-box">
            <div className="pay-summary-box__label">Valor mensal (colaborador)</div>
            <div className="pay-summary-box__value">{formatMoney(detail.monthlyValue, showValues)}</div>
          </div>
        </div>
      ) : null}

      {detail.lines.length > 0 ? (
        <>
          <h3 className="benefit-detail__section">Detalhamento</h3>
          <table className="pay-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Valor / Info</th>
              </tr>
            </thead>
            <tbody>
              {detail.lines.map((line, index) => (
                <tr key={`${line.label}-${index}`}>
                  <td>
                    {line.label}
                    {line.note && line.amount !== null && line.amount !== undefined ? (
                      <div className="benefit-detail__note">{line.note}</div>
                    ) : null}
                  </td>
                  <td>{formatLineValue(line, showValues)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}

      {detail.dependents.length > 0 ? (
        <>
          <h3 className="benefit-detail__section">Dependentes</h3>
          <table className="pay-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Vínculo</th>
                <th>Mensalidade</th>
              </tr>
            </thead>
            <tbody>
              {detail.dependents.map((dep, index) => (
                <tr key={`${dep.name}-${dep.relation}-${index}`}>
                  <td>{dep.name}</td>
                  <td>{dep.relation}</td>
                  <td>
                    {dep.monthlyValue !== null && dep.monthlyValue !== undefined
                      ? formatMoney(dep.monthlyValue, showValues)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}

      {detail.notes.length > 0 ? (
        <ul className="benefit-detail__notes">
          {detail.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

export function BenefitDetailEmployeePreview({ detail }: { detail: BenefitDetailPreviewData }) {
  const [showValues, setShowValues] = useState(true);

  return (
    <div className="beneficios-gestao__preview">
      <p className="beneficios-gestao__wizard-hint">
        Visualização idêntica ao modal exibido ao colaborador em Meus benefícios. Confira antes de salvar.
      </p>
      <div className="pay-modal pay-modal--wide beneficios-gestao__preview-frame" aria-label="Prévia do benefício">
        <header className="pay-modal__header">
          <h2 className="pay-modal__title">{detail.title || "Consultar benefício"}</h2>
          <button type="button" className="pay-modal__close" aria-label="Fechar" tabIndex={-1} disabled>
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>
        <div className="pay-modal__body">
          <BenefitDetailPreviewContent detail={detail} showValues={showValues} />
        </div>
        <footer className="pay-modal__footer">
          <div className="pay-modal__footer-start">
            <button
              type="button"
              className={`pay-toggle-values pay-toggle-values--modal${showValues ? " is-active" : ""}`}
              aria-pressed={showValues}
              onClick={() => setShowValues((value) => !value)}
            >
              <i className={`fa-regular ${showValues ? "fa-eye" : "fa-eye-slash"}`} aria-hidden="true" />
              {showValues ? "Ocultar valores" : "Mostrar valores"}
            </button>
          </div>
          <div className="pay-modal__footer-end">
            <button type="button" className="pay-modal__btn" tabIndex={-1} disabled>
              Solicitar alteração ou informação
            </button>
            {detail.portalUrl ? (
              <span className="pay-modal__btn pay-modal__btn--ghost beneficios-gestao__preview-btn-static">
                Abrir portal
              </span>
            ) : null}
            <span className="pay-modal__btn pay-modal__btn--ghost beneficios-gestao__preview-btn-static">
              Fechar
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function sanitizeCatalogLines(form: CatalogPreviewSource) {
  return {
    ...form,
    lines: form.lines
      .filter((line) => line.label.trim() || line.note?.trim() || line.amount != null)
      .map((line) => ({
        label: line.label.trim(),
        amount: line.amount ?? null,
        note: line.note?.trim() || null,
      })),
    dependents: form.dependents
      .filter((dep) => dep.name.trim() || dep.relation.trim() || dep.monthlyValue != null)
      .map((dep) => ({
        name: dep.name.trim(),
        relation: dep.relation.trim(),
        monthlyValue: dep.monthlyValue ?? null,
      })),
    notes: form.notes.map((note) => note.trim()).filter(Boolean),
  };
}

export function catalogFormToPreview(form: CatalogPreviewSource): BenefitDetailPreviewData {
  const clean = sanitizeCatalogLines(form);
  return {
    title: clean.title.trim(),
    desc: clean.desc.trim(),
    status: clean.status,
    portalUrl: clean.portalUrl?.trim() || null,
    monthlyValue: clean.defaultMonthlyValue ?? null,
    lines: clean.lines,
    dependents: clean.dependents,
    notes: clean.notes,
  };
}

export function employeeFormToPreview(
  form: UpsertEmployeeBenefitRequest & { personName?: string },
): BenefitDetailPreviewData {
  return {
    title: form.title.trim(),
    desc: form.desc.trim(),
    status: form.status,
    portalUrl: form.portalUrl?.trim() || null,
    monthlyValue: form.monthlyValue ?? null,
    lines: (form.lines ?? [])
      .filter((line) => line.label.trim() || line.note?.trim() || line.amount != null)
      .map((line) => ({
        label: line.label.trim(),
        amount: line.amount ?? null,
        note: line.note?.trim() || null,
      })),
    dependents: (form.dependents ?? [])
      .filter((dep) => dep.name.trim() || dep.relation.trim() || dep.monthlyValue != null)
      .map((dep) => ({
        name: dep.name.trim(),
        relation: dep.relation.trim(),
        monthlyValue: dep.monthlyValue ?? null,
      })),
    notes: (form.notes ?? []).map((note) => note.trim()).filter(Boolean),
  };
}
