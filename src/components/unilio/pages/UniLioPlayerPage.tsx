import { Link, useParams } from "react-router-dom";
import { useUniLioCourse } from "../../../api/hooks/useUniLioCourse";
import { UniLioPlayer } from "../UniLioPlayer";
import "../../../styles/unilio-player.css";

export function UniLioPlayerPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course, isLoading, isFallback } = useUniLioCourse(courseId);

  if (isLoading) {
    return (
      <main className="unilio-page unilio-page--player-immersive">
        <p className="unilio-page__loading">Carregando curso…</p>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="unilio-page unilio-page--player-immersive">
        <div className="unilio-player-focus__empty">
          <p className="unilio-panel__empty">Curso não encontrado.</p>
          <Link to="/unilio/catalogo" className="unilio-player-focus__back">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            Voltar ao catálogo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="unilio-page unilio-page--player-immersive">
      <UniLioPlayer course={course} isFallback={isFallback} />
    </main>
  );
}
