import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type { OrgChartSettingsDto, UpsertOrgChartSettingsRequest } from "../types";

export const ORG_CHART_SETTINGS_QUERY_KEY = ["admin", "org-chart", "settings"] as const;

export function useOrgChartSettings() {
  return useQuery({
    queryKey: ORG_CHART_SETTINGS_QUERY_KEY,
    queryFn: () => api.get<OrgChartSettingsDto>("/admin/org-chart/settings"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useSaveOrgChartSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertOrgChartSettingsRequest) =>
      api.put<OrgChartSettingsDto>("/admin/org-chart/settings", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ORG_CHART_SETTINGS_QUERY_KEY });
    },
  });
}
