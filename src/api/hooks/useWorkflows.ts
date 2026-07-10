import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";

export const WORKFLOWS_QUERY_KEY = ["rh", "workflows"] as const;

export type WorkflowStepDto = {
  id: string;
  stepKey: string;
  order: number;
  assigneeRole?: string | null;
  assigneePersonId?: string | null;
  assigneeName?: string | null;
  status: string;
  decidedBy?: string | null;
  decidedAt?: string | null;
  comment?: string | null;
};

export type WorkflowInstanceDto = {
  id: string;
  definitionKey: string;
  definitionName: string;
  subjectType: string;
  subjectId: string;
  subjectName?: string | null;
  status: string;
  payloadJson: string;
  createdByPersonId: string;
  createdAt: string;
  steps: WorkflowStepDto[];
};

export type CreateMovimentacaoMeritoDto = {
  subjectPersonId: string;
  cargo?: string | null;
  novoSalario?: number | null;
  justificativa?: string | null;
};

export function useWorkflowPendingForMe(enabled = true) {
  return useQuery({
    queryKey: [...WORKFLOWS_QUERY_KEY, "pending-for-me"],
    queryFn: () => api.get<WorkflowInstanceDto[]>("/rh/workflows/pending-for-me"),
    enabled,
    retry: config.useMock ? 0 : 1,
  });
}

export function useCreateMovimentacaoMerito() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMovimentacaoMeritoDto) =>
      api.post<WorkflowInstanceDto>("/rh/workflows/movimentacao-merito", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WORKFLOWS_QUERY_KEY });
    },
  });
}

export function useApproveWorkflowStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      instanceId,
      stepId,
      comment,
    }: {
      instanceId: string;
      stepId: string;
      comment?: string;
    }) =>
      api.post<WorkflowInstanceDto>(
        `/rh/workflows/${instanceId}/steps/${stepId}/approve`,
        { comment: comment ?? null },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WORKFLOWS_QUERY_KEY });
    },
  });
}

export function useRejectWorkflowStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      instanceId,
      stepId,
      comment,
    }: {
      instanceId: string;
      stepId: string;
      comment?: string;
    }) =>
      api.post<WorkflowInstanceDto>(
        `/rh/workflows/${instanceId}/steps/${stepId}/reject`,
        { comment: comment ?? null },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WORKFLOWS_QUERY_KEY });
    },
  });
}
