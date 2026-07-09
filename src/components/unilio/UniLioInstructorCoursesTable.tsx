import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  completionRate,
  filterInstructorCourses,
  sortInstructorCourses,
  summarizeInstructorCourses,
  type InstructorCourseSort,
  type InstructorCourseSortKey,
  type UniLioInstructorMyCourseRow,
} from "./instructorCoursesModel";
import { UniLioCourseAreaChip } from "./UniLioCourseAreaChip";
import { UniLioCourseStatusChip } from "./UniLioCourseStatusChip";
import { formatUniLioDate, formatUniLioRating } from "../../utils/unilioView";
import "../../styles/unilio-instrutor-page.css";

type Props = {
  courses: UniLioInstructorMyCourseRow[];
  withdrawBusy?: boolean;
  onEditPending: (courseId: string) => void;
  onWithdraw: (courseId: string) => void;
};

const STATUS_FILTERS = [
  { id: "", label: "Todos" },
  { id: "draft", label: "Rascunho" },
  { id: "pending_approval", label: "Em aprovação" },
  { id: "published", label: "Publicado" },
  { id: "rejected", label: "Rejeitado" },
] as const;

const SORTABLE_COLUMNS: Array<{ key: InstructorCourseSortKey; label: string; colClass: string }> = [
  { key: "title", label: "Curso", colClass: "col-course" },
  { key: "area", label: "Área", colClass: "col-area" },
  { key: "moduleCount", label: "Mód.", colClass: "col-modules" },
  { key: "status", label: "Status", colClass: "col-status" },
  { key: "enrolledCount", label: "Alunos", colClass: "col-students" },
  { key: "completionRate", label: "Concl.", colClass: "col-completion" },
  { key: "avgRating", label: "Nota", colClass: "col-rating" },
  { key: "publishedAt", label: "Publicado", colClass: "col-date" },
];

function SortButton({
  label,
  active,
  direction,
  onClick,
  centered = true,
}: {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
  centered?: boolean;
}) {
  return (
    <button
      type="button"
      className={`unilio-instrutor-table__sort${active ? " is-active" : ""}${centered ? " is-center" : ""}`}
      onClick={onClick}
    >
      <span>{label}</span>
      <i
        className={`fa-solid ${active ? (direction === "asc" ? "fa-arrow-up" : "fa-arrow-down") : "fa-sort"}`}
        aria-hidden="true"
      />
    </button>
  );
}

