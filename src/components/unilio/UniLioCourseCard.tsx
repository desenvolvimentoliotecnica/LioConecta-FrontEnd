import { Link } from "react-router-dom";
import { formatUniLioDuration, formatUniLioRating } from "../../utils/unilioView";
import type { UniLioCourseSummary } from "../../config/unilio/types";
import {
  UniLioContentTypeBadge,
  UniLioDepartmentBadge,
  UniLioMandatoryBadge,
  UniLioParticipantsBadge,
  UniLioProgressBar,
  UniLioStatusBadge,
} from "./UniLioShared";

type Props = {
  course: UniLioCourseSummary;
  compact?: boolean;
  variant?: "card" | "list";
};

export function UniLioCourseCard({ course, compact = false, variant = "card" }: Props) {
  const progress = course.progressPct ?? 0;
  const isList = variant === "list";

  return (
    <article
      className={[
        "unilio-course-card",
        compact ? "unilio-course-card--compact" : "",
        isList ? "unilio-course-card--list" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {course.thumbnailUrl ? (
        <div className="unilio-course-card__thumb">
          <img src={course.thumbnailUrl} alt="" loading="lazy" />
        </div>
      ) : null}

      <div className="unilio-course-card__body">
        <div className="unilio-course-card__head">
          <UniLioContentTypeBadge type={course.contentType} />
          <UniLioDepartmentBadge department={course.department} />
          {course.isMandatory ? <UniLioMandatoryBadge /> : null}
          <UniLioParticipantsBadge count={course.enrolledCount ?? 0} />
        </div>

        <h3 className="unilio-course-card__title">
          <Link to={`/unilio/curso/${course.id}`}>{course.title}</Link>
        </h3>

        {!compact && !isList ? <p className="unilio-course-card__desc">{course.description}</p> : null}

        <div className="unilio-course-card__meta">
          <span>
            <i className="fa-solid fa-clock" aria-hidden="true" /> {formatUniLioDuration(course.durationMinutes)}
          </span>
          <span>
            <i className="fa-solid fa-star" aria-hidden="true" /> {formatUniLioRating(course.rating)}
          </span>
          <span>{course.area}</span>
        </div>

        {course.enrollmentStatus ? (
          <div className="unilio-course-card__footer">
            <UniLioStatusBadge status={course.enrollmentStatus} />
            {progress > 0 ? <UniLioProgressBar value={progress} /> : null}
          </div>
        ) : null}
      </div>

      {isList ? (
        <Link to={`/unilio/curso/${course.id}`} className="unilio-course-card__access-btn">
          Acessar
        </Link>
      ) : null}
    </article>
  );
}
