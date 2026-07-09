import type {
  UniLioAssessmentsDto,
  UniLioCatalogPageDto,
  UniLioCertificatesDto,
  UniLioCommunityPageDto,
  UniLioComplianceDto,
  UniLioCourseDetailDto,
  UniLioDashboardDto,
  UniLioEventsDto,
  UniLioInstructorCoursesDto,
  UniLioManagerTeamDto,
  UniLioMetaDto,
  UniLioPathsDto,
  UniLioPathDetailDto,
  UniLioRecommendationsDto,
  UniLioReportsDto,
  UniLioSkillsDto,
} from "../types";
import type {
  UniLioAssessmentsView,
  UniLioCatalogView,
  UniLioCertificatesView,
  UniLioCommunityView,
  UniLioComplianceView,
  UniLioCourseDetail,
  UniLioDashboardView,
  UniLioEventsView,
  UniLioInstructorCoursesView,
  UniLioKpi,
  UniLioManagerTeamView,
  UniLioMetaView,
  UniLioPathsView,
  UniLioPathDetail,
  UniLioPersona,
  UniLioRecommendationsView,
  UniLioReportsView,
  UniLioSkillsView,
} from "../../config/unilio/types";

function mapPersona(raw: string): UniLioPersona {
  if (raw === "admin" || raw === "manager" || raw === "instructor" || raw === "learner") {
    return raw;
  }
  return "learner";
}

function mapTrend(raw: string): "up" | "down" | "neutral" {
  if (raw === "up" || raw === "down" || raw === "neutral") return raw;
  return "neutral";
}

function mapKpis(kpis: UniLioDashboardDto["kpis"]): UniLioKpi[] {
  return kpis.map((kpi) => ({
    ...kpi,
    trend: mapTrend(kpi.trend),
    mod: kpi.id === "mandatory" ? "amber" : kpi.id === "completed" ? "green" : "emerald",
    href:
      kpi.id === "mandatory"
        ? "/unilio/compliance"
        : kpi.id === "enrolled"
          ? "/unilio/catalogo"
          : undefined,
  }));
}

function mapCourse(course: UniLioCourseDetailDto): UniLioCourseDetail {
  return {
    ...course,
    id: String(course.id),
    modules: course.modules.map((m) => ({ ...m, id: String(m.id) })),
  };
}

function mapCourseSummary(course: UniLioCourseDetailDto | UniLioDashboardDto["nextSteps"][number]) {
  return {
    ...course,
    id: String(course.id),
  };
}

export function mapUniLioMetaFromApi(raw: UniLioMetaDto): UniLioMetaView {
  return {
    persona: mapPersona(raw.persona),
    areas: [...raw.areas],
    departments: [...raw.departments],
    contentTypes: [...raw.contentTypes],
    skills: [...raw.skills],
  };
}

export function mapUniLioDashboardFromApi(raw: UniLioDashboardDto): UniLioDashboardView {
  return {
    kpis: mapKpis(raw.kpis),
    activePath: raw.activePath
      ? { ...raw.activePath, id: String(raw.activePath.id) }
      : null,
    alerts: raw.alerts.map((a) => ({ ...a })),
    nextSteps: raw.nextSteps.map(mapCourseSummary),
    topRecommendations: raw.topRecommendations.map((r) => ({
      ...r,
      courseId: String(r.courseId),
    })),
  };
}

export function mapUniLioCatalogFromApi(raw: UniLioCatalogPageDto): UniLioCatalogView {
  return {
    ...raw,
    items: raw.items.map(mapCourseSummary),
  };
}

export function mapUniLioCourseFromApi(raw: UniLioCourseDetailDto): UniLioCourseDetail {
  return mapCourse(raw);
}

export function mapUniLioPathsFromApi(raw: UniLioPathsDto): UniLioPathsView {
  return {
    items: raw.items.map((p) => ({ ...p, id: String(p.id) })),
  };
}

export function mapUniLioPathDetailFromApi(raw: UniLioPathDetailDto): UniLioPathDetail {
  return {
    ...raw,
    id: String(raw.id),
    courses: raw.courses.map(mapCourseSummary),
  };
}

export function mapUniLioAssessmentsFromApi(raw: UniLioAssessmentsDto): UniLioAssessmentsView {
  const mapItem = (item: UniLioAssessmentsDto["pending"][number]) => ({
    ...item,
    id: String(item.id),
    courseId: String(item.courseId),
    lastAttemptedAt: item.lastAttemptedAt ?? null,
  });
  return {
    pending: raw.pending.map(mapItem),
    history: raw.history.map(mapItem),
  };
}

export function mapUniLioCertificatesFromApi(raw: UniLioCertificatesDto): UniLioCertificatesView {
  return {
    items: raw.items.map((c) => ({
      ...c,
      id: String(c.id),
      courseId: String(c.courseId),
    })),
  };
}

export function mapUniLioComplianceFromApi(raw: UniLioComplianceDto): UniLioComplianceView {
  return {
    ...raw,
    items: raw.items.map((i) => ({
      ...i,
      courseId: String(i.courseId),
      dueDate: i.dueDate ?? null,
    })),
  };
}

export function mapUniLioCommunityFromApi(raw: UniLioCommunityPageDto): UniLioCommunityView {
  return {
    ...raw,
    items: raw.items.map((p) => ({
      ...p,
      id: String(p.id),
    })),
  };
}

export function mapUniLioRecommendationsFromApi(raw: UniLioRecommendationsDto): UniLioRecommendationsView {
  return {
    items: raw.items.map((r) => ({ ...r, courseId: String(r.courseId) })),
  };
}

export function mapUniLioEventsFromApi(raw: UniLioEventsDto): UniLioEventsView {
  return {
    items: raw.items.map((e) => ({ ...e, id: String(e.id) })),
  };
}

export function mapUniLioSkillsFromApi(raw: UniLioSkillsDto): UniLioSkillsView {
  return {
    items: raw.items.map((s) => ({ ...s, skillId: String(s.skillId) })),
  };
}

export function mapUniLioManagerTeamFromApi(raw: UniLioManagerTeamDto): UniLioManagerTeamView {
  return {
    ...raw,
    members: raw.members.map((m) => ({ ...m, personId: String(m.personId) })),
  };
}

export function mapUniLioInstructorCoursesFromApi(raw: UniLioInstructorCoursesDto): UniLioInstructorCoursesView {
  return {
    items: raw.items.map((c) => ({ ...c, courseId: String(c.courseId) })),
  };
}

export function mapUniLioReportsFromApi(raw: UniLioReportsDto): UniLioReportsView {
  return {
    metrics: raw.metrics.map((m) => ({ ...m })),
    topCourses: raw.topCourses.map(mapCourseSummary),
    complianceGaps: raw.complianceGaps.map((g) => ({
      ...g,
      courseId: String(g.courseId),
      dueDate: g.dueDate ?? null,
    })),
  };
}
