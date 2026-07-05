import { useMemo, useState } from "react";
import {
  getFeedbackMessage,
  MOOD_OPTIONS,
  pickRandomFeedbackIndex,
  type MoodLevel,
} from "../../config/mood-feedback";
import { isMoodAlreadyRegisteredError, useMoodToday, useRegisterMood } from "../../api/hooks/useMoodCheck";
import { config } from "../../api/client";
import "./mood-check.css";

export function MoodCheckCard() {
  const { data, isLoading } = useMoodToday();
  const registerMood = useRegisterMood();
  const feedbackIndexes = useMemo(() => pickRandomFeedbackIndex(), []);
  const [localMood, setLocalMood] = useState<MoodLevel | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const activeMood = localMood ?? data?.mood ?? null;
  const hasRegistered = Boolean(data?.registered || localMood);
  const isSubmitting = registerMood.isPending;

  async function handleSelect(mood: MoodLevel) {
    if (hasRegistered || isSubmitting || config.useMock) return;

    setSubmitError(null);

    try {
      await registerMood.mutateAsync(mood);
      setLocalMood(mood);
    } catch (error) {
      if (isMoodAlreadyRegisteredError(error)) {
        setLocalMood(data?.mood ?? mood);
        return;
      }
      setSubmitError("Não foi possível registrar seu humor. Tente novamente.");
    }
  }

  const feedbackMessage =
    activeMood != null
      ? getFeedbackMessage(activeMood, feedbackIndexes[activeMood])
      : null;

  return (
    <div className="feed-mood-slot">
      <article className="card card--mood">
        <div className="card__header">
          <img className="avatar avatar--sm" src="/avatar-rh.png" alt="Recursos Humanos" />
          <div className="card__meta">
            <div className="card__author">
              Recursos Humanos
              <span className="card__verified" title="Verificado">
                <i className="fa-solid fa-circle-check" aria-hidden="true" />
              </span>
            </div>
            <div className="card__time">Hoje</div>
          </div>
          <span className="badge badge--bemestar">Bem-estar</span>
        </div>

        <div className="card__body">
          {isLoading ? (
            <p className="mood-check__loading">Carregando…</p>
          ) : hasRegistered && activeMood && feedbackMessage ? (
            <div className="mood-check__feedback" role="status">
              <div className={`mood-check__feedback-icon mood-check__feedback-icon--${activeMood}`}>
                <i
                  className={`fa-solid ${MOOD_OPTIONS.find((o) => o.level === activeMood)?.icon ?? "fa-face-smile"}`}
                  aria-hidden="true"
                />
              </div>
              <strong>Obrigado por compartilhar!</strong>
              <p>{feedbackMessage}</p>
              <p className="mood-check__registered-note">
                Registro de hoje concluído. Você poderá responder novamente amanhã.
              </p>
            </div>
          ) : (
            <>
              <strong>Como você está se sentindo hoje?</strong>
              <p style={{ marginTop: 8 }}>
                Sua resposta é anônima e ajuda o RH a cuidar melhor do clima da equipe.
              </p>
              <div className="mood" role="group" aria-label="Opções de humor">
                {MOOD_OPTIONS.map((option) => (
                  <button
                    key={option.level}
                    type="button"
                    className="mood__option"
                    disabled={isSubmitting}
                    onClick={() => void handleSelect(option.level)}
                  >
                    <span className="mood__emoji" aria-hidden="true">
                      <i className={`fa-solid ${option.icon}`} />
                    </span>
                    <span className="mood__label">{option.label}</span>
                  </button>
                ))}
              </div>
              <p className="mood__hint">
                {isSubmitting
                  ? "Registrando sua resposta…"
                  : "Toque em uma opção para registrar como está se sentindo."}
              </p>
              {submitError && (
                <p className="mood-check__error" role="alert">
                  {submitError}
                </p>
              )}
            </>
          )}
        </div>
      </article>
    </div>
  );
}
