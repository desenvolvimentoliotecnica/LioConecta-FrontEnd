import { useMemo } from "react";
import { useMe } from "../../../api/hooks/useMe";
import { buildImpedimentsView, formatPulseDate, resolvePulsePersona } from "../../../utils/pulseView";
import { usePulseFilters } from "../PulseAccessGate";
import { PulseSeverityBadge, PulseStatusBadge } from "../PulseShared";
import "../../../styles/pulse-dashboard.css";

export function PulseImpedimentsPage() {
  const { filters } = usePulseFilters();
  const { data: me } = useMe();
  const persona = useMemo(() => resolvePulsePersona(me), [me]);
  const impediments = useMemo(() => buildImpedimentsView(filters, persona), [filters, persona]);

  return (
    <main className="pulse-page">
      <div className="pulse-page__head">
        <h1 className="pulse-page__title">Impedimentos</h1>
        <p className="pulse-page__desc">Bloqueios reportados pelo squad e acompanhamento de resolução.</p>
      </div>

      <article className="pulse-panel">
        <div className="pulse-table-wrap">
          <table className="audit-trail-page__table">
            <thead>
              <tr>
                <th>Impedimento</th>
                <th>Squad</th>
                <th>Severidade</th>
                <th>Responsável</th>
                <th>Reportado por</th>
                <th>Data</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {impediments.map((i) => (
                <tr key={i.id}>
                  <td>
                    <strong>{i.title}</strong>
                    <p className="pulse-table__desc">{i.description}</p>
                  </td>
                  <td>{i.teamName}</td>
                  <td>
                    <PulseSeverityBadge severity={i.severity} />
                  </td>
                  <td>{i.ownerName}</td>
                  <td>{i.reporterName}</td>
                  <td>{formatPulseDate(i.reportedAt)}</td>
                  <td>
                    <PulseStatusBadge status={i.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {impediments.length === 0 ? (
          <p className="pulse-panel__empty">Nenhum impedimento para os filtros selecionados.</p>
        ) : null}
      </article>

      <footer className="pulse-page__footer">Dados simulados — Pulse Ágil (mock)</footer>
    </main>
  );
}
