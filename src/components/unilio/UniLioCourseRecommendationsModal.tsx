import { Link, useNavigate } from "react-router-dom";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import { formatUniLioDuration } from "../../utils/unilioView";
import type { UniLioRecommendation } from "../../config/unilio/types";
import { UniLioContentTypeBadge } from "./UniLioShared";
import "../../styles/unilio-course-recommendations-modal.css";

type Props = {
  open: boolean;
  completedCourseTitle: string;
  items: UniLioRecommendation[];
  isLoading?: boolean;
  onGoToCatalog: () => void;
};

export function UniLioCourseRecommendationsModal({
  open,
  completedCourseTitle,
  items,
  isLoading = false,
  onGoToCatalog,
}: Props) {
  const navigate = useNavigate();

  const goToCatalog = () => {
    onGoToCatalog();
    navigate("/unilio/catalogo");
  };

  return (
    <ContrachequeModal
      open={open}
      title="Continue aprendendo"
      compact
      stacked
      closeOnEscape={false}
      showCloseButton={false}
      onClose={goToCatalog}
      footer={
        <div className="unilio-course-recs__footer">
          <Link to="/unilio/catalogo" className="pay-modal__btn pay-modal__btn--ghost" onClick={goToCatalog}>
            Voltar ao Catálogo
          </Link>
        </div>
      }
    >
      <div className="unilio-course-recs">
        <p className="unilio-course-recs__lead">
          Com base em <strong>{completedCourseTitle}</strong>, separamos cursos que você ainda não concluiu:
        </p>

        {isLoading ? (
          <p className="unilio-course-recs__loading">Carregando recomendações…</p>
        ) : items.length === 0 ? (
          <p className="unilio-course-recs__empty">
            Não encontramos outros cursos relacionados no momento. Explore o catálogo para descobrir novidades.
          </p>
        ) : (
          <ul className="unilio-course-recs__list">
            {items.map((rec) => (
              <li key={rec.courseId}>
                <Link to={`/unilio/curso/${rec.courseId}`} className="unilio-course-recs__card">
                  {rec.thumbnailUrl ? (
                    <>
                      <div className="unilio-course-recs__card-watermark" aria-hidden="true">
                        <img src={rec.thumbnailUrl} alt="" loading="lazy" />
                      </div>
                      <div className="unilio-course-recs__card-scrim" aria-hidden="true" />
                    </>
                  ) : null}
                  <div className="unilio-course-recs__card-content">
                    <strong className="unilio-course-recs__card-title">{rec.title}</strong>
                    <p>{rec.reason}</p>
                    <div className="unilio-course-recs__card-meta">
                      <UniLioContentTypeBadge type={rec.contentType} />
                      <span>{rec.area}</span>
                      <span>{formatUniLioDuration(rec.durationMinutes)}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ContrachequeModal>
  );
}
