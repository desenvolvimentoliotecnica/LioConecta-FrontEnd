import { useState } from "react";
import type { UniLioQuizQuestion } from "../../utils/unilioQuiz";

type Props = {
  moduleTitle: string;
  passingScore: number;
  questions: UniLioQuizQuestion[];
  onSubmit?: (score: number, passed: boolean) => void;
};

export function UniLioQuizWidget({ moduleTitle, passingScore, questions, onSubmit }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  const handleSubmit = () => {
    let correct = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correctAnswer) correct += 1;
    }
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= passingScore;
    setResult({ score, passed });
    onSubmit?.(score, passed);
  };

  const handleRetry = () => {
    setResult(null);
    onSubmit?.(0, false);
  };

  const allAnswered = questions.every((q) => Boolean(answers[q.id]));
  const showSubmit = !result || !result.passed;

  return (
    <div className="unilio-quiz">
      <h3 className="unilio-quiz__title">Quiz — {moduleTitle}</h3>
      <p className="unilio-quiz__hint">Nota mínima: {passingScore}% · {questions.length} questões</p>

      {questions.map((q, idx) => (
        <fieldset key={q.id} className="unilio-quiz__question">
          <legend>
            {idx + 1}. {q.text}
          </legend>
          {q.options.map((opt) => (
            <label key={opt.id} className="unilio-quiz__option">
              <input
                type="radio"
                name={q.id}
                value={opt.id}
                checked={answers[q.id] === opt.id}
                onChange={() => {
                  setAnswers((a) => ({ ...a, [q.id]: opt.id }));
                  if (result && !result.passed) {
                    setResult(null);
                    onSubmit?.(0, false);
                  }
                }}
              />
              {opt.label}
            </label>
          ))}
        </fieldset>
      ))}

      {result ? (
        <div className={`unilio-quiz__result unilio-quiz__result--${result.passed ? "pass" : "fail"}`}>
          {result.passed ? "Aprovado!" : "Reprovado — tente novamente."} Nota: {result.score}%
        </div>
      ) : null}

      {showSubmit ? (
        <div className="unilio-quiz__actions">
          {result && !result.passed ? (
            <button type="button" className="unilio-quiz__retry" onClick={handleRetry}>
              Refazer quiz
            </button>
          ) : null}
          <button
            type="button"
            className="unilio-quiz__submit"
            onClick={handleSubmit}
            disabled={!allAnswered}
          >
            Enviar respostas
          </button>
        </div>
      ) : null}
    </div>
  );
}
