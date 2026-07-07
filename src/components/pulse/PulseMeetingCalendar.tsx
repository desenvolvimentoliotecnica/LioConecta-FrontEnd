import { PULSE_MEETING_TYPE_LABELS } from "../../config/pulse/constants";
import type { EnrichedMeeting } from "../../config/pulse/types";
import { formatPulseDateTime } from "../../utils/pulseView";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

type PulseMeetingCalendarProps = {
  meetings: EnrichedMeeting[];
};

export function PulseMeetingCalendar({ meetings }: PulseMeetingCalendarProps) {
  const weekStart = getWeekStart(new Date());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const meetingsByDay = days.map((day) => {
    const dayStr = day.toISOString().slice(0, 10);
    return meetings.filter((m) => m.scheduledAt.startsWith(dayStr));
  });

  return (
    <div className="pulse-calendar" aria-label="Calendário semanal de rituais">
      <div className="pulse-calendar__grid">
        {days.map((day, idx) => (
          <div key={day.toISOString()} className="pulse-calendar__day">
            <header className="pulse-calendar__day-head">
              <span className="pulse-calendar__weekday">{WEEKDAYS[day.getDay()]}</span>
              <span className="pulse-calendar__date">{day.getDate()}</span>
            </header>
            <ul className="pulse-calendar__events">
              {meetingsByDay[idx].map((m) => (
                <li key={m.id} className={`pulse-calendar__event pulse-calendar__event--${m.type}`}>
                  <span className="pulse-calendar__event-time">
                    {new Date(m.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="pulse-calendar__event-type">{PULSE_MEETING_TYPE_LABELS[m.type]}</span>
                  <span className="pulse-calendar__event-title">{m.title}</span>
                  <span className="pulse-calendar__event-team">{m.teamName}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <aside className="pulse-calendar__upcoming">
        <h3>Próximas reuniões</h3>
        <ul>
          {meetings.slice(0, 6).map((m) => (
            <li key={m.id}>
              <strong>{m.title}</strong>
              <span>{formatPulseDateTime(m.scheduledAt)} · {m.durationMinutes} min</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
