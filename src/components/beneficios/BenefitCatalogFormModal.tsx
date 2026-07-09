import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import type { BenefitCatalogItemDto, UpsertBenefitCatalogRequest } from "../../api/types";
import { BENEFIT_CATEGORIES, BENEFIT_STATUSES } from "../../config/beneficios/settings";
import {
  BenefitCatalogDependentsEditor,
  BenefitCatalogLinesEditor,
  BenefitCatalogNotesEditor,
} from "./BenefitCatalogDetailsEditor";
import { BenefitDetailEmployeePreview, catalogFormToPreview } from "./BenefitDetailPreview";

export type BenefitCatalogFormState = UpsertBenefitCatalogRequest;

const WIZARD_STEPS = [
  { id: "identity", label: "Identidade" },
  { id: "classification", label: "Classificação" },
  { id: "details", label: "Detalhamento" },
  { id: "extras", label: "Dependentes" },
  { id: "portal", label: "Portal" },
  { id: "preview", label: "Prévia" },
] as const;

type WizardStepId = (typeof WIZARD_STEPS)[number]["id"];

export function emptyBenefitCatalogForm(): BenefitCatalogFormState {
  return {
    catalogKey: "",
    title: "",
    desc: "",
    category: "saude",
    provider: "",
    status: "obrigatorio",
    featured: false,
    isActive: true,
    portalUrl: "",
    helpText: "",
    defaultMonthlyValue: null,
    sortOrder: 0,
    lines: [],
    dependents: [],
    notes: [],
  };
}

export function formFromCatalogDto(item: BenefitCatalogItemDto): BenefitCatalogFormState {
  return {
    catalogKey: item.catalogKey,
    title: item.title,
    desc: item.desc,
    category: item.category,
    provider: item.provider,
    status: item.status,
    featured: item.featured,
    isActive: item.isActive,
    portalUrl: item.portalUrl ?? "",
    helpText: item.helpText,
    defaultMonthlyValue: item.defaultMonthlyValue ?? null,
    sortOrder: item.sortOrder,
    lines: item.lines.map((line) => ({ ...line })),
    dependents: item.dependents.map((dep) => ({ ...dep })),
    notes: [...item.notes],
  };
}

type Props = {
  open: boolean;
  initial: BenefitCatalogFormState;
  saving?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (form: BenefitCatalogFormState) => void;
  isEdit?: boolean;
};

