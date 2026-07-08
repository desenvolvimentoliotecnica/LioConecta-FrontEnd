import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import { mapCompassMetaFromApi } from "../compass/mapFromApi";
import { COMPASS_API_MOCK_META } from "../../config/compass/apiMockData";

export const COMPASS_META_QUERY_KEY = ["compass", "meta"] as const;

export function useCompassMeta() {
  const query = useQuery({
    queryKey: COMPASS_META_QUERY_KEY,
    queryFn: async () => mapCompassMetaFromApi(await api.get("/compass/meta")),
    enabled: !config.useMock,
    staleTime: 120_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(
    () => (config.useMock || query.isError ? COMPASS_API_MOCK_META : (query.data ?? COMPASS_API_MOCK_META)),
    [query.data, query.isError],
  );

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
  };
}
