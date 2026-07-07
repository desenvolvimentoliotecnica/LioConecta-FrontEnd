import { useEffect, useState, type FormEvent } from "react";
import type { CalendarListItemDto } from "../../api/types";
import type { CalendarModalEvent } from "./calendarMappers";

type CalendarEventModalProps = {
  open: boolean;
  mode: "create" | "edit" | "view";
  event: CalendarModalEvent | null;
  defaultCalendarId: string;
  calendars: CalendarListItemDto[];
  saving: boolean;
  onClose: () => void;
  onSave: (payload: {
    calendarId: string;
    title: string;
    startAt: string;
    endAt: string;
    isAllDay: boolean;
    location: string;
    description: string;
  }) => void;
  onDelete?: () => void;
};

function toLocalInputValue(iso: string, isAllDay: boolean): string {
  const date = new Date(iso);
  if (isAllDay) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromLocalInputValue(value: string, isAllDay: boolean, kind: "start" | "end"): string {
  if (isAllDay) {
    const endSuffix = kind === "end" ? "T23:59:59" : "T00:00:00";
    return new Date(`${value}${endSuffix}`).toISOString();
  }
  return new Date(value).toISOString();
}

export function CalendarEventModal({
  open,
  mode,
  event,
  defaultCalendarId,
  calendars,
  saving,
  onClose,
  onSave,
  onDelete,
}: CalendarEventModalProps) {
  const [title, setTitle] = useState("");
  const [calendarId, setCalendarId] = useState(defaultCalendarId);
  const [startValue, setStartValue] = useState("");
  const [endValue, setEndValue] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;

    if (event) {
      setTitle(event.title);
      setCalendarId(event.calendarId || defaultCalendarId);
      setIsAllDay(event.isAllDay);
      setStartValue(toLocalInputValue(event.startAt, event.isAllDay));
      setEndValue(toLocalInputValue(event.endAt, event.isAllDay));
      setLocation(event.location);
      setDescription(event.description);
      return;
    }

    const now = new Date();
    const later = new Date(now.getTime() + 60 * 60 * 1000);
    setTitle("");
    setCalendarId(defaultCalendarId);
    setIsAllDay(false);
    setStartValue(toLocalInputValue(now.toISOString(), false));
    setEndValue(toLocalInputValue(later.toISOString(), false));
    setLocation("");
    setDescription("");
  }, [open, event, defaultCalendarId]);

  if (!open) return null;

  const readOnly = mode === "view" || (event?.canEdit === false && mode === "edit");
  const titleLabel = mode === "create" ? "Novo evento" : mode === "edit" ? "Editar evento" : "Detalhes do evento";

  const handleSubmit = (formEvent: FormEvent) => {
    formEvent.preventDefault();
    if (readOnly || !title.trim()) return;

    onSave({
      calendarId,
      title: title.trim(),
      startAt: fromLocalInputValue(startValue, isAllDay, "start"),
      endAt: fromLocalInputValue(endValue, isAllDay, "end"),
      isAllDay,
      location: location.trim(),
      description: description.trim(),
    });
  };

  return (
    <div className="calendar-modal__backdrop" role="presentation" onClick={onClose}>
      <div
        className="calendar-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="calendar-modal__header">
          <h2 id="calendar-modal-title">{titleLabel}</h2>
          <button type="button" className="calendar-modal__close" onClick={onClose} aria-label="Fechar">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <form className="calendar-modal__form" onSubmit={handleSubmit}>
          <label className="calendar-modal__field">
            <span>Título</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={readOnly || saving}
            />
          </label>

          {mode === "create" ? (
            <label className="calendar-modal__field">
              <span>Calendário</span>
              <select
                value={calendarId}
                onChange={(e) => setCalendarId(e.target.value)}
                disabled={saving}
              >
                {calendars.map((calendar) => (
                  <option key={calendar.id} value={calendar.id} disabled={!calendar.canEdit}>
                    {calendar.name}
                    {!calendar.canEdit ? " (somente leitura)" : ""}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="calendar-modal__checkbox">
            <input
              type="checkbox"
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              disabled={readOnly || saving}
            />
            Dia inteiro
          </label>

          <div className="calendar-modal__row">
            <label className="calendar-modal__field">
              <span>Início</span>
              <input
                type={isAllDay ? "date" : "datetime-local"}
                value={startValue}
                onChange={(e) => setStartValue(e.target.value)}
                required
                disabled={readOnly || saving}
              />
            </label>
            <label className="calendar-modal__field">
              <span>Fim</span>
              <input
                type={isAllDay ? "date" : "datetime-local"}
                value={endValue}
                onChange={(e) => setEndValue(e.target.value)}
                required
                disabled={readOnly || saving}
              />
            </label>
          </div>

          <label className="calendar-modal__field">
            <span>Local</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={readOnly || saving}
            />
          </label>

          <label className="calendar-modal__field">
            <span>Descrição</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={readOnly || saving}
            />
          </label>

          {event?.webLink ? (
            <a
              className="calendar-modal__outlook-link"
              href={event.webLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-microsoft" aria-hidden="true" /> Abrir no Outlook
            </a>
          ) : null}

          {event?.onlineMeetingUrl ? (
            <a
              className="calendar-modal__teams-link"
              href={event.onlineMeetingUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-solid fa-video" aria-hidden="true" /> Entrar na reunião Teams
            </a>
          ) : null}

          <footer className="calendar-modal__footer">
            {mode === "edit" && onDelete && event?.canEdit ? (
              <button
                type="button"
                className="calendar-modal__delete"
                onClick={onDelete}
                disabled={saving}
              >
                Excluir
              </button>
            ) : null}
            <div className="calendar-modal__footer-actions">
              <button type="button" className="calendar-modal__cancel" onClick={onClose} disabled={saving}>
                Cancelar
              </button>
              {!readOnly ? (
                <button type="submit" className="calendar-modal__save" disabled={saving}>
                  {saving ? "Salvando…" : "Salvar"}
                </button>
              ) : null}
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
