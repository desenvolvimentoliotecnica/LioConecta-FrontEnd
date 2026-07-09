import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useBenefitManagementDetail } from "../../api/hooks/useBenefitsManagement";
import type { BenefitEmployeeDetailDto, UpsertEmployeeBenefitRequest } from "../../api/types";
import { BENEFIT_CATEGORIES, BENEFIT_STATUSES } from "../../config/beneficios/settings";
import {
  BenefitCatalogDependentsEditor,
  BenefitCatalogLinesEditor,
  BenefitCatalogNotesEditor,
} from "./BenefitCatalogDetailsEditor";
import { BenefitDetailEmployeePreview, employeeFormToPreview } from "./BenefitDetailPreview";

export type BenefitEmployeeFormState = UpsertEmployeeBenefitRequest & {
  personName?: string;
};

const WIZARD_STEPS = [
  { id: "identity", label: "Identidade" },
  { id: "classification", label: "Classificação" },
  { id: "details", label: "Detalhamento" },
  { id: "extras", label: "Dependentes" },
  { id: "portal", label: "Portal" },
  { id: "preview", label: "Prévia" },
] as const;

type WizardStepId = (typeof WIZARD_STEPS)[number]["id"];

export function formFromEmployeeDetail(item: BenefitEmployeeDetailDto): BenefitEmployeeFormState {
  return {
    personId: item.personId,
    personName: item.personName,
    benefitKey: item.benefitKey,
    title: item.title,
    desc: item.desc,
    category: item.category,
    provider: item.provider,
    status: item.status,
    featured: item.featured,
    isActive: item.isActive,
    portalUrl: item.portalUrl ?? "",
    helpText: item.helpText,
    monthlyValue: item.monthlyValue ?? null,
    lines: item.lines.map((line) => ({ ...line })),
    dependents: item.dependents.map((dep) => ({ ...dep })),
    notes: [...item.notes],
  };
}

type Props = {
  open: boolean;
  linkId: string | null;
  saving?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (form: UpsertEmployeeBenefitRequest) => void;
};

