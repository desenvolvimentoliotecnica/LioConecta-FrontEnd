import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  useHelpDeskAreas,
  useHelpDeskFormCategories,
  useHelpDeskFormSchema,
  useHelpDeskForms,
} from "../../api/hooks/useHelpDesk";
import { usePeopleSearch } from "../../api/hooks/usePhoneExtensions";
import type {
  CreateHelpDeskTicketRequestDto,
  HelpDeskAreaDto,
  HelpDeskFormCategoryDto,
  HelpDeskFormQuestionDto,
  HelpDeskFormSummaryDto,
  PersonSummaryDto,
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
  onSubmit: (payload: CreateHelpDeskTicketRequestDto, files: File[]) => void;
};

function sanitizeDefaultValue(
  raw: string | null | undefined,
  fieldKind?: string,
): string | null {
  if (!raw?.trim()) return null;
  const value = raw.trim();
  const kind = (fieldKind || "").toLowerCase();
  if (value === "0" || value === "-1" || value.includes("items_id")) return null;
  if (value.startsWith("{")) {
    try {
      const parsed = JSON.parse(value) as { items_id?: number | string };
      const id =
        typeof parsed.items_id === "number"
          ? parsed.items_id
          : Number.parseInt(String(parsed.items_id ?? "0"), 10);
      if (!(id > 0)) return null;
      // IDs GLPI de usuário não devem virar chip de colaborador.
      if (kind === "user" || kind === "users") return null;
      return String(id);
    } catch {
      return null;
    }
  }
  if ((kind === "user" || kind === "users") && /^\d+$/.test(value)) {
    return null;
  }
  return value;
}

/** Prefer API fieldKind; fallback by GLPI type / rótulo quando o kind vier genérico. */
function resolveUiFieldKind(question: HelpDeskFormQuestionDto): string {
  const kind = (question.fieldKind || "").trim().toLowerCase();
  if (kind === "user" || kind === "users" || kind === "file" || kind === "itilcategory") {
    return kind;
  }

  const type = (question.type || "").toLowerCase();
  const name = (question.name || "").toLowerCase();
  const itemType = (question.itemType || "").toLowerCase();

  if (type.includes("questiontypefile") || name.includes("anex") || name.includes("evidên") || name.includes("evidenc")) {
    return "file";
  }
  if (
    type.includes("questiontypeobserver") ||
    type.includes("questiontyperequester") ||
    name.includes("cópia") ||
    name.includes("copia") ||
    name.includes("em copia") ||
    name.includes("em cópia")
  ) {
    return "users";
  }
  if (
    itemType === "user" ||
    type.includes("questiontypeitem") ||
    name.includes("colaborador") ||
    name.includes("usuário") ||
    name.includes("usuario")
  ) {
    if (itemType === "itilcategory") return "itilcategory";
    if (
      itemType === "user" ||
      name.includes("colaborador") ||
      name.includes("usuário") ||
      name.includes("usuario")
    ) {
      return "user";
    }
  }

  return kind || "text";
}

function initialAnswersFromSchema(
  questions: HelpDeskFormQuestionDto[],
): Record<number, string> {
  const next: Record<number, string> = {};
  for (const question of questions) {
    const kind = resolveUiFieldKind(question);
    if (kind === "file") continue;
    const sanitized = sanitizeDefaultValue(question.defaultValue, kind);
    if (sanitized) {
      next[question.id] = sanitized;
    }
  }
  return next;
}

function questionOptions(question: HelpDeskFormQuestionDto) {
  if (question.options.length > 0) return question.options;
  if (resolveUiFieldKind(question) === "urgency" || question.fieldKind === "urgency") {
    return DEFAULT_URGENCY_OPTIONS;
  }
  return [];
}

function formatPersonAnswer(person: PersonSummaryDto): string {
  const meta = [person.title, person.departmentName].filter(Boolean).join(" · ");
  return meta ? `${person.name} (${meta})` : person.name;
}

