import { useMemo } from "react";
import { useMe } from "../../../api/hooks/useMe";
import { PULSE_MEETING_TYPE_LABELS } from "../../../config/pulse/constants";
import { buildMeetingsView, formatPulseDateTime, resolvePulsePersona } from "../../../utils/pulseView";
import { usePulseFilters } from "../PulseAccessGate";
import { PulseAgendaBuilder } from "../PulseAgendaBuilder";
import { PulseMeetingCalendar } from "../PulseMeetingCalendar";
import "../../../styles/pulse-dashboard.css";

export function PulseMeetingsPage() {
  const { filters } = usePulseFilters();
  const { data: me } = useMe();
  const persona = useMemo(() => resolvePulsePersona(me), [me]);
  const meetings = useMemo(() => buildMeetingsView(filters, persona), [filters, persona]);

  return (
    <main className="pulse-page">
      <div className="pulse-page__head">
        <h1 className="pulse-page__title">Reuniões</h1>
        <p className="pulse-page__desc">Calendário de rituais ágeis e pautas com decisões.</p>
      </div>

      <PulseMeetingCalendar meetings={meetings} />

      <h2 className="pulse-page__subtitle">Pautas detalhadas</h2>
      {meetings
        .filter((m) => m.agenda.length > 0)
        .map((m) => (
          <div key={m.id} className="pulse-meetings-detail">
            <p className="pulse-meetings-detail__meta">
              {PULSE_MEETING_TYPE_LABELS[m.type]} · {formatPulseDateTime(m.scheduledAt)} · {m.teamName}
            </p>
            <PulseAgendaBuilder meeting={m} />
          </div>
        ))}

      <footer className="pulse-page__footer">Dados simulados — Pulse Ágil (mock)</footer>
    </main>
  );
}
