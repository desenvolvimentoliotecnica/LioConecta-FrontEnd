import type { EnrichedProject } from "../../utils/loopView";
import { LoopHealthBadge, LoopProgressBar } from "./LoopShared";

export function LoopProjectList({ projects }: { projects: EnrichedProject[] }) {
  return (
    <article className="loop-panel">
      <h2 className="loop-panel__title">Projetos</h2>
      <ul className="loop-project-list">
        {projects.map((p) => (
          <li key={p.id} className="loop-project-card">
            <div className="loop-project-card__head">
              <div className="loop-project-card__name">{p.name}</div>
              <span className="loop-project-card__code">{p.code}</span>
            </div>
            <div className="loop-project-card__meta">{p.teamName} · {p.ownerName}</div>
            <div className="loop-project-card__tags">
              <LoopHealthBadge health={p.computedHealth} />
              <span className={`loop-priority loop-priority--${p.priority}`}>{p.priority}</span>
            </div>
            <LoopProgressBar value={p.computedProgress} />
          </li>
        ))}
      </ul>
    </article>
  );
}

export function LoopCapacityBars({
  teams,
}: {
  teams: { id: string; name: string; occupancyPercent: number; occupancyLevel: string; memberCount: number; projectCount: number }[];
}) {
  return (
    <article className="loop-panel">
      <h2 className="loop-panel__title">Capacidade das equipes</h2>
      <ul className="loop-capacity">
        {teams.map((t) => (
          <li key={t.id} className="loop-capacity__row">
            <div className="loop-capacity__label">
              <span>{t.name}</span>
              <span className="loop-capacity__meta">
                {t.memberCount} pessoas · {t.projectCount} projetos
              </span>
            </div>
            <div className="loop-capacity__bar-wrap">
              <div
                className={`loop-capacity__bar loop-capacity__bar--${t.occupancyLevel}`}
                style={{ width: `${Math.min(120, t.occupancyPercent)}%` }}
              />
            </div>
            <span className="loop-capacity__pct">{t.occupancyPercent}%</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
