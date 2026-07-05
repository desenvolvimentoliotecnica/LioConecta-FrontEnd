import { useEffect, useId, useMemo, useState } from "react";
import { useCreatePoll } from "../../api/hooks/useFeed";
import { ComunicadoHeroImageModal } from "../comunicados/ComunicadoHeroImageModal";
import { PollPreview } from "./PollPreview";
import "./poll-create-modal.css";

const DEFAULT_HERO = "/bg-poll.png";
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

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

export function PollCreateModal({ open, onClose, onPublished, onError }: Props) {
  const titleId = useId();
  const createPoll = useCreatePoll();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(() => createEmptyOptions());
  const [endsAt, setEndsAt] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState(DEFAULT_HERO);
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setQuestion("");
    setOptions(createEmptyOptions());
    setEndsAt("");
    setHeroImageUrl(DEFAULT_HERO);
    setSubmitError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !heroModalOpen) {
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

  const validationMessage = useMemo(() => {
    if (question.trim().length < 5) {
      return "A pergunta deve ter pelo menos 5 caracteres.";
    }
    if (trimmedOptions.length < MIN_OPTIONS) {
      return `Informe pelo menos ${MIN_OPTIONS} opções.`;
    }
    if (trimmedOptions.length > MAX_OPTIONS) {
      return `Use no máximo ${MAX_OPTIONS} opções.`;
    }
    if (hasDuplicateOptions) {
      return "As opções devem ser diferentes entre si.";
    }
    if (endsAt && Number.isNaN(new Date(endsAt).getTime())) {
      return "Data de encerramento inválida.";
    }
    if (endsAt && new Date(endsAt).getTime() <= Date.now()) {
      return "A data de encerramento deve ser futura.";
    }
    return null;
  }, [question, trimmedOptions, hasDuplicateOptions, endsAt]);

  const canPublish = !validationMessage && !createPoll.isPending;

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

  async function handlePublish() {
    if (!canPublish) return;

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

  return (
    <>
      <div className="poll-create-modal" role="presentation">
        <button
          type="button"
          className="poll-create-modal__backdrop"
          aria-label="Fechar modal"
          onClick={onClose}
        />
        <div
          className="poll-create-modal__dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <header className="poll-create-modal__header">
            <h2 id={titleId}>Criar enquete</h2>
            <button
              type="button"
              className="poll-create-modal__close"
              aria-label="Fechar"
              onClick={onClose}
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </header>

          <div className="poll-create-modal__body">
            <section aria-label="Formulário da enquete">
              <h3 className="poll-create-modal__section-title">Detalhes</h3>

              <div className="poll-create-modal__field">
                <label htmlFor={`${titleId}-question`}>Pergunta</label>
                <textarea
                  id={`${titleId}-question`}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Qual tema você gostaria para a próxima palestra?"
                  maxLength={300}
                  disabled={createPoll.isPending}
                />
              </div>

              <div className="poll-create-modal__field">
                <span>Opções de resposta</span>
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
              </div>

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

            <section aria-label="Pré-visualização da enquete">
              <h3 className="poll-create-modal__section-title">Pré-visualização</h3>
              <p className="poll-create-modal__hint">
                É assim que a enquete aparecerá no feed antes de receber votos.
              </p>
              <div className="poll-create-modal__preview-card">
                <PollPreview
                  question={question}
                  options={previewOptions}
                  heroImageUrl={heroImageUrl || DEFAULT_HERO}
                />
              </div>
            </section>
          </div>

          {submitError ? (
            <p className="poll-create-modal__error" role="alert">
              {submitError}
            </p>
          ) : validationMessage ? (
            <p className="poll-create-modal__hint" style={{ padding: "0 24px" }}>
              {validationMessage}
            </p>
          ) : null}

          <footer className="poll-create-modal__footer">
            <button
              type="button"
              className="poll-create-modal__cancel"
              onClick={onClose}
              disabled={createPoll.isPending}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="poll-create-modal__publish"
              onClick={() => void handlePublish()}
              disabled={!canPublish}
            >
              {createPoll.isPending ? "Publicando…" : "Publicar enquete"}
            </button>
          </footer>
        </div>
      </div>

      <ComunicadoHeroImageModal
        open={heroModalOpen}
        initialUrl={heroImageUrl || DEFAULT_HERO}
        onClose={() => setHeroModalOpen(false)}
        onConfirm={(url) => {
          setHeroImageUrl(url);
          setHeroModalOpen(false);
        }}
      />
    </>
  );
}
