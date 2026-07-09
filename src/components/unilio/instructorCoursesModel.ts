import type { UniLioAuthoringCourseSummary } from "../../api/hooks/useUniLioAuthoring";
import type { UniLioInstructorCourse } from "../../config/unilio/types";

export type UniLioInstructorMyCourseRow = {
  id: string;
  title: string;
  area: string;
  status: string;
  moduleCount: number | null;
  submittedAt?: string;
  publishedAt?: string;
  enrolledCount: number;
  completedCount: number;
  avgRating: number;
  isAuthored: boolean;
};

export type InstructorCourseSortKey =
  | "title"
  | "area"
  | "status"
  | "moduleCount"
  | "enrolledCount"
  | "completedCount"
  | "completionRate"
  | "avgRating"
  | "publishedAt"
  | "submittedAt";

export type InstructorCourseSort = {
  key: InstructorCourseSortKey;
  direction: "asc" | "desc";
};

export function mergeInstructorCourses(
  authoringCourses: UniLioAuthoringCourseSummary[],
  instructorCourses: UniLioInstructorCourse[],
): UniLioInstructorMyCourseRow[] {
  const metricsById = new Map(instructorCourses.map((course) => [course.courseId, course]));
  const authoredIds = new Set(authoringCourses.map((course) => course.id));

  const rows: UniLioInstructorMyCourseRow[] = authoringCourses.map((course) => {
    const metrics = metricsById.get(course.id);
    return {
      id: course.id,
      title: course.title,
      area: course.area,
      status: course.status,
      moduleCount: course.moduleCount,
      submittedAt: course.submittedAt,
      publishedAt: course.publishedAt ?? metrics?.publishedAt,
      enrolledCount: Math.max(course.enrolledCount, metrics?.enrolledCount ?? 0),
      completedCount: Math.max(course.completedCount, metrics?.completedCount ?? 0),
      avgRating: Math.max(course.avgRating, metrics?.avgRating ?? 0),
      isAuthored: true,
    };
  });

  for (const course of instructorCourses) {
    if (authoredIds.has(course.courseId)) continue;
    rows.push({
      id: course.courseId,
      title: course.title,
      area: course.area,
      status: course.status,
      moduleCount: null,
      publishedAt: course.publishedAt,
      enrolledCount: course.enrolledCount,
      completedCount: course.completedCount,
      avgRating: course.avgRating,
      isAuthored: false,
    });
  }

  return rows;
}

export function completionRate(row: UniLioInstructorMyCourseRow): number {
  if (row.enrolledCount <= 0) return 0;
  return Math.round((row.completedCount / row.enrolledCount) * 100);
}

function sortValue(row: UniLioInstructorMyCourseRow, key: InstructorCourseSortKey): string | number {
  switch (key) {
    case "title":
      return row.title.toLocaleLowerCase("pt-BR");
    case "area":
      return row.area.toLocaleLowerCase("pt-BR");
    case "status":
      return row.status;
    case "moduleCount":
      return row.moduleCount ?? -1;
    case "enrolledCount":
      return row.enrolledCount;
    case "completedCount":
      return row.completedCount;
    case "completionRate":
      return completionRate(row);
    case "avgRating":
      return row.avgRating;
    case "publishedAt":
      return row.publishedAt ? new Date(row.publishedAt).getTime() : 0;
    case "submittedAt":
      return row.submittedAt ? new Date(row.submittedAt).getTime() : 0;
    default:
      return 0;
  }
}

export function sortInstructorCourses(
  rows: UniLioInstructorMyCourseRow[],
  sort: InstructorCourseSort,
): UniLioInstructorMyCourseRow[] {
  const sorted = [...rows].sort((a, b) => {
    const left = sortValue(a, sort.key);
    const right = sortValue(b, sort.key);
    if (typeof left === "string" && typeof right === "string") {
      return left.localeCompare(right, "pt-BR");
    }
    return Number(left) - Number(right);
  });
  return sort.direction === "asc" ? sorted : sorted.reverse();
}

export function filterInstructorCourses(
  rows: UniLioInstructorMyCourseRow[],
  query: string,
  statusFilter: string,
): UniLioInstructorMyCourseRow[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");

  return rows.filter((row) => {
    if (statusFilter) {
      if (statusFilter === "published") {
        if (row.status !== "published" && row.status !== "active") return false;
      } else if (row.status !== statusFilter) {
        return false;
      }
    }
    if (!normalizedQuery) return true;
    return (
      row.title.toLocaleLowerCase("pt-BR").includes(normalizedQuery)
      || row.area.toLocaleLowerCase("pt-BR").includes(normalizedQuery)
    );
  });
}

export function summarizeInstructorCourses(rows: UniLioInstructorMyCourseRow[]) {
  const published = rows.filter((row) => row.status === "published" || row.status === "active").length;
  const pending = rows.filter((row) => row.status === "pending_approval").length;
  const enrolled = rows.reduce((sum, row) => sum + row.enrolledCount, 0);
  const completed = rows.reduce((sum, row) => sum + row.completedCount, 0);
  const avgCompletion = enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0;

  return {
    total: rows.length,
    published,
    pending,
    enrolled,
    completed,
    avgCompletion,
  };
}
