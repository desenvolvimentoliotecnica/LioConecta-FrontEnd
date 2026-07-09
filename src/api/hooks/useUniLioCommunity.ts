import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import { mapUniLioCommunityFromApi } from "../unilio/mapFromApi";
import { buildMockCommunity } from "../../config/unilio/apiMockData";
import type { UniLioFilters } from "../../config/unilio/types";
import { unilioFiltersQueryKey, unilioFiltersToParams } from "./unilioQuery";

export function useUniLioCommunity(filters: UniLioFilters) {
  const query = useQuery({
    queryKey: unilioFiltersQueryKey(filters, ["community"]),
    queryFn: async () => {
      const params = unilioFiltersToParams(filters);
      const qs = params.toString();
      return mapUniLioCommunityFromApi(await api.get(`/unilio/community${qs ? `?${qs}` : ""}`));
    },
    enabled: !config.useMock,
    staleTime: 60_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(
    () =>
      config.useMock || query.isError
        ? mapUniLioCommunityFromApi(buildMockCommunity(filters))
        : (query.data ?? mapUniLioCommunityFromApi(buildMockCommunity(filters))),
    [filters, query.data, query.isError],
  );

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
  };
}
