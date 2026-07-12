import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import { readApiNumber, readApiOptionalString } from "../readApiFields";
import { FEED_QUERY_KEY } from "./useFeed";

export type UniLioAuthoringCourseSummary = {
  id: string;
  title: string;
  area: string;
  status: string;
  moduleCount: number;
  submittedAt?: string;
  publishedAt?: string;
  enrolledCount: number;
  completedCount: number;
  avgRating: number;
};

export type UniLioAuthoringModuleAttachment = {
  id: string;
  fileName: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  sortOrder: number;
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
  attachments: UniLioAuthoringModuleAttachment[];
};

export type UniLioAuthoringAssessment = {
  id: string;
  title: string;
  passingScore: number;
  questionsJson: string;
};

export type UniLioScormPackageInfo = {
  id: string;
  moduleId: string;
  version: string;
  manifestTitle: string;
  launchUrl: string;
  scoCount: number;
  originalFileName: string;
  sizeBytes: number;
  uploadedAt: string;
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
  scormPassingScore?: number | null;
  scormPackage?: UniLioScormPackageInfo | null;
  modules: UniLioAuthoringModule[];
  assessment?: UniLioAuthoringAssessment | null;
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
  scormPassingScore?: number | null;
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

export type UniLioUpsertAssessmentRequest = {
  title: string;
  passingScore: number;
  questionsJson: string;
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

function mapAttachment(raw: Record<string, unknown>): UniLioAuthoringModuleAttachment {
  return {
    id: String(raw.id ?? raw.Id),
    fileName: String(raw.fileName ?? raw.FileName ?? ""),
    url: String(raw.url ?? raw.Url ?? ""),
    contentType: String(raw.contentType ?? raw.ContentType ?? ""),
    sizeBytes: Number(raw.sizeBytes ?? raw.SizeBytes ?? 0),
    sortOrder: Number(raw.sortOrder ?? raw.SortOrder ?? 0),
  };
}

function mapModule(raw: Record<string, unknown>): UniLioAuthoringModule {
  return {
    id: String(raw.id),
    sortOrder: Number(raw.sortOrder ?? 0),
    title: String(raw.title ?? ""),
    contentType: String(raw.contentType ?? "article"),
    contentUrl: raw.contentUrl ? String(raw.contentUrl) : null,
    durationMinutes: Number(raw.durationMinutes ?? 0),
    articleHtml: raw.articleHtml ? String(raw.articleHtml) : null,
    quizJson: raw.quizJson ? String(raw.quizJson) : null,
    quizPassingScore: raw.quizPassingScore != null ? Number(raw.quizPassingScore) : null,
    isCompleted: Boolean(raw.isCompleted),
    attachments: Array.isArray(raw.attachments)
      ? raw.attachments.map((item) => mapAttachment(item as Record<string, unknown>))
      : [],
  };
}

function mapAssessment(raw: Record<string, unknown>): UniLioAuthoringAssessment {
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    title: String(raw.title ?? raw.Title ?? ""),
    passingScore: Number(raw.passingScore ?? raw.PassingScore ?? 0),
    questionsJson: String(raw.questionsJson ?? raw.QuestionsJson ?? "[]"),
  };
}

function mapScormPackage(raw: Record<string, unknown>): UniLioScormPackageInfo {
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    moduleId: String(raw.moduleId ?? raw.ModuleId ?? ""),
    version: String(raw.version ?? raw.Version ?? "1.2"),
    manifestTitle: String(raw.manifestTitle ?? raw.ManifestTitle ?? ""),
    launchUrl: String(raw.launchUrl ?? raw.LaunchUrl ?? ""),
    scoCount: Number(raw.scoCount ?? raw.ScoCount ?? 1),
    originalFileName: String(raw.originalFileName ?? raw.OriginalFileName ?? ""),
    sizeBytes: Number(raw.sizeBytes ?? raw.SizeBytes ?? 0),
    uploadedAt: String(raw.uploadedAt ?? raw.UploadedAt ?? ""),
  };
}

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
    scormPassingScore: raw.scormPassingScore != null ? Number(raw.scormPassingScore) : null,
    scormPackage: raw.scormPackage
      ? mapScormPackage(raw.scormPackage as Record<string, unknown>)
      : null,
    modules: Array.isArray(raw.modules)
      ? raw.modules.map((m) => mapModule(m as Record<string, unknown>))
      : [],
    assessment: raw.assessment
      ? mapAssessment(raw.assessment as Record<string, unknown>)
      : null,
  };
}

