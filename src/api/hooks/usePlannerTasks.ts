import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  CreatePlannerTaskRequest,
  PlannerBucketDto,
  PlannerTaskDto,
  PlannerTasksResponseDto,
  UpdatePlannerTaskRequest,
} from "../types";

export const PLANNER_QUERY_KEY = ["planner"] as const;

export function usePlannerTasks() {
  return useQuery({
    queryKey: [...PLANNER_QUERY_KEY, "tasks"],
    queryFn: () => api.get<PlannerTasksResponseDto>("/planner/tasks"),
    retry: config.useMock ? 0 : 1,
  });
}

export function usePlannerBuckets(enabled = true) {
  return useQuery({
    queryKey: [...PLANNER_QUERY_KEY, "buckets"],
    queryFn: () => api.get<PlannerBucketDto[]>("/planner/buckets"),
    enabled,
    retry: config.useMock ? 0 : 1,
  });
}

export function useCreatePlannerTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePlannerTaskRequest) =>
      api.post<PlannerTaskDto>("/planner/tasks", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PLANNER_QUERY_KEY });
    },
  });
}

export function useUpdatePlannerTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, body }: { taskId: string; body: UpdatePlannerTaskRequest }) =>
      api.patch<PlannerTaskDto>(`/planner/tasks/${encodeURIComponent(taskId)}`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PLANNER_QUERY_KEY });
    },
  });
}

export function useDeletePlannerTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) =>
      api.delete<void>(`/planner/tasks/${encodeURIComponent(taskId)}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PLANNER_QUERY_KEY });
    },
  });
}
