import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type { UniLioProgressDto } from "../types";
import type { UniLioProgressResult } from "../../config/unilio/types";

function mapProgress(raw: UniLioProgressDto): UniLioProgressResult {
  return {
    courseId: String(raw.courseId),
    progressPct: raw.progressPct,
    status: raw.status,
    courseCompleted: raw.courseCompleted,
  };
}

export function useUniLioProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, moduleId }: { courseId: string; moduleId: string }) => {
      if (config.useMock) {
        return {
          courseId,
          progressPct: 75,
          status: "in_progress",
          courseCompleted: false,
        } satisfies UniLioProgressResult;
      }

      const result = await api.post<UniLioProgressDto>(
        `/unilio/courses/${courseId}/modules/${moduleId}/complete`,
        {},
      );
      return mapProgress(result);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["unilio", "course", variables.courseId] });
      void queryClient.invalidateQueries({ queryKey: ["unilio", "dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["unilio", "compliance"] });
    },
  });
}
