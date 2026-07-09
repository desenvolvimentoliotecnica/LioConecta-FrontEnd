import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import { mapUniLioReportsFromApi } from "../unilio/mapFromApi";
import { buildMockReports } from "../../config/unilio/apiMockData";
import type { UniLioFilters } from "../../config/unilio/types";
import { unilioFiltersQueryKey, unilioFiltersToParams } from "./unilioQuery";

export function useUniLioReports(filters: UniLioFilters) {
  const query = useQuery({
    queryKey: unilioFiltersQueryKey(filters, ["reports"]),
    queryFn: async () => {
      const params = unilioFiltersToParams(filters);
      const qs = params.toString();
      return mapUniLioReportsFromApi(await api.get(`/unilio/reports/summary${qs ? `?${qs}` : ""}`));
    },
    enabled: !config.useMock,
    staleTime: 60_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(
    () =>
      config.useMock || query.isError
        ? mapUniLioReportsFromApi(buildMockReports(filters))
        : (query.data ?? mapUniLioReportsFromApi(buildMockReports(filters))),
    [filters, query.data, query.isError],
  );

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
  };
}