function sanitizeDetails(form: BenefitCatalogFormState): BenefitCatalogFormState {
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

function validateStep(stepId: WizardStepId, form: BenefitCatalogFormState) {
  if (stepId === "identity" && !form.title.trim()) {
    return "Informe o título do benefício.";
  }

  if (stepId === "details") {
    for (const line of form.lines) {
      const hasContent = line.label.trim() || line.note?.trim() || line.amount != null;
      if (hasContent && !line.label.trim()) {
        return "Cada linha do detalhamento precisa de um rótulo.";
      }
    }
  }

  if (stepId === "extras") {
    for (const dep of form.dependents) {
      const hasContent = dep.name.trim() || dep.relation.trim() || dep.monthlyValue != null;
      if (hasContent && (!dep.name.trim() || !dep.relation.trim())) {
        return "Dependentes no modelo precisam de nome e vínculo.";
      }
    }
  }

  return null;
}

export function BenefitCatalogFormModal({
  open,
  initial,
  saving,
  error,
  onClose,
  isEdit,
  onSubmit,
}: Props) {
  const [form, setForm] = useState(initial);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const wasOpenRef = useRef(false);

  const currentStep = WIZARD_STEPS[stepIndex];
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1;

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }
    if (!wasOpenRef.current) {
      setForm(initial);
      setStepIndex(0);
      setStepError(null);
    }
    wasOpenRef.current = true;
  }, [open, initial]);

  if (!open) return null;

  const stepState = (index: number) => {
    if (index < stepIndex) return "is-done";
    if (index === stepIndex) return "is-active";
    return "";
  };

  const goNext = () => {
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
    const message = validateAllSteps();
    if (message) {
      setStepError(message);
      return;
    }
    setStepError(null);
    const payload = sanitizeDetails(isEdit ? form : { ...form, catalogKey: "" });
    onSubmit(payload);
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
        aria-labelledby="benefit-catalog-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="beneficios-gestao__modal-head">
          <div className="beneficios-gestao__modal-heading">
            <h2 id="benefit-catalog-modal-title">
              {isEdit ? "Editar benefício" : "Novo benefício no catálogo"}
            </h2>
            <p className="beneficios-gestao__modal-subtitle">
              Etapa {stepIndex + 1} de {WIZARD_STEPS.length} · {currentStep.label}
            </p>
          </div>
          <button type="button" className="beneficios-gestao__modal-close" aria-label="Fechar" onClick={onClose}>
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <form className="beneficios-gestao__modal-form" onSubmit={(e) => e.preventDefault()} onKeyDown={handleFormKeyDown}>
          <div className="beneficios-gestao__modal-body">
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
                      Defina o nome e a descrição exibidos ao colaborador. A identificação interna é gerada
                      automaticamente.
                    </p>
                    <label>
                      Título
                      <input
                        value={form.title}
                        placeholder="Nome exibido no portal"
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
                        placeholder="Resumo do benefício para o colaborador"
                      />
                    </label>
                  </div>
                ) : null}

                {currentStep.id === "classification" ? (
                  <div className="beneficios-gestao__wizard-form">
                    <p className="beneficios-gestao__wizard-hint">
                      Categoria, operadora e valores padrão usados ao atribuir o benefício.
                    </p>
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
                        placeholder="Ex: Unimed, Alelo..."
                        onChange={(event) => setForm({ ...form, provider: event.target.value })}
                      />
                    </label>
                    <div className="beneficios-gestao__form-row">
                      <label>
                        Valor mensal padrão
                        <input
                          type="number"
                          step="0.01"
                          value={form.defaultMonthlyValue ?? ""}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              defaultMonthlyValue: event.target.value ? Number(event.target.value) : null,
                            })
                          }
                        />
                      </label>
                      <label>
                        Ordem de exibição
                        <input
                          type="number"
                          value={form.sortOrder}
                          onChange={(event) =>
                            setForm({ ...form, sortOrder: Number(event.target.value) || 0 })
                          }
                        />
                      </label>
                    </div>
                  </div>
                ) : null}

                {currentStep.id === "details" ? (
                  <div className="beneficios-gestao__wizard-form">
                    <p className="beneficios-gestao__wizard-hint">
                      Tabela &quot;Detalhamento&quot; na view do colaborador. Use valor numérico, texto informativo
                      (sem valor) ou ambos — como coparticipação, licenças ou saldo.
                    </p>
                    <BenefitCatalogLinesEditor
                      lines={form.lines}
                      onChange={(lines) => setForm({ ...form, lines })}
                    />
                  </div>
                ) : null}

                {currentStep.id === "extras" ? (
                  <div className="beneficios-gestao__wizard-form">
                    <BenefitCatalogDependentsEditor
                      dependents={form.dependents}
                      onChange={(dependents) => setForm({ ...form, dependents })}
                    />
                    <BenefitCatalogNotesEditor
                      notes={form.notes}
                      onChange={(notes) => setForm({ ...form, notes })}
                    />
                  </div>
                ) : null}

                {currentStep.id === "portal" ? (
                  <div className="beneficios-gestao__wizard-form">
                    <p className="beneficios-gestao__wizard-hint">
                      Links, orientações e opções de publicação no portal do colaborador.
                    </p>
                    <label>
                      URL do portal
                      <input
                        value={form.portalUrl ?? ""}
                        placeholder="https://..."
                        onChange={(event) => setForm({ ...form, portalUrl: event.target.value })}
                      />
                    </label>
                    <label>
                      Texto de ajuda
                      <textarea
                        value={form.helpText}
                        onChange={(event) => setForm({ ...form, helpText: event.target.value })}
                        rows={3}
                        placeholder="Orientações exibidas ao colaborador"
                      />
                    </label>
                    <label className="beneficios-gestao__checkbox">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(event) => setForm({ ...form, featured: event.target.checked })}
                      />
                      Destaque na página do colaborador
                    </label>
                    <label className="beneficios-gestao__checkbox">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                      />
                      Ativo no catálogo
                    </label>
                  </div>
                ) : null}

                {currentStep.id === "preview" ? (
                  <BenefitDetailEmployeePreview detail={catalogFormToPreview(form)} />
                ) : null}

                {stepError ? <p className="beneficios-gestao__error">{stepError}</p> : null}
                {error ? <p className="beneficios-gestao__error">{error}</p> : null}
              </div>
            </div>
          </div>

          <footer className="beneficios-gestao__modal-footer">
            <div className="beneficios-gestao__modal-footer-start">
              <button type="button" className="beneficios-gestao-btn beneficios-gestao-btn--ghost" onClick={onClose}>
                Cancelar
              </button>
            </div>
            <div className="beneficios-gestao__modal-footer-end">
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
                  {saving ? "Salvando…" : "Salvar"}
                </button>
              ) : (
                <button type="button" className="beneficios-gestao-btn beneficios-gestao-btn--primary" onClick={goNext}>
                  Continuar
                </button>
              )}
            </div>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}
