import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import { mapUniLioDashboardFromApi } from "../unilio/mapFromApi";
import { buildMockDashboard } from "../../config/unilio/apiMockData";
import type { UniLioFilters } from "../../config/unilio/types";
import { unilioFiltersQueryKey, unilioFiltersToParams } from "./unilioQuery";

export function useUniLioDashboard(filters: UniLioFilters) {
  const query = useQuery({
    queryKey: unilioFiltersQueryKey(filters, ["dashboard"]),
    queryFn: async () => {
      const params = unilioFiltersToParams(filters);
      const qs = params.toString();
      return mapUniLioDashboardFromApi(await api.get(`/unilio/dashboard${qs ? `?${qs}` : ""}`));
    },
    enabled: !config.useMock,
    staleTime: 60_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(
    () =>
      config.useMock || query.isError
        ? mapUniLioDashboardFromApi(buildMockDashboard(filters))
        : (query.data ?? mapUniLioDashboardFromApi(buildMockDashboard(filters))),
    [filters, query.data, query.isError],
  );

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
  };
}
