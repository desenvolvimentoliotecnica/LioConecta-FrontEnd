import { useMemo } from "react";
import { buildLoopTeamsView } from "../../../utils/loopView";
import { useLoopFilters } from "../LoopAccessGate";
import { LoopCapacityBars } from "../LoopProjectList";
import "../../../styles/loop-dashboard.css";

export function LoopTeamsPage() {
  const { filters } = useLoopFilters();
  const teams = useMemo(() => buildLoopTeamsView(filters), [filters]);

  return (
    <main className="loop-page">
      <div className="loop-page__head">
        <h1 className="loop-page__title">Equipes</h1>
        <p className="loop-page__desc">Capacidade, ocupação e carga de trabalho por squad.</p>
      </div>

      <LoopCapacityBars teams={teams} />

      <div className="loop-teams-grid">
        {teams.map((t) => (
          <article key={t.id} className="loop-team-card">
            <h2>{t.name}</h2>
            <p>{t.description}</p>
            <dl className="loop-team-card__stats">
              <div>
                <dt>Gestor</dt>
                <dd>{t.managerName}</dd>
              </div>
              <div>
                <dt>Membros</dt>
                <dd>{t.memberCount}</dd>
              </div>
              <div>
                <dt>Projetos</dt>
                <dd>{t.projectCount}</dd>
              </div>
              <div>
                <dt>Atividades abertas</dt>
                <dd>{t.openActivities}</dd>
              </div>
              <div>
                <dt>Horas alocadas</dt>
                <dd>
                  {t.allocatedHours}h / {t.availableHours}h
                </dd>
              </div>
              <div>
                <dt>Ocupação</dt>
                <dd>
                  <span className={`loop-capacity__bar loop-capacity__bar--${t.occupancyLevel}`} style={{ display: "inline-block", width: "4rem", height: "0.5rem" }} />
                  {" "}{t.occupancyPercent}%
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <footer className="loop-page__footer">Dados simulados — Loop de Projetos (mock)</footer>
    </main>
  );
}
