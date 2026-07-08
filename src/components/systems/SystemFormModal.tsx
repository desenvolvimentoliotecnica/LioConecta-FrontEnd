import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import type { PortalSystemDto, UpsertPortalSystemRequest } from "../../api/types";
import { resolveBackendAssetUrl } from "../../api/assetUrl";
import { SystemIconPickerModal } from "./SystemIconPickerModal";

export type SystemFormState = {
  name: string;
  slug: string;
  description: string;
  category: string;
  destinationType: "External" | "Internal";
  urlDev: string;
  urlHml: string;
  urlPrd: string;
  iconKind: "FontAwesome" | "Upload";
  iconFaClass: string;
  iconAssetUrl: string;
  isActive: boolean;
  accessNotes: string;
};

export const SYSTEM_CATEGORY_OPTIONS = [
  "ERP",
  "RH",
  "Logistica",
  "Financeiro",
  "Comercial",
  "Interno",
] as const;

const WIZARD_STEPS = [
  { id: "identity", label: "Identidade" },
  { id: "access", label: "Acesso" },
  { id: "publish", label: "Publicação" },
] as const;

type WizardStepId = (typeof WIZARD_STEPS)[number]["id"];

export function emptySystemForm(): SystemFormState {
  return {
    name: "",
    slug: "",
    description: "",
    category: "ERP",
    destinationType: "External",
    urlDev: "",
    urlHml: "",
    urlPrd: "",
    iconKind: "FontAwesome",
    iconFaClass: "fa-table-cells",
    iconAssetUrl: "",
    isActive: true,
    accessNotes: "",
  };
}

export function formFromDto(dto: PortalSystemDto): SystemFormState {
  return {
    name: dto.name,
    slug: dto.slug,
    description: dto.description ?? "",
    category: dto.category,
    destinationType: dto.destinationType === "Internal" ? "Internal" : "External",
    urlDev: dto.urlDev ?? "",
    urlHml: dto.urlHml ?? "",
    urlPrd: dto.urlPrd ?? "",
    iconKind: dto.iconKind === "Upload" ? "Upload" : "FontAwesome",
    iconFaClass: dto.iconFaClass ?? "fa-table-cells",
    iconAssetUrl: dto.iconAssetUrl ?? "",
    isActive: dto.isActive,
    accessNotes: dto.accessNotes ?? "",
  };
}

