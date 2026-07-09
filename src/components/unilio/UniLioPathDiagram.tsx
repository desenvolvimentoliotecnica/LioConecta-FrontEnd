import { Link } from "react-router-dom";
import type { UniLioPathSummary } from "../../config/unilio/types";
import { UniLioProgressBar } from "./UniLioShared";

type Props = {
  paths: UniLioPathSummary[];
  activePathId?: string;
};

export function UniLioPathDiagram({ paths, activePathId }: Props) {
  if (paths.length === 0) {
    return <p className="unilio-panel__empty">Nenhuma trilha disponível.</p>;
  }

  return (
    <div className="unilio-path-diagram" aria-label="Trilhas de aprendizagem">
      {paths.map((path, idx) => {
        const isActive = activePathId === path.id;
        return (
          <div key={path.id} className="unilio-path-diagram__item">
            <Link
              to={`/unilio/trilhas?path=${path.id}`}
              className={`unilio-path-diagram__node${isActive ? " is-active" : ""}`}
            >
              <i className="fa-solid fa-route" aria-hidden="true" />
              <span className="unilio-path-diagram__title">{path.title}</span>
              <span className="unilio-path-diagram__meta">
                {path.completedCourses}/{path.courseCount} cursos
              </span>
              <UniLioProgressBar value={path.progressPct} />
            </Link>
            {idx < paths.length - 1 ? (
              <i className="fa-solid fa-arrow-right unilio-path-diagram__arrow" aria-hidden="true" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
