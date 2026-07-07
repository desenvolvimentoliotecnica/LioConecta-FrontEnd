import type { EnrichedMeeting } from "../../config/pulse/types";

type PulseAgendaBuilderProps = {
  meeting: EnrichedMeeting;
};

export function PulseAgendaBuilder({ meeting }: PulseAgendaBuilderProps) {
  const totalMinutes = meeting.agenda.reduce((sum, a) => sum + a.durationMinutes, 0);

  return (
    <article className="pulse-agenda">
      <header className="pulse-agenda__head">
        <h3>{meeting.title}</h3>
        <p>
          Facilitador: {meeting.facilitatorName} · {meeting.durationMinutes} min planejados ·{" "}
          {meeting.agenda.length} tópicos ({totalMinutes} min na pauta)
        </p>
      </header>

      <ol className="pulse-agenda__list">
        {meeting.agenda.map((item, idx) => (
          <li key={item.id} className="pulse-agenda__item">
            <span className="pulse-agenda__seq">{idx + 1}</span>
            <div className="pulse-agenda__content">
              <div className="pulse-agenda__row">
                <strong>{item.title}</strong>
                <span className="pulse-agenda__duration">{item.durationMinutes} min</span>
              </div>
              <span className="pulse-agenda__owner">Responsável: {item.ownerName}</span>
              {item.decision ? (
                <div className="pulse-agenda__decision">
                  <i className="fa-solid fa-gavel" aria-hidden="true" />
                  <span>Decisão: {item.decision}</span>
                </div>
              ) : (
                <button type="button" className="pulse-agenda__add-decision" disabled>
                  Registrar decisão (mock)
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>

      {meeting.agenda.length === 0 ? (
        <p className="pulse-agenda__empty">Nenhum tópico na pauta desta reunião.</p>
      ) : null}
    </article>
  );
}
