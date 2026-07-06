import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import type { GlpiConnectionTestResponse, TestGlpiConnectionRequest } from "../types";

export function useTestGlpiConnection() {
  return useMutation({
    mutationFn: (body: TestGlpiConnectionRequest) =>
      api.post<GlpiConnectionTestResponse>("/admin/glpi/test", body),
  });
}
