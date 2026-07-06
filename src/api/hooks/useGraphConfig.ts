import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import type { GraphConnectionTestResponse, TestGraphConnectionRequest } from "../types";

export function useTestGraphConnection() {
  return useMutation({
    mutationFn: (body: TestGraphConnectionRequest) =>
      api.post<GraphConnectionTestResponse>("/admin/graph/test", body),
  });
}