export function useUniLioAuthoringCourses() {
  return useQuery({
    queryKey: [...AUTHORING_KEY, "courses"],
    queryFn: async () => {
      const res = await api.get<{ items: Record<string, unknown>[] }>("/unilio/authoring/courses");
      return (res.items ?? []).map((item) => ({
        id: String(item.id ?? item.Id),
        title: String(item.title ?? item.Title ?? ""),
        area: String(item.area ?? item.Area ?? ""),
        status: String(item.status ?? item.Status ?? ""),
        moduleCount: readApiNumber(item, "moduleCount"),
        submittedAt: readApiOptionalString(item, "submittedAt"),
        publishedAt: readApiOptionalString(item, "publishedAt"),
        enrolledCount: readApiNumber(item, "enrolledCount"),
        completedCount: readApiNumber(item, "completedCount"),
        avgRating: readApiNumber(item, "avgRating"),
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
        id: String(item.id ?? item.Id),
        title: String(item.title ?? item.Title ?? ""),
        area: String(item.area ?? item.Area ?? ""),
        status: String(item.status ?? item.Status ?? ""),
        moduleCount: readApiNumber(item, "moduleCount"),
        submittedAt: readApiOptionalString(item, "submittedAt"),
        publishedAt: readApiOptionalString(item, "publishedAt"),
        enrolledCount: readApiNumber(item, "enrolledCount"),
        completedCount: readApiNumber(item, "completedCount"),
        avgRating: readApiNumber(item, "avgRating"),
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

export function useWithdrawUniLioCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => api.post(`/unilio/authoring/courses/${courseId}/withdraw`, {}),
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

export function useUpdateUniLioModule(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, body }: { moduleId: string; body: UniLioUpsertModuleRequest }) =>
      api.put(`/unilio/authoring/courses/${courseId}/modules/${moduleId}`, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...AUTHORING_KEY, "course", courseId] }),
  });
}

export function useDeleteUniLioModule(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (moduleId: string) => api.delete(`/unilio/authoring/courses/${courseId}/modules/${moduleId}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...AUTHORING_KEY, "course", courseId] }),
  });
}

export function useUploadUniLioModuleAttachment(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, file }: { moduleId: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.upload<Record<string, unknown>>(
        `/unilio/authoring/courses/${courseId}/modules/${moduleId}/attachments`,
        formData,
      );
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...AUTHORING_KEY, "course", courseId] }),
  });
}

export function useDeleteUniLioModuleAttachment(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, attachmentId }: { moduleId: string; attachmentId: string }) =>
      api.delete(
        `/unilio/authoring/courses/${courseId}/modules/${moduleId}/attachments/${attachmentId}`,
      ),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...AUTHORING_KEY, "course", courseId] }),
  });
}

export function useUpsertUniLioCourseAssessment(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UniLioUpsertAssessmentRequest) =>
      api.put<Record<string, unknown>>(`/unilio/authoring/courses/${courseId}/assessment`, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...AUTHORING_KEY, "course", courseId] }),
  });
}

export function useDeleteUniLioCourseAssessment(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(`/unilio/authoring/courses/${courseId}/assessment`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...AUTHORING_KEY, "course", courseId] }),
  });
}

export function useUploadUniLioScormPackage(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, passingScore }: { file: File; passingScore?: number }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (passingScore != null) {
        formData.append("passingScore", String(passingScore));
      }
      return api.upload<Record<string, unknown>>(
        `/unilio/authoring/courses/${courseId}/scorm-package`,
        formData,
      );
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...AUTHORING_KEY, "course", courseId] }),
  });
}
