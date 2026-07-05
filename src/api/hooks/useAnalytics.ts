import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import type { AnalyticsPeriod } from "../../config/analytics";
import type { AnalyticsSnapshotDto } from "../types";

export const ANALYTICS_QUERY_KEY = ["analytics"] as const;

export function useAnalyticsSnapshot(period: AnalyticsPeriod) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, "snapshot", period],
    queryFn: async (): Promise<AnalyticsSnapshotDto | null> => {
      if (config.useMock) return null;
      return api.get<AnalyticsSnapshotDto>(`/analytics/snapshot?period=${period}`);
    },
    retry: config.useMock ? 0 : 1,
  });
}