function TableIconAction({
  to,
  label,
  icon,
  onClick,
  disabled,
  tone = "default",
}: {
  to?: string;
  label: string;
  icon: string;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "default" | "muted";
}) {
  const className = `unilio-instrutor-table__icon-btn${tone === "muted" ? " unilio-instrutor-table__icon-btn--muted" : ""}`;

  if (to) {
    return (
      <Link to={to} className={className} title={label} aria-label={label}>
        <i className={`fa-solid ${icon}`} aria-hidden="true" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      <i className={`fa-solid ${icon}`} aria-hidden="true" />
    </button>
  );
}

function CourseActions({
  course,
  withdrawBusy,
  onEditPending,
  onWithdraw,
}: {
  course: UniLioInstructorMyCourseRow;
  withdrawBusy?: boolean;
  onEditPending: (courseId: string) => void;
  onWithdraw: (courseId: string) => void;
}) {
  if (course.status === "draft" || course.status === "rejected") {
    return (
      <div className="unilio-instrutor-table__actions">
        <TableIconAction
          to={`/unilio/instrutor/curso/${course.id}/editar`}
          label="Editar curso"
          icon="fa-pen"
        />
      </div>
    );
  }

  if (course.status === "pending_approval") {
    return (
      <div className="unilio-instrutor-table__actions">
        <TableIconAction
          label="Editar curso"
          icon="fa-pen"
          disabled={withdrawBusy}
          onClick={() => onEditPending(course.id)}
        />
        <TableIconAction
          label="Reverter para rascunho"
          icon="fa-rotate-left"
          tone="muted"
          disabled={withdrawBusy}
          onClick={() => onWithdraw(course.id)}
        />
      </div>
    );
  }

  if (course.status === "published" || course.status === "active") {
    return (
      <div className="unilio-instrutor-table__actions">
        <TableIconAction
          to={`/unilio/curso/${course.id}`}
          label="Ver no catálogo"
          icon="fa-arrow-up-right-from-square"
        />
      </div>
    );
  }

  return <span className="unilio-instrutor-table__muted">—</span>;
}

export function UniLioInstructorCoursesTable({
  courses,
  withdrawBusy,
  onEditPending,
  onWithdraw,
}: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState<InstructorCourseSort>({ key: "title", direction: "asc" });

  const summary = useMemo(() => summarizeInstructorCourses(courses), [courses]);

  const visibleCourses = useMemo(() => {
    const filtered = filterInstructorCourses(courses, query, statusFilter);
    return sortInstructorCourses(filtered, sort);
  }, [courses, query, sort, statusFilter]);

  function toggleSort(key: InstructorCourseSortKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: key === "title" || key === "area" ? "asc" : "desc" },
    );
  }

  if (courses.length === 0) {
    return (
      <section className="unilio-instrutor-courses">
        <div className="unilio-instrutor-courses__empty">
          <i className="fa-solid fa-book-open" aria-hidden="true" />
          <p>Você ainda não tem cursos. Crie o primeiro para começar a publicar conteúdo.</p>
          <Link to="/unilio/instrutor/curso/novo/editar" className="unilio-player__complete-btn">
            Novo curso
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="unilio-instrutor-courses">
      <div className="unilio-instrutor-courses__summary">
        <article className="unilio-instrutor-courses__stat">
          <span className="unilio-instrutor-courses__stat-value">{summary.total}</span>
          <span className="unilio-instrutor-courses__stat-label">Cursos</span>
        </article>
        <article className="unilio-instrutor-courses__stat">
          <span className="unilio-instrutor-courses__stat-value">{summary.published}</span>
          <span className="unilio-instrutor-courses__stat-label">Publicados</span>
        </article>
        <article className="unilio-instrutor-courses__stat">
          <span className="unilio-instrutor-courses__stat-value">{summary.enrolled}</span>
          <span className="unilio-instrutor-courses__stat-label">Alunos matriculados</span>
        </article>
        <article className="unilio-instrutor-courses__stat">
          <span className="unilio-instrutor-courses__stat-value">{summary.avgCompletion}%</span>
          <span className="unilio-instrutor-courses__stat-label">Taxa média de conclusão</span>
        </article>
      </div>

      <div className="unilio-instrutor-courses__toolbar">
        <label className="unilio-instrutor-courses__search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input
            type="search"
            value={query}
            placeholder="Buscar curso ou área…"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="unilio-instrutor-courses__filters" role="group" aria-label="Filtrar por status">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.id || "all"}
              type="button"
              className={`unilio-instrutor-courses__filter${statusFilter === filter.id ? " is-active" : ""}`}
              onClick={() => setStatusFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="unilio-instrutor-table-wrap">
        <table className="unilio-instrutor-table">
          <colgroup>
            {SORTABLE_COLUMNS.map((column) => (
              <col key={column.key} className={column.colClass} />
            ))}
            <col className="col-actions" />
          </colgroup>
          <thead>
            <tr>
              {SORTABLE_COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className={column.key === "title" ? "is-course" : "is-center"}
                  scope="col"
                >
                  <SortButton
                    label={column.label}
                    active={sort.key === column.key}
                    direction={sort.direction}
                    centered={column.key !== "title"}
                    onClick={() => toggleSort(column.key)}
                  />
                </th>
              ))}
              <th scope="col" className="col-actions is-center">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleCourses.length === 0 ? (
              <tr>
                <td colSpan={SORTABLE_COLUMNS.length + 1} className="unilio-instrutor-table__empty">
                  Nenhum curso encontrado com os filtros atuais.
                </td>
              </tr>
            ) : (
              visibleCourses.map((course) => {
                const rate = completionRate(course);
                return (
                  <tr key={course.id}>
                    <td className="unilio-instrutor-table__cell-course">
                      <span className="unilio-instrutor-table__course" title={course.title}>
                        {course.isAuthored ? (
                          <i
                            className="fa-solid fa-pen-nib unilio-instrutor-table__authored"
                            title="Autoria própria"
                            aria-label="Autoria própria"
                          />
                        ) : null}
                        <span className="unilio-instrutor-table__course-title">{course.title}</span>
                      </span>
                    </td>
                    <td className="unilio-instrutor-table__cell-area is-center">
                      <UniLioCourseAreaChip area={course.area} />
                    </td>
                    <td className="is-center is-numeric">{course.moduleCount ?? "—"}</td>
                    <td className="is-center">
                      <UniLioCourseStatusChip status={course.status} />
                    </td>
                    <td className="is-center is-numeric">{course.enrolledCount}</td>
                    <td className="is-center is-numeric">
                      {course.completedCount}
                      <span className="unilio-instrutor-table__sep">·</span>
                      {rate}%
                    </td>
                    <td className="is-center is-numeric">
                      {course.avgRating > 0 ? (
                        <span className="unilio-instrutor-table__rating" title={`Nota ${formatUniLioRating(course.avgRating)}`}>
                          <i className="fa-solid fa-star" aria-hidden="true" />
                          {formatUniLioRating(course.avgRating)}
                        </span>
                      ) : (
                        <span className="unilio-instrutor-table__muted">—</span>
                      )}
                    </td>
                    <td
                      className="is-center"
                      title={
                        course.publishedAt
                          ? formatUniLioDate(course.publishedAt)
                          : course.submittedAt && course.status === "pending_approval"
                            ? `Enviado em ${formatUniLioDate(course.submittedAt)}`
                            : undefined
                      }
                    >
                      {course.publishedAt ? (
                        formatUniLioDate(course.publishedAt)
                      ) : course.submittedAt && course.status === "pending_approval" ? (
                        formatUniLioDate(course.submittedAt)
                      ) : (
                        <span className="unilio-instrutor-table__muted">—</span>
                      )}
                    </td>
                    <td className="unilio-instrutor-table__cell-actions is-center">
                      <CourseActions
                        course={course}
                        withdrawBusy={withdrawBusy}
                        onEditPending={onEditPending}
                        onWithdraw={onWithdraw}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="unilio-instrutor-courses__footer">
        Exibindo {visibleCourses.length} de {courses.length} curso{courses.length === 1 ? "" : "s"}
        {summary.pending > 0 ? ` · ${summary.pending} aguardando aprovação` : ""}
      </p>
    </section>
  );
}
