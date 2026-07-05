import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCreatePoll } from "../../api/hooks/useFeed";
import { ComunicadoHeroImageModal } from "../comunicados/ComunicadoHeroImageModal";
import { PollPreview } from "./PollPreview";
import "./poll-create-modal.css";

const DEFAULT_HERO = "/bg-poll.png";
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

const STEPS = [
  { id: "question", label: "Pergunta" },
  { id: "options", label: "Opções" },
  { id: "settings", label: "Configurações" },
  { id: "review", label: "Revisão" },
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onPublished?: () => void;
  onError?: (message: string) => void;
};

function createEmptyOptions(count = MIN_OPTIONS): string[] {
  return Array.from({ length: count }, () => "");
}

function toIsoEndsAt(value: string): string | null {
  if (!value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function formatEndsAtDisplay(value: string): string {
  if (!value.trim()) return "Sem data de encerramento";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data inválida";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PollCreateModal({ open, onClose, onPublished, onError }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const createPoll = useCreatePoll();

  const [stepIndex, setStepIndex] = useState(0);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(() => createEmptyOptions());
  const [endsAt, setEndsAt] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState(DEFAULT_HERO);
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  const currentStep = STEPS[stepIndex];

  useEffect(() => {
    if (!open) return;
    setStepIndex(0);
    setQuestion("");
    setOptions(createEmptyOptions());
    setEndsAt("");
    setHeroImageUrl(DEFAULT_HERO);
    setSubmitError(null);
    setStepError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || heroModalOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, heroModalOpen, onClose]);

  const trimmedOptions = useMemo(
    () => options.map((option) => option.trim()).filter(Boolean),
    [options],
  );

  const hasDuplicateOptions = useMemo(() => {
    const normalized = trimmedOptions.map((option) => option.toLowerCase());
    return new Set(normalized).size !== normalized.length;
  }, [trimmedOptions]);

  const stepValidation = useMemo(() => {
    switch (currentStep.id) {
      case "question":
        if (question.trim().length < 5) {
          return "A pergunta deve ter pelo menos 5 caracteres.";
        }
        if (question.trim().length > 300) {
          return "A pergunta deve ter no máximo 300 caracteres.";
        }
        return null;
      case "options":
        if (trimmedOptions.length < MIN_OPTIONS) {
          return `Informe pelo menos ${MIN_OPTIONS} opções preenchidas.`;
        }
        if (trimmedOptions.length > MAX_OPTIONS) {
          return `Use no máximo ${MAX_OPTIONS} opções.`;
        }
        if (hasDuplicateOptions) {
          return "As opções devem ser diferentes entre si.";
        }
        return null;
      case "settings":
        if (endsAt && Number.isNaN(new Date(endsAt).getTime())) {
          return "Data de encerramento inválida.";
        }
        if (endsAt && new Date(endsAt).getTime() <= Date.now()) {
          return "A data de encerramento deve ser futura.";
        }
        return null;
      case "review":
        return null;
      default:
        return null;
    }
  }, [currentStep.id, question, trimmedOptions, hasDuplicateOptions, endsAt]);

  const canAdvance = !stepValidation && !createPoll.isPending;
  const isLastStep = stepIndex === STEPS.length - 1;

  const previewOptions = options.map((text, index) => ({
    id: `preview-${index}`,
    text,
  }));

  function updateOption(index: number, value: string) {
    setOptions((current) => current.map((option, i) => (i === index ? value : option)));
  }

  function addOption() {
    setOptions((current) => (current.length >= MAX_OPTIONS ? current : [...current, ""]));
  }

  function removeOption(index: number) {
    setOptions((current) =>
      current.length <= MIN_OPTIONS ? current : current.filter((_, i) => i !== index),
    );
  }

  function handleBack() {
    setStepError(null);
    setStepIndex((index) => Math.max(0, index - 1));
  }

  function handleNext() {
    if (!canAdvance) {
      setStepError(stepValidation);
      return;
    }

    setStepError(null);
    if (isLastStep) {
      void handlePublish();
      return;
    }

    setStepIndex((index) => Math.min(STEPS.length - 1, index + 1));
  }

  async function handlePublish() {
    if (createPoll.isPending) return;

    setSubmitError(null);

    try {
      await createPoll.mutateAsync({
        question: question.trim(),
        options: trimmedOptions,
        heroImageUrl: heroImageUrl || DEFAULT_HERO,
        endsAt: toIsoEndsAt(endsAt),
      });
      onPublished?.();
      onClose();
    } catch {
      const message = "Não foi possível publicar a enquete. Tente novamente.";
      setSubmitError(message);
      onError?.(message);
    }
  }

  if (!open) return null;

  return createPortal(
    <>
      <div className="poll-create-modal__backdrop" role="presentation" onClick={onClose}>
        <div
          ref={dialogRef}
          className="poll-create-modal__dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="poll-create-modal__chrome">
            <header className="poll-create-modal__header">
              <div>
                <h2 id={titleId}>Criar enquete</h2>
                <p className="poll-create-modal__subtitle">
                  Passo {stepIndex + 1} de {STEPS.length} — {currentStep.label}
                </p>
              </div>
              <button
                type="button"
                className="poll-create-modal__close"
                aria-label="Fechar"
                onClick={onClose}
              >
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </header>

            <nav className="poll-create-modal__steps" aria-label="Etapas da criação">
              {STEPS.map((step, index) => {
                const isActive = index === stepIndex;
                const isDone = index < stepIndex;

                return (
                  <div
                    key={step.id}
                    className={`poll-create-modal__step${isActive ? " poll-create-modal__step--active" : ""}${isDone ? " poll-create-modal__step--done" : ""}`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <span className="poll-create-modal__step-index">
                      {isDone ? <i className="fa-solid fa-check" aria-hidden="true" /> : index + 1}
                    </span>
                    <span className="poll-create-modal__step-label">{step.label}</span>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="poll-create-modal__body">
            {currentStep.id === "question" ? (
              <section aria-label="Pergunta da enquete">
                <h3 className="poll-create-modal__section-title">Qual é a pergunta?</h3>
                <p className="poll-create-modal__hint">
                  Escreva uma pergunta clara para os colegas votarem no feed.
                </p>
                <div className="poll-create-modal__field">
                  <label htmlFor={`${titleId}-question`}>Pergunta</label>
                  <textarea
                    id={`${titleId}-question`}
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="Qual tema você gostaria para a próxima palestra?"
                    maxLength={300}
                    rows={4}
                    disabled={createPoll.isPending}
                    autoFocus
                  />
                  <span className="poll-create-modal__char-count">
                    {question.trim().length}/300
                  </span>
                </div>
              </section>
            ) : null}

            {currentStep.id === "options" ? (
              <section aria-label="Opções de resposta">
                <h3 className="poll-create-modal__section-title">Opções de resposta</h3>
                <p className="poll-create-modal__hint">
                  Adicione entre {MIN_OPTIONS} e {MAX_OPTIONS} alternativas. Cada opção deve ser única.
                </p>
                <div className="poll-create-modal__options">
                  {options.map((option, index) => (
                    <div key={`option-${index}`} className="poll-create-modal__option-row">
                      <input
                        type="text"
                        value={option}
                        onChange={(event) => updateOption(index, event.target.value)}
                        placeholder={`Opção ${index + 1}`}
                        maxLength={120}
                        disabled={createPoll.isPending}
                        aria-label={`Opção ${index + 1}`}
                      />
                      <button
                        type="button"
                        className="poll-create-modal__option-remove"
                        aria-label={`Remover opção ${index + 1}`}
                        onClick={() => removeOption(index)}
                        disabled={createPoll.isPending || options.length <= MIN_OPTIONS}
                      >
                        <i className="fa-solid fa-minus" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="poll-create-modal__option-add"
                  onClick={addOption}
                  disabled={createPoll.isPending || options.length >= MAX_OPTIONS}
                >
                  <i className="fa-solid fa-plus" aria-hidden="true" />
                  Adicionar opção
                </button>
              </section>
            ) : null}

            {currentStep.id === "settings" ? (
              <section aria-label="Configurações da enquete">
                <h3 className="poll-create-modal__section-title">Configurações</h3>
                <p className="poll-create-modal__hint">
                  Encerramento e capa são opcionais. Você pode publicar sem preencher estes campos.
                </p>

                <div className="poll-create-modal__field">
                  <label htmlFor={`${titleId}-ends-at`}>Encerramento (opcional)</label>
                  <input
                    id={`${titleId}-ends-at`}
                    type="datetime-local"
                    value={endsAt}
                    onChange={(event) => setEndsAt(event.target.value)}
                    disabled={createPoll.isPending}
                  />
                </div>

                <div className="poll-create-modal__field">
                  <span>Imagem de capa</span>
                  <button
                    type="button"
                    className="poll-create-modal__cover-btn"
                    onClick={() => setHeroModalOpen(true)}
                    disabled={createPoll.isPending}
                  >
                    <i className="fa-solid fa-image" aria-hidden="true" />
                    Escolher capa
                  </button>
                  <div className="poll-create-modal__cover-preview">
                    <img src={heroImageUrl || DEFAULT_HERO} alt="Pré-visualização da capa" />
                  </div>
                </div>
              </section>
            ) : null}

            {currentStep.id === "review" ? (
              <section aria-label="Revisão da enquete">
                <h3 className="poll-create-modal__section-title">Revisão</h3>
                <p className="poll-create-modal__hint">
                  Confira como a enquete aparecerá no feed antes de publicar.
                </p>

                <dl className="poll-create-modal__summary">
                  <div>
                    <dt>Encerramento</dt>
                    <dd>{formatEndsAtDisplay(endsAt)}</dd>
                  </div>
                  <div>
                    <dt>Opções</dt>
                    <dd>{trimmedOptions.length} alternativas</dd>
                  </div>
                </dl>

                <div className="poll-create-modal__preview-card">
                  <PollPreview
                    question={question}
                    options={previewOptions}
                    heroImageUrl={heroImageUrl || DEFAULT_HERO}
                  />
                </div>
              </section>
            ) : null}
          </div>

          {(stepError || submitError) && (
            <p className="poll-create-modal__error poll-create-modal__message" role="alert">
              {submitError ?? stepError}
            </p>
          )}

          <footer className="poll-create-modal__footer">
            <button
              type="button"
              className="poll-create-modal__cancel"
              onClick={onClose}
              disabled={createPoll.isPending}
            >
              Cancelar
            </button>
            <div className="poll-create-modal__footer-actions">
              {stepIndex > 0 ? (
                <button
                  type="button"
                  className="poll-create-modal__back"
                  onClick={handleBack}
                  disabled={createPoll.isPending}
                >
                  Voltar
                </button>
              ) : null}
              <button
                type="button"
                className="poll-create-modal__publish"
                onClick={handleNext}
                disabled={!canAdvance && !isLastStep}
              >
                {createPoll.isPending
                  ? "Publicando…"
                  : isLastStep
                    ? "Publicar enquete"
                    : "Continuar"}
              </button>
            </div>
          </footer>
        </div>
      </div>

      <ComunicadoHeroImageModal
        open={heroModalOpen}
        stacked
        initialUrl={heroImageUrl || DEFAULT_HERO}
        onClose={() => setHeroModalOpen(false)}
        onConfirm={(url) => {
          setHeroImageUrl(url);
          setHeroModalOpen(false);
        }}
      />
    </>,
    document.body,
  );
}
