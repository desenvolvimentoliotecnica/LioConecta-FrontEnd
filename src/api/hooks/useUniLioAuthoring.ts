import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import { FEED_QUERY_KEY } from "./useFeed";

export type UniLioAuthoringCourseSummary = {
  id: string;
  title: string;
  area: string;
  status: string;
  moduleCount: number;
  submittedAt?: string;
  publishedAt?: string;
};

export type UniLioAuthoringModule = {
  id: string;
  sortOrder: number;
  title: string;
  contentType: string;
  contentUrl?: string | null;
  durationMinutes: number;
  articleHtml?: string | null;
  quizJson?: string | null;
  quizPassingScore?: number | null;
  isCompleted: boolean;
};

export type UniLioAuthoringCourse = {
  id: string;
  seedKey: string;
  title: string;
  description: string;
  contentType: string;
  durationMinutes: number;
  isMandatory: boolean;
  area: string;
  department: string;
  instructorName: string;
  instructorPersonId?: string | null;
  thumbnailUrl?: string | null;
  externalUrl?: string | null;
  provider?: string | null;
  status: string;
  visibilityJson?: string | null;
  tags: string[];
  publishedAt?: string | null;
  submittedAt?: string | null;
  rejectionReason?: string | null;
  modules: UniLioAuthoringModule[];
};

export type UniLioUpsertCourseRequest = {
  title: string;
  description: string;
  contentType: string;
  durationMinutes: number;
  isMandatory: boolean;
  area: string;
  department: string;
  instructorName: string;
  thumbnailUrl?: string | null;
  externalUrl?: string | null;
  provider?: string | null;
  visibilityJson?: string | null;
  tags?: string[];
};

export type UniLioUpsertModuleRequest = {
  sortOrder: number;
  title: string;
  contentType: string;
  contentUrl?: string | null;
  durationMinutes: number;
  articleHtml?: string | null;
  quizJson?: string | null;
};

export type UniLioApprovalReview = {
  id: string;
  title: string;
  description: string;
  area: string;
  durationMinutes: number;
  isMandatory: boolean;
  thumbnailUrl?: string | null;
  instructorName: string;
  submittedByName?: string | null;
  submittedAt?: string | null;
  tags: string[];
  visibilityJson?: string | null;
  modules: Array<{
    sortOrder: number;
    title: string;
    contentType: string;
    durationMinutes: number;
  }>;
  assessment?: {
    title: string;
    passingScore: number;
    questionCount: number;
  } | null;
};

const AUTHORING_KEY = ["unilio", "authoring"] as const;

function mapCourse(raw: Record<string, unknown>): UniLioAuthoringCourse {
  return {
    id: String(raw.id),
    seedKey: String(raw.seedKey ?? ""),
    title: String(raw.title ?? ""),
    description: String(raw.description ?? ""),
    contentType: String(raw.contentType ?? "article"),
    durationMinutes: Number(raw.durationMinutes ?? 0),
    isMandatory: Boolean(raw.isMandatory),
    area: String(raw.area ?? ""),
    department: String(raw.department ?? ""),
    instructorName: String(raw.instructorName ?? ""),
    instructorPersonId: raw.instructorPersonId ? String(raw.instructorPersonId) : null,
    thumbnailUrl: raw.thumbnailUrl ? String(raw.thumbnailUrl) : null,
    externalUrl: raw.externalUrl ? String(raw.externalUrl) : null,
    provider: raw.provider ? String(raw.provider) : null,
    status: String(raw.status ?? "draft"),
    visibilityJson: raw.visibilityJson ? String(raw.visibilityJson) : null,
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    publishedAt: raw.publishedAt ? String(raw.publishedAt) : null,
    submittedAt: raw.submittedAt ? String(raw.submittedAt) : null,
    rejectionReason: raw.rejectionReason ? String(raw.rejectionReason) : null,
    modules: Array.isArray(raw.modules)
      ? raw.modules.map((m) => {
          const mod = m as Record<string, unknown>;
          return {
            id: String(mod.id),
            sortOrder: Number(mod.sortOrder ?? 0),
            title: String(mod.title ?? ""),
            contentType: String(mod.contentType ?? "article"),
            contentUrl: mod.contentUrl ? String(mod.contentUrl) : null,
            durationMinutes: Number(mod.durationMinutes ?? 0),
            articleHtml: mod.articleHtml ? String(mod.articleHtml) : null,
            quizJson: mod.quizJson ? String(mod.quizJson) : null,
            quizPassingScore: mod.quizPassingScore != null ? Number(mod.quizPassingScore) : null,
            isCompleted: Boolean(mod.isCompleted),
          };
        })
      : [],
  };
}

