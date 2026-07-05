type PreviewOption = {
  id: string;
  text: string;
};

type Props = {
  question: string;
  options: PreviewOption[];
  heroImageUrl: string;
  showResults?: boolean;
  selectedOptionId?: string | null;
};

export function PollPreview({
  question,
  options,
  heroImageUrl,
  showResults = false,
  selectedOptionId = null,
}: Props) {
  const filledOptions = options.filter((option) => option.text.trim().length > 0);
  const totalVotes = showResults ? Math.max(filledOptions.length, 1) : 0;

  return (
    <div className="poll poll-preview">
      <div className="poll__banner">
        <img src={heroImageUrl} alt="" />
      </div>
      <div className="poll__content">
        <div className="poll__header">
          <div className="poll__title">{question.trim() || "Sua pergunta aparecerá aqui"}</div>
          <span className="badge badge--enquete">Enquete</span>
        </div>
        <div className="poll__options">
          {(filledOptions.length > 0 ? filledOptions : [{ id: "placeholder-1", text: "Opção 1" }, { id: "placeholder-2", text: "Opção 2" }]).map(
            (option) => {
              const pct = showResults ? Math.round(100 / totalVotes) : 0;
              const isSelected = selectedOptionId === option.id;

              return (
                <div
                  key={option.id}
                  className={`poll__option${isSelected ? " poll__option--selected" : ""}`}
                >
                  <span className={`poll__radio${isSelected ? " poll__radio--checked" : ""}`} />
                  <div className="poll__option-content">
                    <span className="poll__label">{option.text}</span>
                    {showResults ? (
                      <div className="poll__bar-wrap">
                        <div className="poll__bar" style={{ width: `${pct}%` }} />
                      </div>
                    ) : null}
                  </div>
                  {showResults ? <span className="poll__pct">{pct}%</span> : null}
                </div>
              );
            },
          )}
        </div>
        {!showResults ? (
          <button type="button" className="btn" disabled>
            Votar
          </button>
        ) : null}
      </div>
    </div>
  );
}