function HelpDeskPersonPicker({
  value,
  onChange,
  required,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const inputId = useId();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const search = usePeopleSearch(query, open);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const results = search.data ?? [];

  return (
    <div className="hd-person-picker" ref={rootRef}>
      {value.trim() ? (
        <div className="hd-person-picker__selected">
          <span className="hd-person-picker__chip">
            <i className="fa-solid fa-user" aria-hidden="true" />
            {value}
            <button
              type="button"
              aria-label="Limpar colaborador"
              onClick={() => {
                onChange("");
                setQuery("");
                setOpen(true);
              }}
            >
              ×
            </button>
          </span>
        </div>
      ) : null}
      <div className="hd-person-picker__control">
        <i className="fa-solid fa-magnifying-glass hd-person-picker__icon" aria-hidden="true" />
        <input
          id={inputId}
          type="text"
          value={query}
          required={required && !value.trim()}
          placeholder={placeholder ?? "Digite o nome para buscar no diretório…"}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>
      <span className="hd-modal-form__hint">Busque no diretório de pessoas (mín. 2 letras).</span>
      {open && query.trim().length >= 2 ? (
        <ul id={listId} className="hd-person-picker__list" role="listbox">
          {search.isFetching ? (
            <li className="hd-person-picker__empty">Buscando…</li>
          ) : results.length === 0 ? (
            <li className="hd-person-picker__empty">Nenhuma pessoa encontrada.</li>
          ) : (
            results.map((person) => (
              <li key={person.id}>
                <button
                  type="button"
                  role="option"
                  className="hd-person-picker__option"
                  onClick={() => {
                    onChange(formatPersonAnswer(person));
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  <strong>{person.name}</strong>
                  <span>
                    {[person.title, person.departmentName].filter(Boolean).join(" · ") || person.slug}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

function HelpDeskPeopleMultiPicker({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const search = usePeopleSearch(query, open);

  const selected = useMemo(
    () =>
      value
        .split("|")
        .map((item) => item.trim())
        .filter(Boolean),
    [value],
  );

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const addPerson = (person: PersonSummaryDto) => {
    const label = formatPersonAnswer(person);
    if (selected.includes(label)) return;
    onChange([...selected, label].join("|"));
    setQuery("");
    setOpen(false);
  };

  const removePerson = (label: string) => {
    onChange(selected.filter((item) => item !== label).join("|"));
  };

  return (
    <div className="hd-person-picker hd-person-picker--multi" ref={rootRef}>
      {selected.length > 0 ? (
        <div className="hd-person-picker__chips">
          {selected.map((label) => (
            <span key={label} className="hd-person-picker__chip">
              <i className="fa-solid fa-user" aria-hidden="true" />
              {label}
              <button type="button" aria-label={`Remover ${label}`} onClick={() => removePerson(label)}>
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <div className="hd-person-picker__control">
        <i className="fa-solid fa-magnifying-glass hd-person-picker__icon" aria-hidden="true" />
        <input
          id={inputId}
          type="text"
          value={query}
          placeholder={placeholder ?? "Digite o nome para adicionar em cópia…"}
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>
      <span className="hd-modal-form__hint">Busque no diretório de pessoas (mín. 2 letras).</span>
      {open && query.trim().length >= 2 ? (
        <ul className="hd-person-picker__list" role="listbox">
          {search.isFetching ? (
            <li className="hd-person-picker__empty">Buscando…</li>
          ) : (search.data ?? []).length === 0 ? (
            <li className="hd-person-picker__empty">Nenhuma pessoa encontrada.</li>
          ) : (
            (search.data ?? []).map((person) => (
              <li key={person.id}>
                <button type="button" className="hd-person-picker__option" onClick={() => addPerson(person)}>
                  <strong>{person.name}</strong>
                  <span>
                    {[person.title, person.departmentName].filter(Boolean).join(" · ") || person.slug}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

export function HelpDeskOpenTicketModal({ open, pending, errorMessage, onClose, onSubmit }: Props) {
  const [phase, setPhase] = useState<WizardPhase>("area");
  const [areaId, setAreaId] = useState<string | null>(null);
  const [entityId, setEntityId] = useState<number | null>(null);
  const [currentParentId, setCurrentParentId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [formId, setFormId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [filesByQuestion, setFilesByQuestion] = useState<Record<number, File[]>>({});
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
    setFilesByQuestion({});
    setLocalError(null);
  }, [open]);

  useEffect(() => {
    if (!schema) return;
    setAnswers(initialAnswersFromSchema(flatQuestions));
    setFilesByQuestion({});
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
    setFilesByQuestion({});
    setLocalError(null);
  };

  const resetToCatalog = () => {
    setPhase("catalog");
    setCurrentParentId(null);
    setCategoryId(null);
    setFormId(null);
    setAnswers({});
    setFilesByQuestion({});
    setLocalError(null);
  };

  const openCategoryFolder = (item: HelpDeskFormCategoryDto) => {
    setCurrentParentId(item.id);
    setCategoryId(item.id);
    setFormId(null);
    setAnswers({});
    setFilesByQuestion({});
    setPhase("services");
  };

  const handleAreaSelect = (item: HelpDeskAreaDto) => {
    setAreaId(item.id);
    setEntityId(item.entityId);
    setCurrentParentId(null);
    setCategoryId(null);
    setFormId(null);
    setAnswers({});
    setFilesByQuestion({});
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
      setFilesByQuestion({});
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

  const setQuestionFiles = (questionId: number, files: FileList | null) => {
    setFilesByQuestion((current) => ({
      ...current,
      [questionId]: files ? Array.from(files) : [],
    }));
  };

  const collectedFiles = useMemo(
    () => Object.values(filesByQuestion).flat(),
    [filesByQuestion],
  );

  const validateAnswers = (): string | null => {
    for (const question of flatQuestions) {
      if (!question.isMandatory) continue;
      const kind = resolveUiFieldKind(question);
      if (kind === "file") {
        const files = filesByQuestion[question.id] ?? [];
        if (files.length === 0) {
          return `Anexe ao menos um arquivo em: ${question.name}`;
        }
        continue;
      }
      const value = answers[question.id]?.trim() ?? "";
      if (!value || value.includes("items_id")) {
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
    onSubmit(
      {
        entityId,
        formId,
        categoryId: 0,
        subject: schema?.name ?? "",
        priority: "media",
        description: "",
        answers: flatQuestions
          .filter((question) => resolveUiFieldKind(question) !== "file")
          .map((question) => ({
            questionId: question.id,
            value: answers[question.id]?.trim() ?? "",
          }))
          .filter((item) => item.value.length > 0 && !item.value.includes("items_id")),
      },
      collectedFiles,
    );
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
    const kind = resolveUiFieldKind(question);
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

    if (kind === "file") {
      const files = filesByQuestion[question.id] ?? [];
      return (
        <div key={question.id} className="hd-modal-form__field hd-modal-form__field--full">
          {label}
          {hint}
          <label className="hd-modal-form__file-drop">
            <i className="fa-solid fa-paperclip" aria-hidden="true" />
            <span>Escolher arquivos…</span>
            <input
              type="file"
              multiple
              onChange={(event) => setQuestionFiles(question.id, event.target.files)}
              required={question.isMandatory && files.length === 0}
            />
          </label>
          {files.length > 0 ? (
            <ul className="hd-modal-form__file-list">
              {files.map((file) => (
                <li key={`${file.name}-${file.size}-${file.lastModified}`}>{file.name}</li>
              ))}
            </ul>
          ) : (
            <span className="hd-modal-form__hint">
              Os arquivos serão anexados ao chamado logo após a abertura.
            </span>
          )}
        </div>
      );
    }

    if (kind === "user") {
      return (
        <div key={question.id} className="hd-modal-form__field hd-modal-form__field--full">
          {label}
          {hint}
          <HelpDeskPersonPicker
            value={value}
            onChange={(next) => setAnswer(question.id, next)}
            required={question.isMandatory}
            placeholder="Digite o nome do colaborador…"
          />
        </div>
      );
    }

    if (kind === "users") {
      return (
        <div key={question.id} className="hd-modal-form__field hd-modal-form__field--full">
          {label}
          {hint}
          <HelpDeskPeopleMultiPicker
            value={value}
            onChange={(next) => setAnswer(question.id, next)}
            placeholder="Digite o nome para adicionar em cópia…"
          />
        </div>
      );
    }

    if (kind === "itilcategory" || (kind === "glpiitem" && options.length > 0)) {
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

    if (kind === "longtext") {
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

    if (kind === "radio" || kind === "urgency") {
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

    if (kind === "checkbox") {
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

    if (kind === "dropdown" && options.length > 0) {
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
      kind === "email"
        ? "email"
        : kind === "number"
          ? "number"
          : kind === "date"
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
              <nav className="hd-wizard__path" aria-label="Seleção atual">
                {selectedArea ? <span className="hd-wizard__path-item">{selectedArea.name}</span> : null}
                {categoryId !== null ? (
                  <>
                    <i className="fa-solid fa-chevron-right hd-wizard__path-sep" aria-hidden="true" />
                    <span className="hd-wizard__path-item">
                      {formatFormCategoryPath(formCategories, categoryId)}
                    </span>
                  </>
                ) : null}
                {(selectedForm || schema) ? (
                  <>
                    <i className="fa-solid fa-chevron-right hd-wizard__path-sep" aria-hidden="true" />
                    <span className="hd-wizard__path-item is-current">
                      {schema?.name ?? selectedForm?.name}
                    </span>
                  </>
                ) : null}
              </nav>

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