export function formToRequest(
  form: SystemFormState,
  hasPendingUpload: boolean,
  existingSortOrder?: number,
): UpsertPortalSystemRequest {
  const isUpload = form.iconKind === "Upload" && (hasPendingUpload || Boolean(form.iconAssetUrl.trim()));

  return {
    name: form.name.trim(),
    slug: form.slug.trim(),
    description: form.description.trim() || null,
    category: form.category.trim(),
    destinationType: form.destinationType,
    urlDev: form.urlDev.trim() || null,
    urlHml: form.urlHml.trim() || null,
    urlPrd: form.urlPrd.trim() || null,
    iconKind: isUpload ? "Upload" : "FontAwesome",
    iconFaClass: isUpload ? null : form.iconFaClass.trim() || null,
    iconAssetUrl: isUpload ? form.iconAssetUrl.trim() || null : null,
    ...(existingSortOrder !== undefined ? { sortOrder: existingSortOrder } : {}),
    isActive: form.isActive,
    accessNotes: form.accessNotes.trim() || null,
  };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Props = {
  open: boolean;
  title: string;
  initial: SystemFormState;
  saving: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (form: SystemFormState, pendingIconFile: File | null) => Promise<void> | void;
};

export function SystemFormModal({ open, title, initial, saving, error, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<SystemFormState>(initial);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [pendingIconFile, setPendingIconFile] = useState<File | null>(null);
  const [pendingIconPreviewUrl, setPendingIconPreviewUrl] = useState<string | null>(null);
  const wasOpenRef = useRef(false);

  const currentStep = WIZARD_STEPS[stepIndex];
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1;

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }

    if (!wasOpenRef.current) {
      if (pendingIconPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(pendingIconPreviewUrl);
      }
      setForm(initial);
      setStepIndex(0);
      setStepError(null);
      setSlugTouched(false);
      setPendingIconFile(null);
      setPendingIconPreviewUrl(null);
      setIconPickerOpen(false);
    }

    wasOpenRef.current = true;
  }, [open, initial]);

  useEffect(() => {
    return () => {
      if (pendingIconPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(pendingIconPreviewUrl);
      }
    };
  }, [pendingIconPreviewUrl]);

  if (!open) return null;

  const clearPendingIcon = () => {
    if (pendingIconPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(pendingIconPreviewUrl);
    }
    setPendingIconFile(null);
    setPendingIconPreviewUrl(null);
  };

  const iconPreviewUrl =
    pendingIconPreviewUrl ??
    (form.iconKind === "Upload" && form.iconAssetUrl
      ? resolveBackendAssetUrl(form.iconAssetUrl)
      : "");

  const validateStep = (stepId: WizardStepId) => {
    if (stepId === "identity") {
      if (!form.name.trim()) return "Informe o nome do sistema.";
      if (!form.slug.trim()) return "Informe o slug do sistema.";
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
        return "Use apenas letras minúsculas, números e hífens no slug.";
      }
    }

    if (stepId === "access" && form.destinationType === "Internal") {
      const hasAnyUrl = [form.urlDev, form.urlHml, form.urlPrd].some((value) => value.trim());
      if (!hasAnyUrl) return "Informe ao menos uma rota interna (DEV, HML ou PRD).";
    }

    return null;
  };

  const goNext = () => {
    const message = validateStep(currentStep.id);
    if (message) {
      setStepError(message);
      return;
    }
    setStepError(null);
    setStepIndex((value) => Math.min(value + 1, WIZARD_STEPS.length - 1));
  };

  const validateAllSteps = () => {
    for (let index = 0; index < WIZARD_STEPS.length; index += 1) {
      const message = validateStep(WIZARD_STEPS[index].id);
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
    void onSubmit(form, pendingIconFile);
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

  const goBack = () => {
    setStepError(null);
    setStepIndex((value) => Math.max(value - 1, 0));
  };

  const stepState = (index: number) => {
    if (index < stepIndex) return "is-done";
    if (index === stepIndex) return "is-active";
    return "";
  };

  const updateName = (name: string) => {
    setForm((current) => ({
      ...current,
      name,
      slug: slugTouched ? current.slug : slugify(name),
    }));
  };

  return createPortal(
    <>
      <div className="systems-modal" role="presentation" onClick={onClose}>
        <div
          className="systems-modal__dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="system-form-title"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="systems-modal__header">
            <div className="systems-modal__heading">
              <h2 id="system-form-title">{title}</h2>
              <p className="systems-modal__subtitle">
                Etapa {stepIndex + 1} de {WIZARD_STEPS.length} · {currentStep.label}
              </p>
            </div>
            <button type="button" className="systems-modal__close" onClick={onClose} aria-label="Fechar">
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </header>

          <form
            className="systems-modal__form"
            onSubmit={(event) => event.preventDefault()}
            onKeyDown={handleFormKeyDown}
          >
            <div className="systems-modal__body">
              <div className="systems-wizard">
                <div className="systems-wizard__steps" aria-label="Progresso">
                  {WIZARD_STEPS.map((step, index) => (
                    <div key={step.id} className={`systems-wizard__step ${stepState(index)}`}>
                      <span className="systems-wizard__step-index">{index + 1}</span>
                      <span className="systems-wizard__step-label">{step.label}</span>
                    </div>
                  ))}
                </div>

                <div className="systems-wizard__panel">
                  {currentStep.id === "identity" ? (
                    <div className="systems-form">
                      <div className="systems-form__row">
                        <label>
                          <span>Nome *</span>
                          <input
                            value={form.name}
                            onChange={(event) => updateName(event.target.value)}
                            required
                            autoFocus
                          />
                        </label>

                        <label>
                          <span>Slug *</span>
                          <input
                            value={form.slug}
                            onChange={(event) => {
                              setSlugTouched(true);
                              setForm((current) => ({ ...current, slug: event.target.value }));
                            }}
                            required
                          />
                        </label>
                      </div>

                      <label>
                        <span>Descrição</span>
                        <textarea
                          rows={3}
                          value={form.description}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, description: event.target.value }))
                          }
                          placeholder="Resumo curto exibido no card do hub."
                        />
                      </label>
                    </div>
                  ) : null}

                  {currentStep.id === "access" ? (
                    <div className="systems-form">
                      <div className="systems-form__row">
                        <label>
                          <span>Categoria *</span>
                          <select
                            value={form.category}
                            onChange={(event) =>
                              setForm((current) => ({ ...current, category: event.target.value }))
                            }
                          >
                            {SYSTEM_CATEGORY_OPTIONS.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label>
                          <span>Tipo *</span>
                          <select
                            value={form.destinationType}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                destinationType: event.target.value as SystemFormState["destinationType"],
                              }))
                            }
                          >
                            <option value="External">Externo (URL)</option>
                            <option value="Internal">Interno (rota do portal)</option>
                          </select>
                        </label>
                      </div>

                      <p className="systems-form__hint">
                        {form.destinationType === "Internal"
                          ? "Informe a rota do portal para cada ambiente (ex.: /loop/projetos)."
                          : "Informe a URL completa para cada ambiente, quando disponível."}
                      </p>

                      <div className="systems-form__row systems-form__row--urls">
                        <label>
                          <span>URL DEV</span>
                          <input
                            value={form.urlDev}
                            onChange={(event) =>
                              setForm((current) => ({ ...current, urlDev: event.target.value }))
                            }
                            placeholder={
                              form.destinationType === "Internal" ? "/rota-dev" : "https://..."
                            }
                          />
                        </label>
                        <label>
                          <span>URL HML</span>
                          <input
                            value={form.urlHml}
                            onChange={(event) =>
                              setForm((current) => ({ ...current, urlHml: event.target.value }))
                            }
                            placeholder={
                              form.destinationType === "Internal" ? "/rota-hml" : "https://..."
                            }
                          />
                        </label>
                        <label>
                          <span>URL PRD</span>
                          <input
                            value={form.urlPrd}
                            onChange={(event) =>
                              setForm((current) => ({ ...current, urlPrd: event.target.value }))
                            }
                            placeholder={
                              form.destinationType === "Internal" ? "/rota-prd" : "https://..."
                            }
                          />
                        </label>
                      </div>
                    </div>
                  ) : null}

                  {currentStep.id === "publish" ? (
                    <div className="systems-form">
                      <div className="systems-form__icon-field">
                        <span>Ícone</span>
                        <div className="systems-form__icon-preview">
                          {form.iconKind === "Upload" && iconPreviewUrl ? (
                            <img src={iconPreviewUrl} alt="" />
                          ) : (
                            <i className={`fa-solid ${form.iconFaClass}`} aria-hidden="true" />
                          )}
                        </div>
                        <button type="button" className="btn btn--ghost" onClick={() => setIconPickerOpen(true)}>
                          Escolher ícone
                        </button>
                      </div>

                      <label>
                        <span>Observações de acesso</span>
                        <textarea
                          rows={3}
                          value={form.accessNotes}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, accessNotes: event.target.value }))
                          }
                          placeholder="VPN, perfil necessário, horário de manutenção..."
                        />
                      </label>

                      <label className="systems-form__toggle systems-form__toggle--end">
                        <input
                          type="checkbox"
                          checked={form.isActive}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, isActive: event.target.checked }))
                          }
                        />
                        <span className="systems-form__toggle-track" aria-hidden="true" />
                        <span>Ativo no hub</span>
                      </label>
                    </div>
                  ) : null}

                  {stepError ? <p className="systems-form__error">{stepError}</p> : null}
                  {error ? <p className="systems-form__error">{error}</p> : null}
                </div>
              </div>
            </div>

            <footer className="systems-modal__footer">
              <div className="systems-modal__footer-start">
                <button type="button" className="btn btn--ghost" onClick={onClose}>
                  Cancelar
                </button>
              </div>
              <div className="systems-modal__footer-end">
                {stepIndex > 0 ? (
                  <button type="button" className="btn btn--ghost" onClick={goBack}>
                    Voltar
                  </button>
                ) : null}
                {isLastStep ? (
                  <button type="button" className="btn btn--primary" disabled={saving} onClick={handleSave}>
                    {saving ? "Salvando..." : "Salvar"}
                  </button>
                ) : (
                  <button type="button" className="btn btn--primary" onClick={goNext}>
                    Próximo
                  </button>
                )}
              </div>
            </footer>
          </form>
        </div>
      </div>

      <SystemIconPickerModal
        open={iconPickerOpen}
        initialFaClass={form.iconFaClass}
        initialAssetUrl={form.iconAssetUrl}
        initialPreviewUrl={pendingIconPreviewUrl}
        initialKind={form.iconKind}
        onClose={() => setIconPickerOpen(false)}
        onSelectFontAwesome={(iconFaClass) => {
          clearPendingIcon();
          setForm((current) => ({
            ...current,
            iconKind: "FontAwesome",
            iconFaClass,
            iconAssetUrl: "",
          }));
          setIconPickerOpen(false);
        }}
        onPickImageFile={(file) => {
          clearPendingIcon();
          const previewUrl = URL.createObjectURL(file);
          setPendingIconFile(file);
          setPendingIconPreviewUrl(previewUrl);
          setForm((current) => ({
            ...current,
            iconKind: "Upload",
            iconAssetUrl: "",
            iconFaClass: "",
          }));
          setIconPickerOpen(false);
        }}
      />
    </>,
    document.body,
  );
}
