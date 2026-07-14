import { useEffect, useMemo, useState } from "react";
import {
  useHelpDeskAreas,
  useHelpDeskFormCategories,
  useHelpDeskFormSchema,
  useHelpDeskForms,
} from "../../api/hooks/useHelpDesk";
import type {
  CreateHelpDeskTicketRequestDto,
  HelpDeskAreaDto,
  HelpDeskFormCategoryDto,
  HelpDeskFormQuestionDto,
  HelpDeskFormSummaryDto,
} from "../../api/types";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import {
  findAreaById,
  formatAreaServiceCount,
  getAreaIconClass,
} from "./helpDeskAreaCatalog";
import { helpDeskQueryErrorMessage } from "./helpDeskQueryError";
import {
  buildFormCategoryPath,
  findFormCategoryById,
  formsInCategory,
  formatFormCategoryPath,
  getChildFormCategories,
  getRootFormCategories,
  hasChildFormCategories,
} from "./helpDeskFormCategoryTree";

const WIZARD_STEPS = [
  { id: "area", label: "Área" },
  { id: "catalog", label: "Catálogo" },
  { id: "services", label: "Formulários" },
  { id: "details", label: "Detalhes" },
] as const;

type WizardPhase = (typeof WIZARD_STEPS)[number]["id"];

const DEFAULT_URGENCY_OPTIONS = [
  { value: "1", label: "Muito baixa" },
  { value: "2", label: "Baixa" },
  { value: "3", label: "Média" },
  { value: "4", label: "Alta" },
  { value: "5", label: "Muito alta" },
];

type Props = {
  open: boolean;
  pending: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateHelpDeskTicketRequestDto) => void;
};

function initialAnswersFromSchema(
  questions: HelpDeskFormQuestionDto[],
): Record<number, string> {
  const next: Record<number, string> = {};
  for (const question of questions) {
    if (question.fieldKind === "file") continue;
    if (question.defaultValue?.trim()) {
      next[question.id] = question.defaultValue.trim();
    }
  }
  return next;
}

function questionOptions(question: HelpDeskFormQuestionDto) {
  if (question.options.length > 0) return question.options;
  if (question.fieldKind === "urgency") return DEFAULT_URGENCY_OPTIONS;
  return [];
}

