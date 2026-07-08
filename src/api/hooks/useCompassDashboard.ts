import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import { mapCompassDashboardFromApi } from "../compass/mapFromApi";
import { buildMockDashboard } from "../../config/compass/apiMockData";
import type { CompassFilters } from "../../config/compass/types";
import { compassFiltersQueryKey, compassFiltersToParams } from "./compassQuery";

export function useCompassDashboard(filters: CompassFilters) {
  const query = useQuery({
    queryKey: compassFiltersQueryKey(filters, ["dashboard"]),
    queryFn: async () => {
      const params = compassFiltersToParams(filters);
      const qs = params.toString();
      return mapCompassDashboardFromApi(await api.get(`/compass/dashboard${qs ? `?${qs}` : ""}`));
    },
    enabled: !config.useMock,
    staleTime: 60_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(
    () =>
      config.useMock || query.isError
        ? buildMockDashboard(filters)
        : (query.data ?? buildMockDashboard(filters)),
    [filters, query.data, query.isError],
  );

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
  };
}
