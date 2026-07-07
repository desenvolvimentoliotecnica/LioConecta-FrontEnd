import type { DateSelectArg, EventClickArg, EventInput } from "@fullcalendar/core";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useCallback, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  useCalendarBootstrap,
  useCalendarEvents,
  useCalendars,
  useCalendarStatus,
  useCafeteriaMenu,
  useCreateCalendarEvent,
  useDeleteCalendarEvent,
  useLinkCalendarAccount,
  useUpdateCalendarEvent,
} from "../../api/hooks/useCalendar";
import { useBirthdays } from "../../api/hooks/useBirthdays";
import { acquireDelegatedToken } from "../../auth/azureMsal";
import { formatMsalErrorForUser } from "../../auth/msalErrors";
import { mapBirthdaysToCalendarEvents } from "../../config/calendar";
import { CalendarEventModal } from "../calendar/CalendarEventModal";
import { CafeteriaMenuPanel } from "../calendar/CafeteriaMenuPanel";
import {
  dtoToModalEvent,
  mapBirthdayToFullCalendar,
  mapOutlookEventToFullCalendar,
  type CalendarModalEvent,
} from "../calendar/calendarMappers";
import "../../styles/calendar-page.css";

type ModalState =
  | { open: false }
  | { open: true; mode: "create" | "edit" | "view"; event: CalendarModalEvent | null };

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function CalendarPage() {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);
  const [selectedMenuDate, setSelectedMenuDate] = useState(formatDateKey(new Date()));
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);

  const { data: bootstrap } = useCalendarBootstrap();
  const { data: status } = useCalendarStatus();
  const linkAccount = useLinkCalendarAccount();
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();

  const calendarEnabled = Boolean(bootstrap?.enabled);
  const linked = Boolean(status?.linked);
  const needsConsent = Boolean(status?.needsConsent);
  const canLoadOutlook = calendarEnabled && linked && !needsConsent;

  const { data: calendars = [] } = useCalendars(canLoadOutlook);
  const activeCalendarIds = useMemo(() => {
    if (selectedCalendarIds.length > 0) return selectedCalendarIds;
    return calendars.map((c) => c.id);
  }, [calendars, selectedCalendarIds]);

  const { data: outlookEvents = [], isLoading: eventsLoading } = useCalendarEvents(
    range?.from ?? null,
    range?.to ?? null,
    activeCalendarIds,
    canLoadOutlook,
  );

  const showBirthdays = bootstrap?.showBirthdays ?? true;
  const showMenu = bootstrap?.showCafeteriaMenu ?? true;
  const { data: birthdays = [] } = useBirthdays(showBirthdays ? 365 : 0);
  const { data: cafeteriaMenu } = useCafeteriaMenu(
    showMenu ? selectedMenuDate : null,
    showMenu,
  );

  const birthdayFcEvents = useMemo(() => {
    if (!showBirthdays) return [];
    return mapBirthdaysToCalendarEvents(birthdays).map(mapBirthdayToFullCalendar);
  }, [birthdays, showBirthdays]);

  const outlookFcEvents = useMemo(
    () => outlookEvents.map(mapOutlookEventToFullCalendar),
    [outlookEvents],
  );

  const fcEvents = useMemo(
    () => [...outlookFcEvents, ...birthdayFcEvents] as EventInput[],
    [outlookFcEvents, birthdayFcEvents],
  );

  const defaultCalendarId = useMemo(
    () => calendars.find((c) => c.isDefaultCalendar && c.canEdit)?.id
      ?? calendars.find((c) => c.canEdit)?.id
      ?? calendars[0]?.id
      ?? "",
    [calendars],
  );

  const handleDatesSet = useCallback((arg: { start: Date; end: Date }) => {
    setRange({ from: arg.start.toISOString(), to: arg.end.toISOString() });
    setSelectedMenuDate(formatDateKey(arg.start));
  }, []);

  const handleLinkAccount = async () => {
    if (!bootstrap) return;
    setLinkError(null);
    setLinking(true);
    try {
      const result = await acquireDelegatedToken(
        {
          msalClientId: bootstrap.msalClientId,
          msalTenantId: bootstrap.msalTenantId,
          msalAuthority: bootstrap.msalAuthority,
          delegatedScopes: bootstrap.delegatedScopes,
        },
        ["Calendars.ReadWrite", "User.Read", "offline_access"],
      );

      await linkAccount.mutateAsync({
        accessToken: result.accessToken,
        refreshToken: "",
        expiresAt: result.expiresOn?.toISOString() ?? new Date(Date.now() + 3600_000).toISOString(),
        scopes: result.scopes,
      });
    } catch (error) {
      setLinkError(formatMsalErrorForUser(error));
    } finally {
      setLinking(false);
    }
  };

  const openCreateModal = (start?: Date, end?: Date, allDay?: boolean) => {
    const startIso = (start ?? new Date()).toISOString();
    const endIso = (end ?? new Date((start ?? new Date()).getTime() + 60 * 60 * 1000)).toISOString();
    setModal({
      open: true,
      mode: "create",
      event: {
        graphId: "",
        calendarId: defaultCalendarId,
        title: "",
        startAt: startIso,
        endAt: endIso,
        isAllDay: Boolean(allDay),
        location: "",
        description: "",
        webLink: "",
        onlineMeetingUrl: "",
        canEdit: true,
      },
    });
  };

  const handleEventClick = (arg: EventClickArg) => {
    const source = arg.event.extendedProps.source as string | undefined;
    if (source === "birthday") {
      const href = arg.event.extendedProps.href as string | undefined;
      if (href) window.location.href = href;
      return;
    }

    const dto = outlookEvents.find((e) => e.graphId === arg.event.id);
    if (!dto) return;
    setModal({ open: true, mode: dto.canEdit ? "edit" : "view", event: dtoToModalEvent(dto) });
  };

  const handleDateSelect = (arg: DateSelectArg) => {
    if (!canLoadOutlook) return;
    openCreateModal(arg.start, arg.end, arg.allDay);
    arg.view.calendar.unselect();
  };

  const handleSave = async (payload: {
    calendarId: string;
    title: string;
    startAt: string;
    endAt: string;
    isAllDay: boolean;
    location: string;
    description: string;
  }) => {
    if (!modal.open) return;

    if (modal.mode === "create") {
      await createEvent.mutateAsync({
        calendarId: payload.calendarId,
        title: payload.title,
        startAt: payload.startAt,
        endAt: payload.endAt,
        isAllDay: payload.isAllDay,
        location: payload.location || null,
        description: payload.description || null,
      });
    } else if (modal.mode === "edit" && modal.event?.graphId) {
      await updateEvent.mutateAsync({
        eventId: modal.event.graphId,
        body: {
          title: payload.title,
          startAt: payload.startAt,
          endAt: payload.endAt,
          isAllDay: payload.isAllDay,
          location: payload.location || null,
          description: payload.description || null,
        },
      });
    }

    setModal({ open: false });
  };

  const handleDelete = async () => {
    if (!modal.open || modal.mode !== "edit" || !modal.event?.graphId) return;
    await deleteEvent.mutateAsync(modal.event.graphId);
    setModal({ open: false });
  };

  const toggleCalendar = (id: string) => {
    setSelectedCalendarIds((current) => {
      const base = current.length > 0 ? current : calendars.map((c) => c.id);
      return base.includes(id) ? base.filter((item) => item !== id) : [...base, id];
    });
  };

  const initialView = bootstrap?.defaultView ?? "dayGridMonth";
  const saving = createEvent.isPending || updateEvent.isPending || deleteEvent.isPending;

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Calendário</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Calendário</h1>
            <p className="page-header__desc">
              Agenda integrada ao Microsoft Outlook — reuniões, compromissos e aniversários corporativos.
            </p>
          </div>
          {canLoadOutlook ? (
            <button
              type="button"
              className="calendar-page__today-btn"
              onClick={() => calendarRef.current?.getApi().today()}
            >
              Hoje
            </button>
          ) : null}
        </div>
      </header>

      {!calendarEnabled ? (
        <div className="calendar-page__banner calendar-page__banner--info" role="status">
          <i className="fa-solid fa-circle-info" aria-hidden="true" />
          <div>
            <strong>Calendário Outlook desabilitado</strong>
            <p>Um administrador pode ativar em Config. Backend → Calendário Outlook.</p>
          </div>
        </div>
      ) : null}

      {calendarEnabled && needsConsent ? (
        <div className="calendar-page__banner calendar-page__banner--warn" role="status">
          <i className="fa-brands fa-microsoft" aria-hidden="true" />
          <div>
            <strong>Vincule sua conta Microsoft</strong>
            <p>Para ver e gerenciar sua agenda Outlook, conceda permissão de calendário.</p>
            {linkError ? <p className="calendar-page__banner-error">{linkError}</p> : null}
          </div>
          <button
            type="button"
            className="calendar-page__link-btn"
            onClick={() => void handleLinkAccount()}
            disabled={linking}
          >
            {linking ? "Conectando…" : "Vincular conta"}
          </button>
        </div>
      ) : null}

      <div className="calendar-page__layout calendar-page__layout--fc">
        <section className="calendar-page__main" aria-label="Agenda Outlook">
          {canLoadOutlook ? (
            <>
              <div className="calendar-page__calendar-filters" aria-label="Calendários visíveis">
                {calendars.map((calendar) => {
                  const checked =
                    selectedCalendarIds.length === 0 || selectedCalendarIds.includes(calendar.id);
                  return (
                    <label key={calendar.id} className="calendar-page__calendar-chip">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCalendar(calendar.id)}
                      />
                      <span
                        className="calendar-page__calendar-dot"
                        style={{ background: calendar.color ?? "#2563eb" }}
                      />
                      {calendar.name}
                    </label>
                  );
                })}
              </div>

              <div className="calendar-page__fc-wrap">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                  locale={ptBrLocale}
                  initialView={initialView}
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                  }}
                  height="auto"
                  selectable
                  selectMirror
                  editable={false}
                  events={fcEvents}
                  datesSet={handleDatesSet}
                  eventClick={handleEventClick}
                  select={handleDateSelect}
                  dateClick={(arg) => setSelectedMenuDate(formatDateKey(arg.date))}
                  eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
                  slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
                  buttonText={{
                    today: "Hoje",
                    month: "Mês",
                    week: "Semana",
                    day: "Dia",
                    list: "Lista",
                  }}
                />
                {eventsLoading ? (
                  <p className="calendar-page__loading" aria-live="polite">
                    Carregando eventos do Outlook…
                  </p>
                ) : null}
              </div>

              <div className="calendar-page__actions">
                <button type="button" className="calendar-page__create-btn" onClick={() => openCreateModal()}>
                  <i className="fa-solid fa-plus" aria-hidden="true" /> Novo evento
                </button>
              </div>
            </>
          ) : (
            <div className="calendar-page__placeholder">
              <i className="fa-regular fa-calendar" aria-hidden="true" />
              <p>Conecte sua conta Microsoft para visualizar a agenda Outlook.</p>
            </div>
          )}
        </section>

        {showMenu ? (
          <aside className="calendar-page__aside">
            <CafeteriaMenuPanel date={selectedMenuDate} menu={cafeteriaMenu ?? null} />
          </aside>
        ) : null}
      </div>

      <CalendarEventModal
        open={modal.open}
        mode={modal.open ? modal.mode : "view"}
        event={modal.open ? modal.event : null}
        defaultCalendarId={defaultCalendarId}
        calendars={calendars}
        saving={saving}
        onClose={() => setModal({ open: false })}
        onSave={(payload) => void handleSave(payload)}
        onDelete={modal.open && modal.mode === "edit" ? () => void handleDelete() : undefined}
      />
    </main>
  );
}
