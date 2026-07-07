import { useMemo } from "react";
import { useMe } from "../../../api/hooks/useMe";
import { PULSE_RETRO_CATEGORIES } from "../../../config/pulse/constants";
import { buildRetroView, formatPulseDate, resolvePulsePersona } from "../../../utils/pulseView";
import { usePulseFilters } from "../PulseAccessGate";
import { PulseStatusBadge } from "../PulseShared";
import "../../../styles/pulse-dashboard.css";

export function PulseRetroPage() {
  const { filters } = usePulseFilters();
  const { data: me } = useMe();
  const persona = useMemo(() => resolvePulsePersona(me), [me]);
  const view = useMemo(() => buildRetroView(filters, persona), [filters, persona]);

  return (
    <main className="pulse-page">
      <div className="pulse-page__head">
        <h1 className="pulse-page__title">Retrospectiva</h1>
        <p className="pulse-page__desc">Lições aprendidas, votos da equipe e plano de ação.</p>
      </div>

      <div className="pulse-retro-grid">
        {PULSE_RETRO_CATEGORIES.map((cat) => {
          const notes = view.notes.filter((n) => n.category === cat.id);
          return (
            <article key={cat.id} className="pulse-panel pulse-retro-column">
              <h2 className="pulse-panel__title">
                <i className={`fa-solid ${cat.icon}`} aria-hidden="true" /> {cat.label}
              </h2>
              <ul className="pulse-retro-notes">
                {notes.map((n) => (
                  <li key={n.id} className="pulse-retro-note">
                    <p>{n.content}</p>
                    <footer>
                      <span>{n.authorName}</span>
                      <span className="pulse-retro-note__votes">
                        <i className="fa-solid fa-thumbs-up" aria-hidden="true" /> {n.votes}
                      </span>
                    </footer>
                  </li>
                ))}
                {notes.length === 0 ? <p className="pulse-panel__empty">Nenhuma nota.</p> : null}
              </ul>
            </article>
          );
        })}
      </div>

      <article className="pulse-panel">
        <h2 className="pulse-panel__title">Plano de ação</h2>
        <table className="audit-trail-page__table">
          <thead>
            <tr>
              <th>Ação</th>
              <th>Responsável</th>
              <th>Prazo</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {view.actions.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.assigneeName}</td>
                <td>{formatPulseDate(a.dueDate)}</td>
                <td>
                  <PulseStatusBadge status={a.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>

      <footer className="pulse-page__footer">Dados simulados — Pulse Ágil (mock)</footer>
    </main>
  );
}
