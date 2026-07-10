import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  WorkerConnectivityDto,
  WorkerDefinitionDto,
  WorkerRunDetailDto,
  WorkerRunDto,
  WorkerTriggerResultDto,
} from "../types";

export const WORKERS_QUERY_KEY = ["admin", "workers"] as const;

export function useWorkerDefinitions() {
  return useQuery({
    queryKey: [...WORKERS_QUERY_KEY, "definitions"],
    queryFn: () => api.get<WorkerDefinitionDto[]>("/admin/workers"),
    retry: config.useMock ? 0 : 1,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useWorkersConnectivity() {
  return useQuery({
    queryKey: [...WORKERS_QUERY_KEY, "connectivity"],
    queryFn: () => api.get<WorkerConnectivityDto>("/admin/workers/connectivity"),
    retry: config.useMock ? 0 : 1,
    staleTime: 0,
    refetchInterval: 30_000,
    refetchOnMount: "always",
  });
}

export function useWorkerRuns(
  workerKey: string,
  limit = 20,
  enabled = true,
  pollWhileRunning = false,
) {
  return useQuery({
    queryKey: [...WORKERS_QUERY_KEY, workerKey, "runs", limit],
    queryFn: () =>
      api.get<WorkerRunDto[]>(`/admin/workers/${workerKey}/runs?limit=${limit}`),
    enabled: enabled && Boolean(workerKey),
    retry: config.useMock ? 0 : 1,
    refetchInterval: (query) => {
      if (!enabled) return false;
      if (pollWhileRunning) {
        const hasRunning = query.state.data?.some((run) => run.status === "Running");
        if (hasRunning) return 5000;
      }
      return 15_000;
    },
  });
}

export function useWorkerRunDetail(
  workerKey: string,
  runId: string | null,
  pollWhileRunning = false,
) {
  return useQuery({
    queryKey: [...WORKERS_QUERY_KEY, workerKey, "run", runId],
    queryFn: () =>
      api.get<WorkerRunDetailDto>(`/admin/workers/${workerKey}/runs/${runId}`),
    enabled: Boolean(workerKey && runId),
    refetchInterval: (query) => {
      if (!pollWhileRunning) return false;
      const status = query.state.data?.run.status;
      return status === "Running" ? 5000 : false;
    },
    retry: config.useMock ? 0 : 1,
  });
}

export function useTriggerWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workerKey: string) =>
      api.post<WorkerTriggerResultDto>(`/admin/workers/${workerKey}/trigger`, {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WORKERS_QUERY_KEY });
    },
  });
}
