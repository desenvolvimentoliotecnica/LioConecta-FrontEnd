import { useState } from "react";
import type { EnrichedDailyEntry } from "../../config/pulse/types";
import { formatPulseDate } from "../../utils/pulseView";
import { PulseStandupCard } from "./PulseShared";
import "../../styles/pulse-dailys.css";

type PulseDailyModesProps = {
  entries: EnrichedDailyEntry[];
};

type Mode = "cards" | "async" | "meeting";

export function PulseDailyModes({ entries }: PulseDailyModesProps) {
  const [mode, setMode] = useState<Mode>("cards");
  const latestDate = entries[0]?.date;
  const todayEntries = entries.filter((e) => e.date === latestDate);

  return (
    <div className="pulse-dailys">
      <div className="pulse-dailys__tabs" role="tablist" aria-label="Modo de visualização">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "cards"}
          className={`pulse-dailys__tab${mode === "cards" ? " is-active" : ""}`}
          onClick={() => setMode("cards")}
        >
          <i className="fa-solid fa-id-card" aria-hidden="true" /> Cards
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "async"}
          className={`pulse-dailys__tab${mode === "async" ? " is-active" : ""}`}
          onClick={() => setMode("async")}
        >
          <i className="fa-solid fa-message" aria-hidden="true" /> Assíncrono
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "meeting"}
          className={`pulse-dailys__tab${mode === "meeting" ? " is-active" : ""}`}
          onClick={() => setMode("meeting")}
        >
          <i className="fa-solid fa-video" aria-hidden="true" /> Reunião
        </button>
      </div>

      {mode === "cards" ? (
        <div className="pulse-dailys__grid" role="tabpanel">
          {todayEntries.map((entry) => (
            <PulseStandupCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : null}

      {mode === "async" ? (
        <div className="pulse-dailys__async" role="tabpanel">
          <table className="audit-trail-page__table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Membro</th>
                <th>Ontem</th>
                <th>Hoje</th>
                <th>Humor</th>
              </tr>
            </thead>
            <tbody>
              {entries.slice(0, 15).map((e) => (
                <tr key={e.id}>
                  <td>{formatPulseDate(e.date)}</td>
                  <td>{e.memberName}</td>
                  <td>{e.yesterday}</td>
                  <td>{e.today}</td>
                  <td>{e.moodLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {mode === "meeting" ? (
        <div className="pulse-dailys__meeting" role="tabpanel">
          <div className="pulse-dailys__meeting-info">
            <i className="fa-solid fa-video pulse-dailys__meeting-icon" aria-hidden="true" />
            <div>
              <h3>Daily ao vivo — {latestDate ? formatPulseDate(latestDate) : "hoje"}</h3>
              <p>Modo reunião: acompanhe as atualizações em sequência, como em uma daily síncrona.</p>
            </div>
          </div>
          <ol className="pulse-dailys__meeting-list">
            {todayEntries.map((entry, idx) => (
              <li key={entry.id}>
                <span className="pulse-dailys__meeting-order">{idx + 1}</span>
                <PulseStandupCard entry={entry} />
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
