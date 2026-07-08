import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import { mapCompassYtdFromApi } from "../compass/mapFromApi";
import { buildMockYtdPage } from "../../config/compass/apiMockData";
import type { CompassFilters } from "../../config/compass/types";
import { compassFiltersQueryKey, compassFiltersToParams } from "./compassQuery";

export type CompassYtdParams = {
  page?: number;
  pageSize?: number;
};

export function useCompassYtd(filters: CompassFilters, pagination: CompassYtdParams = {}) {
  const page = pagination.page ?? 1;
  const pageSize = pagination.pageSize ?? 25;

  const query = useQuery({
    queryKey: [...compassFiltersQueryKey(filters, ["ytd"]), page, pageSize],
    queryFn: async () => {
      const params = compassFiltersToParams(filters, { page, pageSize });
      return mapCompassYtdFromApi(await api.get(`/compass/ytd?${params.toString()}`));
    },
    enabled: !config.useMock,
    staleTime: 60_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(
    () =>
      config.useMock || query.isError
        ? buildMockYtdPage(page, pageSize, filters)
        : (query.data ?? buildMockYtdPage(page, pageSize, filters)),
    [filters, page, pageSize, query.data, query.isError],
  );

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
  };
}
