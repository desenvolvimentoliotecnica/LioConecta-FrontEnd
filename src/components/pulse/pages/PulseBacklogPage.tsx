import { useMemo } from "react";
import { useMe } from "../../../api/hooks/useMe";
import { buildBacklogView, resolvePulsePersona } from "../../../utils/pulseView";
import { usePulseFilters } from "../PulseAccessGate";
import { PulseStatusBadge } from "../PulseShared";
import "../../../styles/pulse-dashboard.css";

export function PulseBacklogPage() {
  const { filters } = usePulseFilters();
  const { data: me } = useMe();
  const persona = useMemo(() => resolvePulsePersona(me), [me]);
  const stories = useMemo(() => buildBacklogView(filters, persona), [filters, persona]);

  return (
    <main className="pulse-page">
      <div className="pulse-page__head">
        <h1 className="pulse-page__title">Backlog</h1>
        <p className="pulse-page__desc">Histórias priorizadas aguardando inclusão no sprint.</p>
      </div>

      <article className="pulse-panel">
        <div className="pulse-table-wrap">
          <table className="audit-trail-page__table">
            <thead>
              <tr>
                <th>História</th>
                <th>Squad</th>
                <th>Responsável</th>
                <th>Pontos</th>
                <th>Prioridade</th>
                <th>Labels</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((s) => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.title}</strong>
                    <p className="pulse-table__desc">{s.description}</p>
                  </td>
                  <td>{s.teamName}</td>
                  <td>{s.assigneeName}</td>
                  <td>{s.points}</td>
                  <td>
                    <PulseStatusBadge status={s.priority} />
                  </td>
                  <td>{s.labels.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {stories.length === 0 ? <p className="pulse-panel__empty">Backlog vazio para os filtros selecionados.</p> : null}
      </article>

      <footer className="pulse-page__footer">Dados simulados — Pulse Ágil (mock)</footer>
    </main>
  );
}
