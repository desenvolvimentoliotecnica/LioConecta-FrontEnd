import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";

export type UniLioScormRuntimeDto = {
  launchUrl: string;
  lessonStatus: string;
  scoreRaw?: number | null;
  scoreMin?: number | null;
  scoreMax?: number | null;
  suspendData?: string | null;
  lessonLocation?: string | null;
  studentId: string;
  studentName: string;
  passingScore?: number | null;
  courseCompletable: boolean;
};

export type UniLioScormRuntimeUpdate = {
  lessonStatus?: string;
  scoreRaw?: number | null;
  scoreMin?: number | null;
  scoreMax?: number | null;
  sessionTime?: string | null;
  lessonLocation?: string | null;
  suspendData?: string | null;
  cmiJson?: string | null;
  finish?: boolean;
};

function mapRuntime(raw: Record<string, unknown>): UniLioScormRuntimeDto {
  return {
    launchUrl: String(raw.launchUrl ?? raw.LaunchUrl ?? ""),
    lessonStatus: String(raw.lessonStatus ?? raw.LessonStatus ?? "not attempted"),
    scoreRaw: raw.scoreRaw != null ? Number(raw.scoreRaw) : null,
    scoreMin: raw.scoreMin != null ? Number(raw.scoreMin) : null,
    scoreMax: raw.scoreMax != null ? Number(raw.scoreMax) : null,
    suspendData: raw.suspendData ? String(raw.suspendData) : null,
    lessonLocation: raw.lessonLocation ? String(raw.lessonLocation) : null,
    studentId: String(raw.studentId ?? raw.StudentId ?? ""),
    studentName: String(raw.studentName ?? raw.StudentName ?? ""),
    passingScore: raw.passingScore != null ? Number(raw.passingScore) : null,
    courseCompletable: Boolean(raw.courseCompletable ?? raw.CourseCompletable),
  };
}

const RUNTIME_KEY = ["unilio", "scorm", "runtime"] as const;

export function useUniLioScormRuntime(courseId: string | undefined) {
  return useQuery({
    queryKey: [...RUNTIME_KEY, courseId],
    queryFn: async () =>
      mapRuntime(
        await api.get<Record<string, unknown>>(
          `/unilio/courses/${courseId}/scorm/runtime`,
        ),
      ),
    enabled: Boolean(courseId),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useUniLioScormRuntimeUpdate(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UniLioScormRuntimeUpdate) =>
      mapRuntime(
        await api.put<Record<string, unknown>>(
          `/unilio/courses/${courseId}/scorm/runtime`,
          body,
        ),
      ),
    onSuccess: (data) => {
      qc.setQueryData([...RUNTIME_KEY, courseId], data);
      void qc.invalidateQueries({ queryKey: [...RUNTIME_KEY, courseId] });
    },
  });
}