export function HelpDeskOpenTicketModal({ open, pending, errorMessage, onClose, onSubmit }: Props) {
  const [phase, setPhase] = useState<WizardPhase>("area");
  const [areaId, setAreaId] = useState<string | null>(null);
  const [entityId, setEntityId] = useState<number | null>(null);
  const [currentParentId, setCurrentParentId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [formId, setFormId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [localError, setLocalError] = useState<string | null>(null);

  const areasQuery = useHelpDeskAreas(open);
  const areas = areasQuery.data ?? [];

  const formCategoriesQuery = useHelpDeskFormCategories(open && phase !== "area");
  const formCategories = formCategoriesQuery.data ?? [];

  const formsQuery = useHelpDeskForms(
    categoryId,
    open && categoryId != null && (phase === "services" || phase === "details"),
  );
  const forms = formsQuery.data ?? [];

  const schemaQuery = useHelpDeskFormSchema(formId, open && phase === "details" && formId != null);
  const schema = schemaQuery.data ?? null;

  const catalogItems = useMemo(() => getRootFormCategories(formCategories), [formCategories]);

  const servicesBreadcrumb = useMemo(() => {
    if (currentParentId === null) return [] as HelpDeskFormCategoryDto[];
    return buildFormCategoryPath(formCategories, currentParentId);
  }, [formCategories, currentParentId]);

  const childCategories = useMemo(() => {
    if (currentParentId === null) return [] as HelpDeskFormCategoryDto[];
    return getChildFormCategories(formCategories, currentParentId);
  }, [formCategories, currentParentId]);

  const serviceForms = useMemo(() => {
    if (categoryId === null) return [] as HelpDeskFormSummaryDto[];
    return formsInCategory(forms, categoryId);
  }, [forms, categoryId]);

  const selectedArea = areaId !== null ? findAreaById(areas, areaId) : null;
  const selectedCatalogBranch =
    currentParentId !== null ? findFormCategoryById(formCategories, currentParentId) : null;
  const selectedForm = formId !== null ? forms.find((item) => item.id === formId) : null;

  const flatQuestions = useMemo(
    () => schema?.sections.flatMap((section) => section.questions) ?? [],
    [schema],
  );

  useEffect(() => {
    if (!open) return;
    setPhase("area");
    setAreaId(null);
    setEntityId(null);
    setCurrentParentId(null);
    setCategoryId(null);
    setFormId(null);
    setAnswers({});
    setLocalError(null);
  }, [open]);

  useEffect(() => {
    if (!schema) return;
    setAnswers(initialAnswersFromSchema(flatQuestions));
    setLocalError(null);
  }, [schema, flatQuestions]);

  const resetToArea = () => {
    setPhase("area");
    setAreaId(null);
    setEntityId(null);
    setCurrentParentId(null);
    setCategoryId(null);
    setFormId(null);
    setAnswers({});
    setLocalError(null);
  };

  const resetToCatalog = () => {
    setPhase("catalog");
    setCurrentParentId(null);
    setCategoryId(null);
    setFormId(null);
    setAnswers({});
    setLocalError(null);
  };

  const openCategoryFolder = (item: HelpDeskFormCategoryDto) => {
    setCurrentParentId(item.id);
    setCategoryId(item.id);
    setFormId(null);
    setAnswers({});
    setPhase("services");
  };

  const handleAreaSelect = (item: HelpDeskAreaDto) => {
    setAreaId(item.id);
    setEntityId(item.entityId);
    setCurrentParentId(null);
    setCategoryId(null);
    setFormId(null);
    setAnswers({});
    setPhase("catalog");
  };

  const handleCatalogSelect = (item: HelpDeskFormCategoryDto) => {
    if (hasChildFormCategories(formCategories, item.id)) {
      openCategoryFolder(item);
      return;
    }

    setCurrentParentId(item.id);
    setCategoryId(item.id);
    setFormId(null);
    setPhase("services");
  };

  const handleChildCategorySelect = (item: HelpDeskFormCategoryDto) => {
    if (hasChildFormCategories(formCategories, item.id)) {
      openCategoryFolder(item);
      return;
    }

    setCurrentParentId(item.id);
    setCategoryId(item.id);
    setFormId(null);
  };

  const handleFormSelect = (item: HelpDeskFormSummaryDto) => {
    setFormId(item.id);
    setPhase("details");
  };

  const handleBack = () => {
    if (phase === "details") {
      setFormId(null);
      setAnswers({});
      setLocalError(null);
      setPhase("services");
      return;
    }

    if (phase === "services") {
      const path =
        currentParentId !== null ? buildFormCategoryPath(formCategories, currentParentId) : [];
      if (path.length <= 1) {
        resetToCatalog();
        return;
      }

      const parent = path[path.length - 2];
      setCurrentParentId(parent.id);
      setCategoryId(parent.id);
      setFormId(null);
      return;
    }

    if (phase === "catalog") {
      resetToArea();
    }
  };

  const setAnswer = (questionId: number, value: string) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

  const validateAnswers = (): string | null => {
    for (const question of flatQuestions) {
      if (!question.isMandatory || question.fieldKind === "file") continue;
      const value = answers[question.id]?.trim() ?? "";
      if (!value) {
        return `Preencha o campo obrigatório: ${question.name}`;
      }
    }
    return null;
  };

  const canSubmit =
    entityId != null &&
    formId != null &&
    schema != null &&
    !schemaQuery.isLoading &&
    !pending;

  const handleSubmit = () => {
    if (!canSubmit || entityId === null || formId === null) return;
    const validationError = validateAnswers();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError(null);
    onSubmit({
      entityId,
      formId,
      categoryId: 0,
      subject: schema?.name ?? "",
      priority: "media",
      description: "",
      answers: flatQuestions
        .filter((question) => question.fieldKind !== "file")
        .map((question) => ({
          questionId: question.id,
          value: answers[question.id]?.trim() ?? "",
        }))
        .filter((item) => item.value.length > 0),
    });
  };

  const stepState = (target: WizardPhase) => {
    const order = WIZARD_STEPS.map((step) => step.id);
    const currentIndex = order.indexOf(phase);
    const targetIndex = order.indexOf(target);
    if (targetIndex < currentIndex) return "is-done";
    if (targetIndex === currentIndex) return "is-active";
    return "";
  };

  const renderCategoryGrid = (
    items: HelpDeskFormCategoryDto[],
    onSelect: (item: HelpDeskFormCategoryDto) => void,
  ) => (
    <div className="hd-wizard__grid" role="list">
      {items.map((item) => {
        const hasChildren = hasChildFormCategories(formCategories, item.id);
        return (
          <button
            key={item.id}
            type="button"
            className="hd-wizard__card"
            role="listitem"
            onClick={() => onSelect(item)}
          >
            <span className="hd-wizard__card-icon" aria-hidden="true">
              <i className={hasChildren ? "fa-solid fa-folder" : "fa-solid fa-clipboard-list"} />
            </span>
            <span className="hd-wizard__card-body">
              <span className="hd-wizard__card-title">{item.name}</span>
              <span className="hd-wizard__card-meta">
                {item.formCount > 0
                  ? `${item.formCount} formulário${item.formCount === 1 ? "" : "s"}`
                  : item.completeName && item.completeName !== item.name
                    ? item.completeName
                    : "Abrir"}
              </span>
            </span>
            {hasChildren ? (
              <i className="fa-solid fa-chevron-right hd-wizard__card-chevron" aria-hidden="true" />
            ) : null}
          </button>
        );
      })}
    </div>
  );

  const renderFormGrid = (items: HelpDeskFormSummaryDto[]) => (
    <div className="hd-wizard__grid" role="list">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="hd-wizard__card"
          role="listitem"
          onClick={() => handleFormSelect(item)}
        >
          <span className="hd-wizard__card-icon" aria-hidden="true">
            <i className="fa-solid fa-file-lines" />
          </span>
          <span className="hd-wizard__card-body">
            <span className="hd-wizard__card-title">{item.name}</span>
            {item.description ? <span className="hd-wizard__card-meta">{item.description}</span> : null}
          </span>
          <i className="fa-solid fa-chevron-right hd-wizard__card-chevron" aria-hidden="true" />
        </button>
      ))}
    </div>
  );

  const renderQuestionField = (question: HelpDeskFormQuestionDto) => {
    const options = questionOptions(question);
    const value = answers[question.id] ?? "";
    const label = (
      <span className="hd-modal-form__label">
        {question.name}
        {question.isMandatory ? <span className="hd-modal-form__required"> *</span> : null}
      </span>
    );
    const hint = question.description ? (
      <span className="hd-modal-form__hint">{question.description}</span>
    ) : null;

    if (question.fieldKind === "file") {
      return (
        <div key={question.id} className="hd-modal-form__field hd-modal-form__field--full">
          {label}
          <p className="hd-modal-form__hint">
            Anexe arquivos depois de abrir o chamado, na tela de detalhes do ticket.
          </p>
        </div>
      );
    }

    if (question.fieldKind === "longtext") {
      return (
        <label key={question.id} className="hd-modal-form__field hd-modal-form__field--full">
          {label}
          {hint}
          <textarea
            value={value}
            onChange={(e) => setAnswer(question.id, e.target.value)}
            rows={4}
            required={question.isMandatory}
          />
        </label>
      );
    }

    if (question.fieldKind === "radio" || question.fieldKind === "urgency") {
      return (
        <fieldset key={question.id} className="hd-modal-form__field hd-modal-form__field--full">
          <legend className="hd-modal-form__label">
            {question.name}
            {question.isMandatory ? <span className="hd-modal-form__required"> *</span> : null}
          </legend>
          {hint}
          <div className="hd-modal-form__options">
            {options.map((option) => (
              <label key={option.value} className="hd-modal-form__option">
                <input
                  type="radio"
                  name={`hd-q-${question.id}`}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => setAnswer(question.id, option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      );
    }

    if (question.fieldKind === "checkbox") {
      const selected = new Set(
        value
          .split("|")
          .map((item) => item.trim())
          .filter(Boolean),
      );
      return (
        <fieldset key={question.id} className="hd-modal-form__field hd-modal-form__field--full">
          <legend className="hd-modal-form__label">
            {question.name}
            {question.isMandatory ? <span className="hd-modal-form__required"> *</span> : null}
          </legend>
          {hint}
          <div className="hd-modal-form__options">
            {options.map((option) => (
              <label key={option.value} className="hd-modal-form__option">
                <input
                  type="checkbox"
                  checked={selected.has(option.value)}
                  onChange={(e) => {
                    if (e.target.checked) selected.add(option.value);
                    else selected.delete(option.value);
                    setAnswer(question.id, Array.from(selected).join("|"));
                  }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      );
    }

    if (question.fieldKind === "dropdown" && options.length > 0) {
      return (
        <label key={question.id} className="hd-modal-form__field hd-modal-form__field--full">
          {label}
          {hint}
          <select
            value={value}
            onChange={(e) => setAnswer(question.id, e.target.value)}
            required={question.isMandatory}
          >
            <option value="">Selecione…</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      );
    }

    const inputType =
      question.fieldKind === "email"
        ? "email"
        : question.fieldKind === "number"
          ? "number"
          : question.fieldKind === "date"
            ? "date"
            : "text";

    return (
      <label key={question.id} className="hd-modal-form__field hd-modal-form__field--full">
        {label}
        {hint}
        <input
          type={inputType}
          value={value}
          onChange={(e) => setAnswer(question.id, e.target.value)}
          required={question.isMandatory}
        />
      </label>
    );
  };

  const alertMessage = localError ?? errorMessage;

  return (
    <ContrachequeModal
      open={open}
      wide
      title="Abrir chamado"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          {phase !== "area" ? (
            <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={handleBack}>
              Voltar
            </button>
          ) : null}
          {phase === "details" ? (
            <button
              type="button"
              className="pay-modal__btn"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {pending ? "Enviando…" : "Enviar chamado"}
            </button>
          ) : null}
        </>
      }
    >
      <div className="hd-wizard">
        <div className="hd-wizard__steps" aria-label="Progresso">
          {WIZARD_STEPS.map((step, index) => (
            <div key={step.id} className={`hd-wizard__step ${stepState(step.id)}`}>
              <span className="hd-wizard__step-index">{index + 1}</span>
              <span className="hd-wizard__step-label">{step.label}</span>
            </div>
          ))}
        </div>

        <div className="hd-wizard__panel">
          {alertMessage ? (
            <p className="hd-modal__error" role="alert">
              <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {alertMessage}
            </p>
          ) : null}

          {phase === "area" ? (
            <>
              <p className="hd-modal__intro">
                <i className="fa-solid fa-table-cells" aria-hidden="true" />
                Escolha a entidade GLPI para abrir o chamado.
              </p>

              {areasQuery.isLoading ? (
                <p className="hd-modal__empty">Carregando áreas…</p>
              ) : areasQuery.isError ? (
                <p className="hd-modal__error" role="alert">
                  {helpDeskQueryErrorMessage(
                    areasQuery.error,
                    "Não foi possível carregar as áreas do catálogo GLPI.",
                  )}
                </p>
              ) : areas.length === 0 ? (
                <p className="hd-modal__empty">Nenhuma entidade encontrada no GLPI.</p>
              ) : (
                <div className="hd-wizard__area-grid" role="list">
                  {areas.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="hd-wizard__area-card"
                      role="listitem"
                      onClick={() => handleAreaSelect(item)}
                    >
                      <span className="hd-wizard__area-icon" aria-hidden="true">
                        <i className={getAreaIconClass(item.icon)} />
                      </span>
                      <span className="hd-wizard__area-title">{item.name}</span>
                      <span className="hd-wizard__area-meta">{formatAreaServiceCount(item.serviceCount)}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : null}

          {phase === "catalog" ? (
            <>
              {selectedArea ? (
                <div className="hd-wizard__summary">
                  <span className="hd-wizard__summary-label">Área selecionada</span>
                  <strong>{selectedArea.name}</strong>
                </div>
              ) : null}

              <nav className="hd-wizard__breadcrumb" aria-label="Navegação do catálogo">
                <button type="button" className="hd-wizard__crumb is-current" onClick={resetToArea}>
                  Início
                </button>
              </nav>

              <p className="hd-modal__intro">
                <i className="fa-solid fa-list-check" aria-hidden="true" />
                Escolha a categoria do formulário no Service Desk.
              </p>

              {formCategoriesQuery.isLoading ? (
                <p className="hd-modal__empty">Carregando formulários…</p>
              ) : formCategoriesQuery.isError ? (
                <p className="hd-modal__error" role="alert">
                  Não foi possível carregar as categorias de formulário do GLPI.
                </p>
              ) : catalogItems.length === 0 ? (
                <p className="hd-modal__empty">
                  Nenhum formulário ativo encontrado no GLPI. Verifique Forms nativos no Service Desk.
                </p>
              ) : (
                renderCategoryGrid(catalogItems, handleCatalogSelect)
              )}
            </>
          ) : null}

          {phase === "services" ? (
            <>
              {selectedArea ? (
                <div className="hd-wizard__summary">
                  <span className="hd-wizard__summary-label">Área</span>
                  <strong>{selectedArea.name}</strong>
                </div>
              ) : null}

              {selectedCatalogBranch ? (
                <div className="hd-wizard__summary">
                  <span className="hd-wizard__summary-label">Catálogo</span>
                  <strong>{selectedCatalogBranch.completeName ?? selectedCatalogBranch.name}</strong>
                </div>
              ) : null}

              <nav className="hd-wizard__breadcrumb" aria-label="Navegação dos formulários">
                <button type="button" className="hd-wizard__crumb" onClick={resetToArea}>
                  Início
                </button>
                <button type="button" className="hd-wizard__crumb" onClick={resetToCatalog}>
                  Catálogo
                </button>
                {servicesBreadcrumb.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`hd-wizard__crumb${item.id === currentParentId ? " is-current" : ""}`}
                    onClick={() => {
                      setCurrentParentId(item.id);
                      setCategoryId(item.id);
                      setFormId(null);
                    }}
                  >
                    {item.name}
                  </button>
                ))}
              </nav>

              {childCategories.length > 0 ? (
                <>
                  <p className="hd-modal__intro">
                    <i className="fa-solid fa-folder-open" aria-hidden="true" />
                    Subcategorias
                  </p>
                  {renderCategoryGrid(childCategories, handleChildCategorySelect)}
                </>
              ) : null}

              {formsQuery.isLoading ? (
                <p className="hd-modal__empty">Carregando formulários…</p>
              ) : serviceForms.length === 0 && childCategories.length === 0 ? (
                <p className="hd-modal__empty">Nenhum formulário disponível nesta categoria.</p>
              ) : serviceForms.length > 0 ? (
                <>
                  <p className="hd-modal__intro">
                    <i className="fa-solid fa-file-lines" aria-hidden="true" />
                    Selecione o formulário de atendimento
                  </p>
                  {renderFormGrid(serviceForms)}
                </>
              ) : null}
            </>
          ) : null}

          {phase === "details" ? (
            <>
              <p className="hd-modal__intro">
                <i className="fa-solid fa-ticket" aria-hidden="true" />
                Preencha o formulário do Service Desk. O protocolo será criado automaticamente no GLPI.
              </p>

              {selectedArea ? (
                <div className="hd-wizard__summary hd-wizard__summary--compact">
                  <span className="hd-wizard__summary-label">Área</span>
                  <strong>{selectedArea.name}</strong>
                </div>
              ) : null}

              {categoryId !== null ? (
                <div className="hd-wizard__summary hd-wizard__summary--compact">
                  <span className="hd-wizard__summary-label">Categoria</span>
                  <strong>{formatFormCategoryPath(formCategories, categoryId)}</strong>
                </div>
              ) : null}

              {(selectedForm || schema) ? (
                <div className="hd-wizard__summary hd-wizard__summary--compact">
                  <span className="hd-wizard__summary-label">Formulário</span>
                  <strong>{schema?.name ?? selectedForm?.name}</strong>
                </div>
              ) : null}

              {schemaQuery.isLoading ? (
                <p className="hd-modal__empty">Carregando perguntas do formulário…</p>
              ) : schemaQuery.isError ? (
                <p className="hd-modal__error" role="alert">
                  Não foi possível carregar o formulário no GLPI.
                </p>
              ) : schema == null ? (
                <p className="hd-modal__empty">Formulário não encontrado.</p>
              ) : (
                <div className="hd-modal-form hd-modal-form--details">
                  {schema.sections.map((section) => (
                    <div key={section.id} className="hd-form-section">
                      {section.name.trim() ? (
                        <h3 className="hd-form-section__title">{section.name}</h3>
                      ) : null}
                      {section.questions.map((question) => renderQuestionField(question))}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </ContrachequeModal>
  );
}
