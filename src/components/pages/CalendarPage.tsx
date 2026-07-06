import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useBirthdays } from "../../api/hooks/useBirthdays";
import {
  CALENDAR_EVENTS,
  CALENDAR_FILTERS,
  MONTH_NAMES,
  WEEKDAY_LABELS,
  buildMonthGrid,
  eventsForDay,
  formatEventTime,
  formatLongDate,
  getDailyMenu,
  getTodayDateKey,
  mapBirthdaysToCalendarEvents,
  parseDateKey,
  upcomingEvents,
  type CalendarEvent,
  type CalendarEventKind,
} from "../../config/calendar";
import "../../styles/calendar-page.css";

export function CalendarPage() {
  const todayKey = useMemo(() => getTodayDateKey(), []);
  const todayParts = useMemo(() => parseDateKey(todayKey), [todayKey]);

  const [viewYear, setViewYear] = useState(todayParts.year);
  const [viewMonth, setViewMonth] = useState(todayParts.month);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [kind, setKind] = useState<CalendarEventKind>("all");

  const { data: birthdays = [] } = useBirthdays(365);

  const allEvents = useMemo(() => {
    const birthdayEvents = mapBirthdaysToCalendarEvents(birthdays);
    return [...CALENDAR_EVENTS, ...birthdayEvents];
  }, [birthdays]);

  const weeks = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const filteredEvents = useMemo(
    () => (kind === "all" ? allEvents : allEvents.filter((e) => e.kind === kind)),
    [allEvents, kind],
  );

  const selectedEvents = useMemo(
    () => eventsForDay(filteredEvents, selectedDate),
    [filteredEvents, selectedDate],
  );

  const dailyMenu = useMemo(() => getDailyMenu(selectedDate), [selectedDate]);

  const upcoming = useMemo(
    () => upcomingEvents(
      kind === "all" ? allEvents : allEvents.filter((e) => e.kind === kind),
      todayKey,
    ),
    [allEvents, kind, todayKey],
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, number>();
    const source = kind === "all"
      ? allEvents
      : allEvents.filter((e) => e.kind === kind);
    source.forEach((event) => {
      const parsed = parseDateKey(event.date);
      if (parsed.year === viewYear && parsed.month === viewMonth) {
        map.set(event.date, (map.get(event.date) ?? 0) + 1);
      }
    });
    return map;
  }, [allEvents, kind, viewYear, viewMonth]);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
      return;
    }
    setViewMonth((m) => m - 1);
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
      return;
    }
    setViewMonth((m) => m + 1);
  };

  const goToday = () => {
    const key = getTodayDateKey();
    const parts = parseDateKey(key);
    setViewYear(parts.year);
    setViewMonth(parts.month);
    setSelectedDate(key);
  };

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">InÃ­cio</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">CalendÃ¡rio</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">CalendÃ¡rio</h1>
            <p className="page-header__desc">
              ReuniÃµes, eventos, prazos de comunicados, aniversÃ¡rios, reservas e atividades de grupos
              â€” tudo integrado ao ecossistema LioConecta.
            </p>
          </div>
          <button className="calendar-page__today-btn" type="button" onClick={goToday}>
            Hoje
          </button>
        </div>
      </header>

      <section className="calendar-page__controls" aria-label="Filtros do calendÃ¡rio">
        <div className="page-filters" role="group" aria-label="Filtrar eventos">
          {CALENDAR_FILTERS.map((entry) => (
            <button
              key={entry.id}
              className={`filter-chip${kind === entry.id ? " is-active" : ""}`}
              type="button"
              onClick={() => setKind(entry.id)}
            >
              <i className={`fa-solid ${entry.icon}`} aria-hidden="true" style={{ marginRight: 6 }} />
              {entry.label}
            </button>
          ))}
        </div>
      </section>

      <div className="calendar-page__layout">
        <section className="calendar-page__month" aria-label="VisÃ£o mensal">
          <div className="calendar-page__month-header">
            <button className="calendar-page__nav" type="button" onClick={goPrevMonth} aria-label="MÃªs anterior">
              <i className="fa-solid fa-chevron-left" aria-hidden="true" />
            </button>
            <h2 className="calendar-page__month-title">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h2>
            <button className="calendar-page__nav" type="button" onClick={goNextMonth} aria-label="PrÃ³ximo mÃªs">
              <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            </button>
          </div>

          <div className="calendar-grid" role="grid" aria-label={`CalendÃ¡rio de ${MONTH_NAMES[viewMonth]} ${viewYear}`}>
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="calendar-grid__weekday" role="columnheader">
                {label}
              </div>
            ))}
            {weeks.flat().map((dateKey, index) => {
              if (!dateKey) {
                return <div key={`empty-${index}`} className="calendar-grid__cell calendar-grid__cell--empty" />;
              }
              const { day } = parseDateKey(dateKey);
              const count = eventsByDate.get(dateKey) ?? 0;
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDate;
              return (
                <button
                  key={dateKey}
                  type="button"
                  className={`calendar-grid__cell${isToday ? " is-today" : ""}${isSelected ? " is-selected" : ""}`}
                  onClick={() => setSelectedDate(dateKey)}
                  aria-label={`${day} de ${MONTH_NAMES[viewMonth]}${count ? `, ${count} evento${count === 1 ? "" : "s"}` : ""}`}
                  aria-pressed={isSelected}
                >
                  <span className="calendar-grid__day">{day}</span>
                  {count > 0 ? (
                    <span className="calendar-grid__dots" aria-hidden="true">
                      {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                        <span key={i} className="calendar-grid__dot" />
                      ))}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        <aside className="calendar-page__aside">
          <section className="calendar-panel" aria-label="Agenda do dia selecionado">
            <h2 className="calendar-panel__title">{formatLongDate(selectedDate)}</h2>
            {selectedEvents.length > 0 ? (
              <ul className="calendar-agenda">
                {selectedEvents.map((event) => (
                  <li key={event.id}>
                    <AgendaItem event={event} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="calendar-panel__empty">Nenhum evento neste dia para os filtros selecionados.</p>
            )}
          </section>

          <section className="calendar-panel calendar-panel--menu" aria-label="CardÃ¡pio do dia">
            <div className="calendar-menu__header">
              <h2 className="calendar-panel__title">CardÃ¡pio do dia</h2>
              <Link className="calendar-menu__link" to="/servicos/refeitorio">
                RefeitÃ³rio
                <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
              </Link>
            </div>
            <p className="calendar-menu__meta">
              <i className="fa-solid fa-location-dot" aria-hidden="true" /> {dailyMenu.location}
              <span className="calendar-menu__meta-sep">Â·</span>
              <i className="fa-regular fa-clock" aria-hidden="true" /> {dailyMenu.hours}
            </p>
            <ul className="calendar-menu">
              {dailyMenu.items.map((item) => (
                <li key={`${item.category}-${item.name}`} className="calendar-menu__item">
                  <span className="calendar-menu__category">{item.category}</span>
                  <div className="calendar-menu__content">
                    <strong className="calendar-menu__name">
                      {item.name}
                      {item.vegetarian ? (
                        <span className="calendar-menu__tag">Veg</span>
                      ) : null}
                    </strong>
                    {item.detail ? <span className="calendar-menu__detail">{item.detail}</span> : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="calendar-panel" aria-label="PrÃ³ximos eventos">
            <h2 className="calendar-panel__title">PrÃ³ximos eventos</h2>
            <ul className="calendar-upcoming">
              {upcoming.map((event) => (
                <li key={event.id}>
                  <AgendaItem event={event} compact />
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}

function AgendaItem({
  event,
  compact = false,
}: {
  event: CalendarEvent;
  compact?: boolean;
}) {
  const content = (
    <>
      <span className={`calendar-event__kind calendar-event__kind--${event.kind}`}>
        {CALENDAR_FILTERS.find((f) => f.id === event.kind)?.label}
      </span>
      <strong className="calendar-event__title">{event.title}</strong>
      <span className="calendar-event__time">
        <i className="fa-regular fa-clock" aria-hidden="true" /> {formatEventTime(event)}
      </span>
      {!compact && event.location ? (
        <span className="calendar-event__location">
          <i className="fa-solid fa-location-dot" aria-hidden="true" /> {event.location}
        </span>
      ) : null}
      {!compact && event.description ? (
        <p className="calendar-event__desc">{event.description}</p>
      ) : null}
    </>
  );

  if (event.href) {
    return (
      <Link className={`calendar-event${compact ? " calendar-event--compact" : ""}`} to={event.href}>
        {content}
        <i className="fa-solid fa-chevron-right calendar-event__chevron" aria-hidden="true" />
      </Link>
    );
  }

  return <article className={`calendar-event${compact ? " calendar-event--compact" : ""}`}>{content}</article>;
}

