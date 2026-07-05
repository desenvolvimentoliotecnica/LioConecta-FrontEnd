import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import { PONTO_PERIODS_QUERY_KEY } from "./usePonto";
import type {
  TotvsRmConfigurationDto,
  TotvsRmConnectionTestResponse,
  UpsertTotvsRmConfigurationRequest,
} from "../types";

export const TOTVS_RM_QUERY_KEY = ["admin", "totvs-rm"] as const;

export function useTotvsRmConfiguration() {
  return useQuery({
    queryKey: TOTVS_RM_QUERY_KEY,
    queryFn: () => api.get<TotvsRmConfigurationDto>("/admin/totvs-rm"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useSaveTotvsRmConfiguration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertTotvsRmConfigurationRequest) =>
      api.put<TotvsRmConfigurationDto>("/admin/totvs-rm", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TOTVS_RM_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PONTO_PERIODS_QUERY_KEY });
    },
  });
}

export function useTestTotvsRmConnection() {
  return useMutation({
    mutationFn: (body: UpsertTotvsRmConfigurationRequest) =>
      api.post<TotvsRmConnectionTestResponse>("/admin/totvs-rm/test", body),
  });
}
