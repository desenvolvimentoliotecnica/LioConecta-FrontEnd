import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import type { PlannerConnectionTestResponse, TestPlannerConnectionRequest } from "../types";

export function useTestPlannerConnection() {
  return useMutation({
    mutationFn: (body: TestPlannerConnectionRequest) =>
      api.post<PlannerConnectionTestResponse>("/admin/planner/test", body),
  });
}
