import { useUniLioEvents } from "../../../api/hooks/useUniLioEvents";
import { formatUniLioDateTime } from "../../../utils/unilioView";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";

export function UniLioEventosPage() {
  const { data, isLoading, isFallback } = useUniLioEvents();

  if (isLoading) {
    return (
      <main className="unilio-page">
        <p className="unilio-page__loading">Carregando eventos…</p>
      </main>
    );
  }

  return (
    <main className="unilio-page">
      <div className="unilio-page__head">
        <h1 className="unilio-page__title">Eventos</h1>
        <p className="unilio-page__desc">Lives, workshops e turmas presenciais.</p>
      </div>

      <UniLioFallbackBanner show={isFallback} />

      <div className="unilio-events-grid">
        {data.items.map((event) => (
          <article key={event.id} className="unilio-event-card">
            <span className="unilio-event-card__type">{event.eventType}</span>
            <h3>{event.title}</h3>
            <p>
              <i className="fa-solid fa-calendar" aria-hidden="true" /> {formatUniLioDateTime(event.startsAt)}
            </p>
            {event.instructorName ? <p>Instrutor: {event.instructorName}</p> : null}
            <p>
              {event.registeredCount}/{event.maxAttendees} inscritos
            </p>
            {event.isRegistered ? (
              event.meetingUrl ? (
                <a href={event.meetingUrl} className="unilio-event-card__btn" target="_blank" rel="noreferrer">
                  Entrar na reunião
                </a>
              ) : (
                <span className="unilio-event-card__registered">Inscrito</span>
              )
            ) : (
              <button type="button" className="unilio-event-card__btn">
                Inscrever-se
              </button>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