function sanitizeForm(form: BenefitEmployeeFormState): UpsertEmployeeBenefitRequest {
  return {
    personId: form.personId,
    benefitKey: form.benefitKey,
    title: form.title.trim(),
    desc: form.desc.trim(),
    category: form.category,
    provider: form.provider.trim(),
    status: form.status,
    featured: form.featured,
    isActive: form.isActive,
    portalUrl: form.portalUrl?.trim() || null,
    helpText: form.helpText.trim(),
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

function validateStep(stepId: WizardStepId, form: BenefitEmployeeFormState) {
  if (stepId === "identity" && !form.title.trim()) {
    return "Informe o título do benefício.";
  }

  if (stepId === "details") {
    for (const line of form.lines ?? []) {
      const hasContent = line.label.trim() || line.note?.trim() || line.amount != null;
      if (hasContent && !line.label.trim()) {
        return "Cada linha do detalhamento precisa de um rótulo.";
      }
    }
  }

  if (stepId === "extras") {
    for (const dep of form.dependents ?? []) {
      const hasContent = dep.name.trim() || dep.relation.trim() || dep.monthlyValue != null;
      if (hasContent && (!dep.name.trim() || !dep.relation.trim())) {
        return "Dependentes precisam de nome e vínculo.";
      }
    }
  }

  return null;
}

export function BenefitEmployeeFormModal({ open, linkId, saving, error, onClose, onSubmit }: Props) {
  const detailQuery = useBenefitManagementDetail(open ? linkId : null);
  const [form, setForm] = useState<BenefitEmployeeFormState | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const wasOpenRef = useRef(false);
  const loadedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      loadedIdRef.current = null;
      setForm(null);
      return;
    }

    if (detailQuery.data && detailQuery.data.id !== loadedIdRef.current) {
      setForm(formFromEmployeeDetail(detailQuery.data));
      setStepIndex(0);
      setStepError(null);
      loadedIdRef.current = detailQuery.data.id;
    }

    wasOpenRef.current = true;
  }, [open, detailQuery.data]);

  if (!open) return null;

  const currentStep = WIZARD_STEPS[stepIndex];
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1;
  const isLoading = detailQuery.isLoading || !form;

  const stepState = (index: number) => {
    if (index < stepIndex) return "is-done";
    if (index === stepIndex) return "is-active";
    return "";
  };

  const goNext = () => {
    if (!form) return;
    const message = validateStep(currentStep.id, form);
    if (message) {
      setStepError(message);
      return;
    }
    setStepError(null);
    setStepIndex((value) => Math.min(value + 1, WIZARD_STEPS.length - 1));
  };

  const goBack = () => {
    setStepError(null);
    setStepIndex((value) => Math.max(value - 1, 0));
  };

  const validateAllSteps = () => {
    if (!form) return "Carregando dados do vínculo…";
    for (let index = 0; index < WIZARD_STEPS.length - 1; index += 1) {
      const message = validateStep(WIZARD_STEPS[index].id, form);
      if (message) {
        setStepIndex(index);
        return message;
      }
    }
    return null;
  };

  const handleSave = () => {
    if (!form) return;
    const message = validateAllSteps();
    if (message) {
      setStepError(message);
      return;
    }
    setStepError(null);
    onSubmit(sanitizeForm(form));
  };

  const handleFormKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Enter" || event.target instanceof HTMLTextAreaElement) return;
    event.preventDefault();
    if (isLastStep) {
      handleSave();
      return;
    }
    goNext();
  };

  return createPortal(
    <div className="beneficios-gestao__modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className={`beneficios-gestao__modal-dialog beneficios-gestao__modal-dialog--wide${
          currentStep.id === "preview" ? " beneficios-gestao__modal-dialog--preview" : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="benefit-employee-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="beneficios-gestao__modal-head">
          <div className="beneficios-gestao__modal-heading">
            <h2 id="benefit-employee-modal-title">Editar vínculo do colaborador</h2>
            <p className="beneficios-gestao__modal-subtitle">
              {form?.personName ? (
                <>
                  {form.personName} · {form.title || "Benefício"}
                </>
              ) : (
                "Carregando…"
              )}
              {form ? ` · Etapa ${stepIndex + 1} de ${WIZARD_STEPS.length} · ${currentStep.label}` : null}
            </p>
          </div>
          <button type="button" className="beneficios-gestao__modal-close" aria-label="Fechar" onClick={onClose}>
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <form className="beneficios-gestao__modal-form" onSubmit={(e) => e.preventDefault()} onKeyDown={handleFormKeyDown}>
          <div className="beneficios-gestao__modal-body">
            {detailQuery.isError ? (
              <p className="beneficios-gestao__error">Não foi possível carregar o vínculo.</p>
            ) : isLoading ? (
              <p className="beneficios-gestao__field-hint">Carregando detalhes do vínculo…</p>
            ) : (
              <div className="beneficios-gestao__wizard">
                <div className="beneficios-gestao__wizard-steps" aria-label="Progresso">
                  {WIZARD_STEPS.map((step, index) => (
                    <div key={step.id} className={`beneficios-gestao__wizard-step ${stepState(index)}`}>
                      <span className="beneficios-gestao__wizard-step-index">{index + 1}</span>
                      <span className="beneficios-gestao__wizard-step-label">{step.label}</span>
                    </div>
                  ))}
                </div>

                <div className="beneficios-gestao__wizard-panel">
                  {currentStep.id === "identity" ? (
                    <div className="beneficios-gestao__wizard-form">
                      <p className="beneficios-gestao__wizard-hint">
                        Ajuste o que o colaborador vê neste vínculo. A chave interna ({form.benefitKey}) não
                        pode ser alterada.
                      </p>
                      <label>
                        Título
                        <input
                          value={form.title}
                          onChange={(event) => setForm({ ...form, title: event.target.value })}
                          required
                        />
                      </label>
                      <label>
                        Descrição
                        <textarea
                          value={form.desc}
                          onChange={(event) => setForm({ ...form, desc: event.target.value })}
                          rows={4}
                        />
                      </label>
                    </div>
                  ) : null}

                  {currentStep.id === "classification" ? (
                    <div className="beneficios-gestao__wizard-form">
                      <div className="beneficios-gestao__form-row">
                        <label>
                          Categoria
                          <select
                            value={form.category}
                            onChange={(event) => setForm({ ...form, category: event.target.value })}
                          >
                            {BENEFIT_CATEGORIES.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Status
                          <select
                            value={form.status}
                            onChange={(event) => setForm({ ...form, status: event.target.value })}
                          >
                            {BENEFIT_STATUSES.map((status) => (
                              <option key={status.id} value={status.id}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <label>
                        Fornecedor / operadora
                        <input
                          value={form.provider}
                          onChange={(event) => setForm({ ...form, provider: event.target.value })}
                        />
                      </label>
                      <div className="beneficios-gestao__form-row">
                        <label>
                          Valor mensal (colaborador)
                          <input
                            type="number"
                            step="0.01"
                            value={form.monthlyValue ?? ""}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                monthlyValue: event.target.value ? Number(event.target.value) : null,
                              })
                            }
                          />
                        </label>
                        <label className="beneficios-gestao__checkbox beneficios-gestao__checkbox--inline">
                          <input
                            type="checkbox"
                            checked={form.featured}
                            onChange={(event) => setForm({ ...form, featured: event.target.checked })}
                          />
                          Destaque na página do colaborador
                        </label>
                      </div>
                    </div>
                  ) : null}

                  {currentStep.id === "details" ? (
                    <div className="beneficios-gestao__wizard-form">
                      <p className="beneficios-gestao__wizard-hint">
                        Detalhamento específico deste colaborador — saldos, dependentes incluídos, coparticipação,
                        etc.
                      </p>
                      <BenefitCatalogLinesEditor
                        lines={form.lines ?? []}
                        onChange={(lines) => setForm({ ...form, lines })}
                      />
                    </div>
                  ) : null}

                  {currentStep.id === "extras" ? (
                    <div className="beneficios-gestao__wizard-form">
                      <BenefitCatalogDependentsEditor
                        dependents={form.dependents ?? []}
                        onChange={(dependents) => setForm({ ...form, dependents })}
                      />
                      <BenefitCatalogNotesEditor
                        notes={form.notes ?? []}
                        onChange={(notes) => setForm({ ...form, notes })}
                      />
                    </div>
                  ) : null}

                  {currentStep.id === "portal" ? (
                    <div className="beneficios-gestao__wizard-form">
                      <label>
                        URL do portal
                        <input
                          value={form.portalUrl ?? ""}
                          onChange={(event) => setForm({ ...form, portalUrl: event.target.value })}
                        />
                      </label>
                      <label>
                        Texto de ajuda
                        <textarea
                          value={form.helpText}
                          onChange={(event) => setForm({ ...form, helpText: event.target.value })}
                          rows={3}
                        />
                      </label>
                      <label className="beneficios-gestao__checkbox">
                        <input
                          type="checkbox"
                          checked={form.isActive}
                          onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                        />
                        Vínculo ativo (visível ao colaborador)
                      </label>
                    </div>
                  ) : null}

                  {currentStep.id === "preview" ? (
                    <BenefitDetailEmployeePreview detail={employeeFormToPreview(form)} />
                  ) : null}

                  {stepError ? <p className="beneficios-gestao__error">{stepError}</p> : null}
                  {error ? <p className="beneficios-gestao__error">{error}</p> : null}
                </div>
              </div>
            )}
          </div>

          <footer className="beneficios-gestao__modal-footer">
            <div className="beneficios-gestao__modal-footer-start">
              <button type="button" className="beneficios-gestao-btn beneficios-gestao-btn--ghost" onClick={onClose}>
                Cancelar
              </button>
            </div>
            <div className="beneficios-gestao__modal-footer-end">
              {!isLoading && !detailQuery.isError ? (
                <>
                  {stepIndex > 0 ? (
                    <button type="button" className="beneficios-gestao-btn beneficios-gestao-btn--ghost" onClick={goBack}>
                      Voltar
                    </button>
                  ) : null}
                  {isLastStep ? (
                    <button
                      type="button"
                      className="beneficios-gestao-btn beneficios-gestao-btn--primary"
                      disabled={saving}
                      onClick={handleSave}
                    >
                      {saving ? "Salvando…" : "Salvar vínculo"}
                    </button>
                  ) : (
                    <button type="button" className="beneficios-gestao-btn beneficios-gestao-btn--primary" onClick={goNext}>
                      Continuar
                    </button>
                  )}
                </>
              ) : null}
            </div>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}
