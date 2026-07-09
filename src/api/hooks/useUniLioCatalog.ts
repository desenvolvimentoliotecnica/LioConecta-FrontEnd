import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import { mapUniLioCatalogFromApi } from "../unilio/mapFromApi";
import { buildMockCatalog } from "../../config/unilio/apiMockData";
import type { UniLioFilters } from "../../config/unilio/types";
import { unilioFiltersQueryKey, unilioFiltersToParams } from "./unilioQuery";

export function useUniLioCatalog(filters: UniLioFilters) {
  const query = useQuery({
    queryKey: unilioFiltersQueryKey(filters, ["catalog"]),
    queryFn: async () => {
      const params = unilioFiltersToParams(filters);
      const qs = params.toString();
      return mapUniLioCatalogFromApi(await api.get(`/unilio/catalog${qs ? `?${qs}` : ""}`));
    },
    enabled: !config.useMock,
    staleTime: 60_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(
    () =>
      config.useMock || query.isError
        ? mapUniLioCatalogFromApi(buildMockCatalog(filters))
        : (query.data ?? mapUniLioCatalogFromApi(buildMockCatalog(filters))),
    [filters, query.data, query.isError],
  );

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
  };
}
