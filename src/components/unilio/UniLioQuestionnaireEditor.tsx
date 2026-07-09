import type { UniLioQuizQuestion } from "../../utils/unilioQuiz";

type Props = {
  questions: UniLioQuizQuestion[];
  disabled?: boolean;
  heading?: string;
  onChange: (questions: UniLioQuizQuestion[]) => void;
};

export function UniLioQuestionnaireEditor({
  questions,
  disabled = false,
  heading = "Questões",
  onChange,
}: Props) {
  function updateQuestion(index: number, patch: Partial<UniLioQuizQuestion>) {
    onChange(
      questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question,
      ),
    );
  }

  function updateOption(questionIndex: number, optionIndex: number, label: string) {
    onChange(
      questions.map((question, currentQuestionIndex) => {
        if (currentQuestionIndex !== questionIndex) return question;
        const options = question.options.map((option, currentOptionIndex) =>
          currentOptionIndex === optionIndex ? { ...option, label } : option,
        );
        return { ...question, options };
      }),
    );
  }

  function addQuestion() {
    const nextIndex = questions.length + 1;
    onChange([
      ...questions,
      {
        id: `q${nextIndex}`,
        text: "",
        options: [
          { id: "a", label: "" },
          { id: "b", label: "" },
          { id: "c", label: "" },
          { id: "d", label: "" },
        ],
        correctAnswer: "a",
      },
    ]);
  }

  function removeQuestion(index: number) {
    onChange(questions.filter((_, questionIndex) => questionIndex !== index));
  }

  return (
    <section className="unilio-module-edit-modal__quiz">
      <div className="unilio-module-edit-modal__quiz-head">
        <h3>{heading}</h3>
      </div>

      {questions.map((question, questionIndex) => (
        <article key={question.id} className="unilio-module-edit-modal__question">
          <div className="unilio-module-edit-modal__question-head">
            <strong>Questão {questionIndex + 1}</strong>
            {!disabled && questions.length > 1 ? (
              <button
                type="button"
                className="unilio-authoring-table__action-btn unilio-authoring-table__action-btn--muted"
                onClick={() => removeQuestion(questionIndex)}
              >
                Remover
              </button>
            ) : null}
          </div>

          <label className="unilio-authoring-field">
            <span className="unilio-authoring-field__label">Enunciado</span>
            <input
              className="unilio-authoring-field__control"
              value={question.text}
              onChange={(e) => updateQuestion(questionIndex, { text: e.target.value })}
              disabled={disabled}
            />
          </label>

          <div className="unilio-module-edit-modal__options">
            {question.options.map((option, optionIndex) => (
              <label key={option.id} className="unilio-module-edit-modal__option">
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={question.correctAnswer === option.id}
                  onChange={() => updateQuestion(questionIndex, { correctAnswer: option.id })}
                  disabled={disabled}
                />
                <input
                  className="unilio-authoring-field__control"
                  value={option.label}
                  onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                  disabled={disabled}
                  placeholder={`Alternativa ${option.id.toUpperCase()}`}
                />
              </label>
            ))}
          </div>
        </article>
      ))}

      {!disabled ? (
        <button
          type="button"
          className="unilio-authoring-btn unilio-authoring-btn--secondary"
          onClick={addQuestion}
        >
          <i className="fa-solid fa-plus" aria-hidden="true" />
          Adicionar questão
        </button>
      ) : null}
    </section>
  );
}