export function useUniLioAuthoringCourses() {
  return useQuery({
    queryKey: [...AUTHORING_KEY, "courses"],
    queryFn: async () => {
      const res = await api.get<{ items: Record<string, unknown>[] }>("/unilio/authoring/courses");
      return (res.items ?? []).map((item) => ({
        id: String(item.id),
        title: String(item.title ?? ""),
        area: String(item.area ?? ""),
        status: String(item.status ?? ""),
        moduleCount: Number(item.moduleCount ?? 0),
        submittedAt: item.submittedAt ? String(item.submittedAt) : undefined,
        publishedAt: item.publishedAt ? String(item.publishedAt) : undefined,
      })) satisfies UniLioAuthoringCourseSummary[];
    },
  });
}

export function usePendingUniLioCourses() {
  return useQuery({
    queryKey: [...AUTHORING_KEY, "pending"],
    queryFn: async () => {
      const res = await api.get<{ items: Record<string, unknown>[] }>("/unilio/authoring/courses/pending");
      return (res.items ?? []).map((item) => ({
        id: String(item.id),
        title: String(item.title ?? ""),
        area: String(item.area ?? ""),
        status: String(item.status ?? ""),
        moduleCount: Number(item.moduleCount ?? 0),
        submittedAt: item.submittedAt ? String(item.submittedAt) : undefined,
        publishedAt: item.publishedAt ? String(item.publishedAt) : undefined,
      })) satisfies UniLioAuthoringCourseSummary[];
    },
  });
}

export function useUniLioAuthoringCourse(courseId: string | undefined) {
  return useQuery({
    queryKey: [...AUTHORING_KEY, "course", courseId],
    queryFn: async () => mapCourse(await api.get<Record<string, unknown>>(`/unilio/authoring/courses/${courseId}`)),
    enabled: Boolean(courseId),
  });
}

export function useUniLioCourseApprovalReview(courseId: string | undefined) {
  return useQuery({
    queryKey: [...AUTHORING_KEY, "approval", courseId],
    queryFn: async () => {
      const raw = await api.get<Record<string, unknown>>(`/unilio/authoring/courses/${courseId}/approval-review`);
      return {
        id: String(raw.id),
        title: String(raw.title ?? ""),
        description: String(raw.description ?? ""),
        area: String(raw.area ?? ""),
        durationMinutes: Number(raw.durationMinutes ?? 0),
        isMandatory: Boolean(raw.isMandatory),
        thumbnailUrl: raw.thumbnailUrl ? String(raw.thumbnailUrl) : null,
        instructorName: String(raw.instructorName ?? ""),
        submittedByName: raw.submittedByName ? String(raw.submittedByName) : null,
        submittedAt: raw.submittedAt ? String(raw.submittedAt) : null,
        tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
        visibilityJson: raw.visibilityJson ? String(raw.visibilityJson) : null,
        modules: Array.isArray(raw.modules)
          ? raw.modules.map((m) => {
              const mod = m as Record<string, unknown>;
              return {
                sortOrder: Number(mod.sortOrder ?? 0),
                title: String(mod.title ?? ""),
                contentType: String(mod.contentType ?? ""),
                durationMinutes: Number(mod.durationMinutes ?? 0),
              };
            })
          : [],
        assessment: raw.assessment
          ? {
              title: String((raw.assessment as Record<string, unknown>).title ?? ""),
              passingScore: Number((raw.assessment as Record<string, unknown>).passingScore ?? 0),
              questionCount: Number((raw.assessment as Record<string, unknown>).questionCount ?? 0),
            }
          : null,
      } satisfies UniLioApprovalReview;
    },
    enabled: Boolean(courseId),
  });
}

export function useCreateUniLioCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UniLioUpsertCourseRequest) =>
      api.post<Record<string, unknown>>("/unilio/authoring/courses", body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: AUTHORING_KEY });
    },
  });
}

export function useUpdateUniLioCourse(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UniLioUpsertCourseRequest) =>
      api.put<Record<string, unknown>>(`/unilio/authoring/courses/${courseId}`, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: AUTHORING_KEY });
    },
  });
}

export function useSubmitUniLioCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => api.post(`/unilio/authoring/courses/${courseId}/submit`, {}),
    onSuccess: () => void qc.invalidateQueries({ queryKey: AUTHORING_KEY }),
  });
}

export function useApproveUniLioCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => api.post(`/unilio/authoring/courses/${courseId}/approve`, {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: AUTHORING_KEY });
      void qc.invalidateQueries({ queryKey: FEED_QUERY_KEY });
      void qc.invalidateQueries({ queryKey: ["unilio", "catalog"] });
    },
  });
}

export function useRejectUniLioCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, reason }: { courseId: string; reason?: string }) =>
      api.post(`/unilio/authoring/courses/${courseId}/reject`, { reason }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: AUTHORING_KEY }),
  });
}

export function useAddUniLioModule(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UniLioUpsertModuleRequest) =>
      api.post(`/unilio/authoring/courses/${courseId}/modules`, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...AUTHORING_KEY, "course", courseId] }),
  });
}
