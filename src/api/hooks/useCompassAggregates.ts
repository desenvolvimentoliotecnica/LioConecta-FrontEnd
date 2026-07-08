import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import { mapCompassAggregatesFromApi } from "../compass/mapFromApi";
import type { CompassAggregateGroupBy } from "../types";
import { buildMockAggregates } from "../../config/compass/apiMockData";
import type { CompassFilters } from "../../config/compass/types";
import { compassFiltersQueryKey, compassFiltersToParams } from "./compassQuery";

export function useCompassAggregates(filters: CompassFilters, groupBy: CompassAggregateGroupBy) {
  const query = useQuery({
    queryKey: [...compassFiltersQueryKey(filters, ["aggregates"]), groupBy],
    queryFn: async () => {
      const params = compassFiltersToParams(filters, { groupBy });
      return mapCompassAggregatesFromApi(await api.get(`/compass/aggregates?${params.toString()}`));
    },
    enabled: !config.useMock,
    staleTime: 60_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(
    () =>
      config.useMock || query.isError
        ? buildMockAggregates(groupBy, filters)
        : (query.data ?? buildMockAggregates(groupBy, filters)),
    [filters, groupBy, query.data, query.isError],
  );

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
  };
}
