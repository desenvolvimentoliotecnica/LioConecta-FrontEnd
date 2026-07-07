import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import type { CalendarListItemDto } from "../../api/types";
import type { CalendarModalEvent } from "./calendarMappers";
import "../../styles/contracheque-page.css";

type CalendarEventModalProps = {
  open: boolean;
  mode: "create" | "edit" | "view";
  event: CalendarModalEvent | null;
  defaultCalendarId: string;
  calendars: CalendarListItemDto[];
  saving: boolean;
  error: string | null;
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
  error,
  onClose,
  onSave,
  onDelete,
}: CalendarEventModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const [title, setTitle] = useState("");
  const [calendarId, setCalendarId] = useState(defaultCalendarId);
  const [startValue, setStartValue] = useState("");
  const [endValue, setEndValue] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  onCloseRef.current = onClose;

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
      setValidationError(null);
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
    setValidationError(null);
  }, [open, event, defaultCalendarId]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (keydown: KeyboardEvent) => {
      if (keydown.key === "Escape") {
        onCloseRef.current();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
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

  if (!open) return null;

  const readOnly = mode === "view" || (event?.canEdit === false && mode === "edit");
  const titleLabel = mode === "create" ? "Novo evento" : mode === "edit" ? "Editar evento" : "Detalhes do evento";
  const editableCalendars = calendars.filter((calendar) => calendar.canEdit);
  const displayError = validationError ?? error;

  const handleSubmit = (formEvent: FormEvent) => {
    formEvent.preventDefault();
    if (readOnly || !title.trim()) return;

    if (mode === "create" && !calendarId.trim() && editableCalendars.length === 0) {
      setValidationError("Nenhum calendário editável disponível. Vincule sua conta Microsoft novamente.");
      return;
    }

    setValidationError(null);
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

  return createPortal(
    <div className="pay-modal__backdrop" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="pay-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="pay-modal__header">
          <h2 className="pay-modal__title" id="calendar-modal-title">
            {titleLabel}
          </h2>
          <button type="button" className="pay-modal__close" onClick={onClose} aria-label="Fechar">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <form className="pay-modal__body calendar-modal__form" onSubmit={handleSubmit}>
          {displayError ? (
            <p className="calendar-page__banner-error calendar-modal__error" role="alert">
              {displayError}
            </p>
          ) : null}

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
                disabled={saving || editableCalendars.length === 0}
                required
              >
                {editableCalendars.length === 0 ? (
                  <option value="">Nenhum calendário disponível</option>
                ) : null}
                {editableCalendars.map((calendar) => (
                  <option key={calendar.id} value={calendar.id}>
                    {calendar.name}
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

          <footer className="pay-modal__footer">
            <div className="pay-modal__footer-start">
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
            </div>
            <div className="pay-modal__footer-end">
              <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose} disabled={saving}>
                Cancelar
              </button>
              {!readOnly ? (
                <button type="submit" className="pay-modal__btn calendar-modal__save" disabled={saving}>
                  {saving ? "Salvando…" : "Salvar"}
                </button>
              ) : null}
            </div>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}
